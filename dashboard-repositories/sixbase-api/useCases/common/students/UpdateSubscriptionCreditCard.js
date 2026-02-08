const DateHelper = require('../../../utils/helpers/date');
const PaymentService = require('../../../services/PaymentService');
const SQS = require('../../../queues/aws');
const uuid = require('../../../utils/helpers/uuid');
const ApiError = require('../../../error/ApiError');
const CardTokenPayment = require('../payments/CardTokenPayment');
const CreditCardHelper = require('../../../utils/helpers/CreditCard');
const StudentEmailRenewedSubcription = require('../../../services/email/student/renewedSubscription');
const StudentEmailFailedSubscription = require('../../../services/email/student/susbcriptionFailed');
const Card = require('../../cardVerification/Card');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const { creditCardBrandParser } = require('../../../utils/card');
const {
  findOneSubscription,
  updateSubscription,
} = require('../../../database/controllers/subscriptions');
const { capitalizeName, splitFullName } = require('../../../utils/formatters');
const { createCharge } = require('../../../database/controllers/charges');
const {
  createTransaction,
} = require('../../../database/controllers/transactions');
const { findTransactionTypeByKey } = require('../../../types/transactionTypes');
const {
  createSalesItemsTransactions,
} = require('../../../database/controllers/sales_items_transactions');
const models = require('../../../database/models/index');
const { findRulesTypesByKey } = require('../../../types/integrationRulesTypes');
const CostCentralRepository = require('../../../repositories/sequelize/CostCentralRepository');
const TaxesRepository = require('../../../repositories/sequelize/TaxesRepository');
const SalesSettingsRepository = require('../../../repositories/sequelize/SalesSettingsRepository');
const SalesFees = require('../../checkout/sales/SalesFees');

const processPayment = async (subscription, card_token, cvv) => {
  const [cost, payment] = await new SalesFees(
    CostCentralRepository,
    SalesSettingsRepository,
    TaxesRepository,
  ).calculate({
    id_user: subscription.product.producer.id,
    installments: 1,
    student_pays_interest: false,
    brand: subscription.credit_card.brand,
    sales_items: [{ price: subscription.plan.price, type: 1 }],
    payment_method: 'card',
  });
  const transaction_id = uuid.v4();
  const paymentData = await new CardTokenPayment(
    {
      transaction_id,
      price: cost.price_total,
    },
    {
      full_name: subscription.student.full_name,
      document_number: subscription.student.document_number,
      email: subscription.student.email,
      document_type: 'CPF',
    },
    {
      card_token,
      security_code: cvv,
    },
  ).execute();
  const { id: psp_id, status } = paymentData;
  if (status.label === 'paid') {
    await models.sequelize.transaction(async (t) => {
      const charge = await createCharge({
        id_user: subscription.product.producer.id,
        id_student: subscription.id_student,
        id_status: status.charge,
        id_sale: subscription.id_sale,
        psp_id,
        price: cost.price_total,
        payment_method: 'credit_card',
        installments: 1,
        paid_at: DateHelper().now(),
        id_subscription: subscription.id,
      });
      const mainTransaction = await createTransaction(
        {
          ...cost,
          uuid: transaction_id,
          method: 'card',
          psp_id,
          id_sale: subscription.id_sale,
          id_user: subscription.product.producer.id,
          id_type: findTransactionTypeByKey('cost').id,
          id_status: status.transaction,
          id_charge: charge.id,
        },
        t,
      );
      const transaction = await createTransaction(
        {
          ...payment,
          uuid: uuid.v4(),
          method: 'card',
          psp_id,
          id_sale: subscription.id_sale,
          id_user: subscription.product.producer.id,
          id_type: findTransactionTypeByKey('payment').id,
          id_status: status.transaction,
          id_charge: charge.id,
        },
        t,
      );

      await SQS.add('splitCommissions', {
        sale_id: subscription.id_sale_item,
        transaction_id: transaction.id,
        first_charge: false,
      });

      await createSalesItemsTransactions(
        {
          id_transaction: mainTransaction.id,
          id_sale_item: subscription.id_sale_item,
          t,
        },
        t,
      );

      await createSalesItemsTransactions(
        {
          id_transaction: transaction.id,
          id_sale_item: subscription.id_sale_item,
          t,
        },
        t,
      );
      const next_charge = DateHelper()
        .add(
          subscription.plan.frequency_quantity,
          subscription.plan.payment_frequency,
        )
        .format(DATABASE_DATE_WITHOUT_TIME);
      await updateSubscription(
        { id: subscription.id },
        { next_charge, next_attempt: null, attempt_count: 0 },
        t,
      );
    });
    await SQS.add('integrations', {
      id_product: subscription.product.id,
      eventName: 'renewedSubscription',
      data: {
        email: subscription.student.email,
        full_name: capitalizeName(subscription.student.email),
        phone: subscription.student.whatsapp,
        sale_id: subscription.id_sale_item,
      },
    });

    await SQS.add('webhookEvent', {
      id_product: subscription.product.id,
      id_sale_item: subscription.id_sale_item,
      id_user: subscription.id_user,
      id_event: findRulesTypesByKey('renewed-subscription').id,
    });
    await new StudentEmailRenewedSubcription({
      email: subscription.student.email,
      student_name: subscription.student.full_name,
      product_name: subscription.product.name,
      amount: cost.price_total,
    }).send();
  } else {
    await new StudentEmailFailedSubscription({
      email: subscription.student.email,
      student_name: subscription.student.full_name,
      product_name: subscription.product.name,
      amount: cost.price_total,
    }).send();
  }
};

module.exports = class UpdateSubscriptionCard {
  constructor(
    { card_holder, card_number, cvv, expiration_date },
    { subscription_uuid },
    { id, full_name, email, document_number },
    // eslint-disable-next-line default-param-last
    verified = false,
    dbTransaction,
  ) {
    const card = new CreditCardHelper({
      card_number,
      cvv,
      expiration_date,
      card_holder,
    });
    const fullCard = card.getFullData();
    this.id_student = id;
    this.student_name = full_name;
    this.email = email;
    this.document_number = document_number;
    this.card_holder = fullCard.card_holder;
    this.card_number = fullCard.card_number;
    this.cvv = fullCard.cvv;
    this.expiration_month = fullCard.date.expiration_month;
    this.expiration_year = fullCard.date.four_digits_year;
    this.expiration_full_date = expiration_date;
    this.subscription_uuid = subscription_uuid;
    this.verified = verified;
    this.dbTransaction = dbTransaction;
  }

  async execute() {
    const subscription = await findOneSubscription(
      {
        uuid: this.subscription_uuid,
        id_student: this.id_student,
      },
      this.dbTransaction,
    );
    if (!subscription) throw ApiError.badRequest('Assinatura não encontrada');
    const { firstName, lastName } = splitFullName(this.student_name);
    let cardIsValid = this.verified;
    if (!cardIsValid) {
      cardIsValid = await new Card(
        {
          first_name: firstName,
          last_name: lastName,
          email: this.email,
          document_number: this.document_number,
          id_student: this.id_student,
        },
        {
          card_number: this.card_number,
          cardholder_name: this.card_holder,
          cvv: this.cvv,
          expiration_date: this.expiration_full_date,
        },
        this.dbTransaction,
      ).verify();
    }

    if (!cardIsValid)
      throw ApiError.badRequest(
        'Não foi possível verificar este cartão, por favor, tente outro cartão',
      );
    const card_token = await PaymentService.storeCustomerCard({
      cardholder_name: this.card_holder,
      card_number: this.card_number,
      expiration_month: this.expiration_month,
      expiration_year: this.expiration_year,
      name: this.student_name,
    });
    if (subscription.attempt_count > 0) {
      await processPayment(subscription, card_token, this.cvv);
    }
    await updateSubscription(
      { uuid: this.subscription_uuid },
      {
        credit_card: {
          card_token,
          cvv: this.cvv,
          brand: creditCardBrandParser(this.card_number),
          last_four_digits: this.card_number.slice(-4),
          expiration_date: `${this.expiration_month}/${this.expiration_year}`,
        },
        payment_method: 'card',
      },
      this.dbTransaction,
    );
    return true;
  }
};

const DateHelper = require('../../../utils/helpers/date');
const ApiError = require('../../../error/ApiError');
const CanceledPlanStudentEmail = require('../../../services/email/StudentCanceledSubscription');
const SQS = require('../../../queues/aws');
const {
  findOneSubscription,
  updateSubscription,
} = require('../../../database/controllers/subscriptions');
const {
  findSubscriptionStatus,
} = require('../../../status/subscriptionsStatus');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const { capitalizeName } = require('../../../utils/formatters');
const { findRulesTypesByKey } = require('../../../types/integrationRulesTypes');
const Invision = require('../../integrations/Inivsion');
const Sales_items = require('../../../database/models/Sales_items');

module.exports = class {
  constructor({ subscription_uuid, id_student }) {
    this.id_student = id_student;
    this.subscription_uuid = subscription_uuid;
  }

  async execute() {
    const subscription = await findOneSubscription({
      uuid: this.subscription_uuid,
      id_student: this.id_student,
      id_status: findSubscriptionStatus('Ativo').id,
    });
    if (!subscription) throw ApiError.badRequest('Assinatura não encontrada');
    const email = {
      product_name: subscription.product.name,
      support_email: subscription.product.support_email,
      email: subscription.student.email,
      student_name: subscription.student.full_name,
      valid_date_until: DateHelper(subscription.next_charge).format(
        FRONTEND_DATE_WITHOUT_TIME,
      ),
      amount: subscription.plan.price,
    };
    await updateSubscription(
      { uuid: this.subscription_uuid },
      {
        id_status: findSubscriptionStatus('Cancelado').id,
        canceled_at: DateHelper().now(),
        valid_until: subscription.next_charge,
      },
    );
    await new CanceledPlanStudentEmail(email).send();
    const saleItem = await Sales_items.findOne({
      raw: true,
      attributes: ['id', 'id_sale', 'id_product', 'uuid'],
      where: {
        id_product: subscription.id_product,
        id_sale: subscription.id_sale,
      },
    });

    await SQS.add('integrations', {
      id_product: subscription.id_product,
      eventName: 'canceledSubscription',
      data: {
        email: subscription.student.email,
        phone: subscription.student.whatsapp,
        full_name: capitalizeName(subscription.student.full_name),
        sale_uuid: saleItem ? saleItem.uuid : subscription.sale_item.uuid,
      },
    });
    await SQS.add('webhookEvent', {
      id_product: subscription.id_product,
      id_sale_item: subscription.id_sale_item,
      id_user: subscription.id_user,
      id_event: findRulesTypesByKey('canceled-subscription').id,
    });
    await new Invision({
      id_product: subscription.id_product,
      id_user: subscription.id_user,
      student_email: subscription.student.email,
    }).execute();
    return true;
  }
};

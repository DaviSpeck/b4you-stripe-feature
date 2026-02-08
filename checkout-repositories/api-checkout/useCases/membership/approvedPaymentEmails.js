const ApprovedPaymentEmail = require('../../services/email/ApprovedPayment');
const FirstAccess = require('../../services/email/FirstAccess');
const SubscriptionRenewedEmail = require('../../services/email/student/renewedSubscription');
const {
  createStudentSession,
} = require('../../database/controllers/student_sessions');
const { PAYMENT_ONLY_TYPE } = require('../../types/productTypes');
const {
  findResetRequestByIdStudent,
} = require('../../database/controllers/resetStudent');

module.exports = class StudentEmailApprovedPayment {
  constructor({
    product,
    currentStudent,
    saleItem,
    costTransaction,
    renew = false,
  }) {
    this.product = product;
    this.currentStudent = currentStudent;
    this.saleItem = saleItem;
    this.costTransaction = costTransaction;
    this.renew = renew;
  }

  async execute() {
    if (this.renew) {
      await new SubscriptionRenewedEmail({
        email: this.currentStudent.email,
        student_name: this.currentStudent.full_name,
        product_name: this.product.name,
        amount: this.costTransaction.price,
      }).send();
      return '';
    }
    if (this.product.id_type === PAYMENT_ONLY_TYPE) {
      await new ApprovedPaymentEmail({
        email: this.currentStudent.email,
        full_name: this.currentStudent.full_name,
        product_name: this.product.name,
        amount: this.costTransaction.price,
        producer_name: this.product.nickname
          ? this.product.nickname
          : this.product.producer.full_name,
        support_email: this.product.support_email
          ? this.product.support_email
          : this.product.producer.email,
        sale_uuid: this.saleItem.uuid,
        type: 'external',
      }).send();
      return '';
    }
    if (this.currentStudent.status === 'pending') {
      const { uuid } = await findResetRequestByIdStudent(
        this.currentStudent.id,
      );
      await new FirstAccess({
        full_name: this.currentStudent.full_name,
        product_name: this.product.name,
        amount: this.costTransaction.price,
        producer_name: this.product.nickname
          ? this.product.nickname
          : this.product.producer.full_name,
        token: uuid,
        email: this.currentStudent.email,
        support_email: this.product.support_email
          ? this.product.support_email
          : this.product.producer.email,
        sale_uuid: this.saleItem.uuid,
      }).send();
      return `${process.env.URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${uuid}/first`;
    }
    const session = await createStudentSession({
      id_student: this.currentStudent.id,
    });
    await new ApprovedPaymentEmail({
      email: this.currentStudent.email,
      full_name: this.currentStudent.full_name,
      product_name: this.product.name,
      amount: this.costTransaction.price,
      producer_name: this.product.nickname
        ? this.product.nickname
        : this.product.producer.full_name,
      support_email: this.product.support_email
        ? this.product.support_email
        : this.product.producer.email,
      token: session.uuid,
      sale_uuid: this.saleItem.uuid,
    }).send();
    return `${process.env.URL_SIXBASE_MEMBERSHIP}/acessar/${session.uuid}`;
  }
};

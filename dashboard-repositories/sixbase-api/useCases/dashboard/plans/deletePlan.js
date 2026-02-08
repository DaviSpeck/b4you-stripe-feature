const { Op } = require('sequelize');
const ApiError = require('../../../error/ApiError');
const {
  findOnePlan,
  deletePlan,
} = require('../../../database/controllers/product_plans');
const {
  findAllSubscriptions,
  updateSubscription,
} = require('../../../database/controllers/subscriptions');
const {
  findSubscriptionStatus,
} = require('../../../status/subscriptionsStatus');
const {
  createEmailNotifications,
} = require('../../../database/controllers/email_notifications');
const {
  FRONTEND_DATE_WITHOUT_TIME,
  DATABASE_DATE_WITHOUT_TIME,
} = require('../../../types/dateTypes');
const DateHelper = require('../../../utils/helpers/date');

const {
  findEmailNotificationType,
} = require('../../../types/emailNotificationTypes');

const updateSubscriptions = async (subscriptions) => {
  const promises = [];
  subscriptions.forEach(({ id, next_charge }) => {
    promises.push(
      updateSubscription(
        { id },
        {
          valid_until: next_charge,
          id_status: findSubscriptionStatus('Cancelado').id,
        },
      ),
    );
  });
  await Promise.all(promises);
};

const generateStudentNotifications = async (subscriptions) => {
  const promises = [];
  subscriptions.forEach((subscription) => {
    const notification = {
      id_type: findEmailNotificationType('Plano Cancelado').id,
      id_student: subscription.id_student,
      variables: {
        valid_date: DateHelper(
          subscription.next_charge,
          DATABASE_DATE_WITHOUT_TIME,
        ).format(FRONTEND_DATE_WITHOUT_TIME),
        product_name: subscription.product.name,
        support_email: subscription.product.support_email,
      },
    };
    promises.push(createEmailNotifications(notification));
  });
  await Promise.all(promises);
};

module.exports = class {
  constructor(plan_uuid, id_product) {
    this.plan_uuid = plan_uuid;
    this.id_product = id_product;
  }

  async execute() {
    const plan = await findOnePlan({
      uuid: this.plan_uuid,
      id_product: this.id_product,
    });
    if (!plan) throw ApiError.badRequest('Plano de assinatura não encontrado');
    const activeSubscriptions = await findAllSubscriptions({
      id_plan: plan.id,
      id_status: { [Op.ne]: findSubscriptionStatus('Cancelado').id },
    });
    await generateStudentNotifications(activeSubscriptions);
    await updateSubscriptions(activeSubscriptions);
    await deletePlan({ id: plan.id });
  }
};

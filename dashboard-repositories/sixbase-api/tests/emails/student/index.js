const logger = require('../../../utils/logger');
require('custom-env').env();
const { rejectedRefund } = require('./RejectedRefundStudent');
const { approvedPayment } = require('./ApprovedPayment');
const { canceledPlan } = require('./CanceledPlan');
const { classroomAccess } = require('./ClassroomAccess');
const { firstAccess } = require('./FirstAccess');
const { canceledSubscription } = require('./CanceledSubscription');
const { updateBankAccount } = require('./UpdateBankAccount');
const { saleChargeback } = require('./SaleChargeback');
const { orderBumpOrUpsell } = require('./OrderBumpUpSell');
const { studentSubscriptionRenewed } = require('./RenewedSuscription');
const { studentSubscriptionFailed } = require('./SubscriptionFailed');
const { studentSubscriptionCanceled } = require('./ChargeFailedSubscription');
const { generatedBillet } = require('./GeneratedBillet');
const { studentSubscriptionNotify } = require('./NotifySubscription');
const { studentSubscriptionLateNotify } = require('./LateSubscription');

const file = process.argv[2];
const email = process.argv[3];

switch (file) {
  case 'rejected-refund':
    rejectedRefund(email);
    break;

  case 'approved-payment':
    approvedPayment(email);
    break;

  case 'canceled-plan':
    canceledPlan(email);
    break;

  case 'classroom-access':
    classroomAccess(email);
    break;

  case 'first-access':
    firstAccess(email);
    break;

  case 'canceled-subscription':
    canceledSubscription(email);
    break;

  case 'update-bank':
    updateBankAccount(email);
    break;

  case 'pix-billet-refund':
    saleChargeback(email);
    break;

  case 'orderbump-upsell':
    orderBumpOrUpsell(email);
    break;

  case 'subscription-renewed':
    studentSubscriptionRenewed(email);
    break;

  case 'subscription-failed':
    studentSubscriptionFailed(email);
    break;

  case 'subscription-canceled-worker':
    studentSubscriptionCanceled(email);
    break;

  case 'generated-billet':
    generatedBillet(email);
    break;

  case 'subscription-notify':
    studentSubscriptionNotify(email);
    break;

  case 'subscription-notify-late':
    studentSubscriptionLateNotify(email);
    break;

  case 'all':
    approvedPayment(email);
    canceledPlan(email);
    canceledSubscription(email);
    classroomAccess(email);
    firstAccess(email);
    generatedBillet(email);
    orderBumpOrUpsell(email);
    rejectedRefund(email);
    saleChargeback(email);
    studentSubscriptionCanceled(email);
    studentSubscriptionFailed(email);
    studentSubscriptionLateNotify(email);
    studentSubscriptionNotify(email);
    studentSubscriptionRenewed(email);
    updateBankAccount(email);
    break;

  default:
    logger.error('Arquivo de email não encontrado');
}

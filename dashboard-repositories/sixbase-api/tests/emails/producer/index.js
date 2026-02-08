require('custom-env').env();
const logger = require('../../../utils/logger');
const { approvedAffiliate } = require('./ApprovedAffiliate');
const { blockedAffiliate } = require('./BlockedAffiliate');
const { canceledCoproduction } = require('./CanceledCoproduction');
const { changeCommissionAffiliate } = require('./ChangeCommissionAffiliate');
const { confirmedPaymentSale } = require('./ConfirmedSale');
const { confirmedWithdrawal } = require('./ConfirmedWithdrawal');
const { deniedWithdrawal } = require('./DeniedWithdrawal');
const { forgotPassword } = require('./ForgotPassword');
const { inviteCoproduction } = require('./InviteCoproduction');
const { inviteTeam } = require('./InviteTeam');
const { newAffiliate } = require('./NewAffiliate');
const { pendingAffiliate } = require('./PendingAffiliate');
const { pendingAffiliateInvite } = require('./PendingInviteAffiliate');
const { pendingDocuments } = require('./PendingDocuments');
const { rejectedAffiliate } = require('./RejectedAffiliate');
const { studentRequestRefund } = require('./StudentRequestedRefund');
const { producerRefundRequested } = require('./RefundRequested');
const { producerRefundRejected } = require('./RefundRejected');
const { studentRequestPending } = require('./StudentRequestPending');
const { welcome } = require('./UserWelcome');
const {
  studentRequestRefundSubscription,
} = require('./SubscricripitonRequestedRefund');
const {
  canceledCoproductionInvite,
} = require('./CanceledInvitePendingCoproduction');

const file = process.argv[2];
const email = process.argv[3] || 'daniloctg@msn.com';

switch (file) {
  case 'welcome':
    welcome(email);
    break;

  case 'approved-affiliate':
    approvedAffiliate(email);
    break;

  case 'confirmed-sale':
    confirmedPaymentSale(email);
    break;

  case 'forgot-password':
    forgotPassword(email);
    break;

  case 'blocked-affiliate':
    blockedAffiliate(email);
    break;

  case 'canceled-coproduction':
    canceledCoproduction(email);
    break;

  case 'invite-coproductions':
    inviteCoproduction(email);
    break;

  case 'change-commission':
    changeCommissionAffiliate(email);
    break;

  case 'pending-invite-coproduction':
    canceledCoproductionInvite(email);
    break;

  case 'invite-team':
    inviteTeam(email);
    break;

  case 'pending-affiliate':
    pendingAffiliate(email);
    break;

  case 'new-affiliate':
    newAffiliate(email);
    break;

  case 'rejected-affiliate':
    rejectedAffiliate(email);
    break;

  case 'pending-invite-affiliate':
    pendingAffiliateInvite(email);
    break;

  case 'student-request-refund':
    studentRequestRefund(email);
    break;

  case 'student-request-refund-subscription':
    studentRequestRefundSubscription(email);
    break;

  case 'confirmed-withdrawal':
    confirmedWithdrawal(email);
    break;

  case 'denied-withdrawal':
    deniedWithdrawal(email);
    break;

  case 'pending-documents':
    pendingDocuments(email);
    break;

  case 'refund-requested':
    producerRefundRequested(email);
    break;

  case 'refund-rejected':
    producerRefundRejected(email);
    break;

  case 'student-request-pending':
    studentRequestPending(email);
    break;

  case 'all':
    approvedAffiliate(email);
    blockedAffiliate(email);
    canceledCoproduction(email);
    canceledCoproductionInvite(email);
    changeCommissionAffiliate(email);
    confirmedPaymentSale(email);
    confirmedWithdrawal(email);
    deniedWithdrawal(email);
    forgotPassword(email);
    inviteCoproduction(email);
    inviteTeam(email);
    newAffiliate(email);
    pendingAffiliate(email);
    pendingAffiliateInvite(email);
    pendingDocuments(email);
    producerRefundRejected(email);
    rejectedAffiliate(email);
    studentRequestPending(email);
    studentRequestRefund(email);
    studentRequestRefundSubscription(email);
    welcome(email);
    break;

  default:
    logger.error('Arquivo de email não encontrado');
}

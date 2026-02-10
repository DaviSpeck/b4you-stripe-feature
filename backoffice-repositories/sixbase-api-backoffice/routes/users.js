const express = require('express');

const router = express.Router();
const UserController = require('../controllers/users');
const WithdrawalsController = require('../controllers/withdrawals');
const UserBalancesController = require('../controllers/balances');
const UserCoproductionsController = require('../controllers/coproductions');
const AffiliatesController = require('../controllers/affiliates');
const ReferralUsersController = require('../controllers/referralUsers');
const { findUserKycs } = require('../controllers/kyc');
const validateSchema = require('../middlewares/validate-dto');
const feesSchema = require('../schemas/users/fees');
const updateEmailSchema = require('../schemas/updateEmail');
const updateDocumenSchema = require('../schemas/updateDocumentNumber');
const updateActiveSchema = require('../schemas/toggleActive');
const internationalGovernanceSchema = require('../schemas/users/internationalGovernance');

router.get('/', UserController.findUsers);

router.get('/user_bank_accounts/all', UserController.findUserBankAccounts);

router.put(
  '/user_bank_accounts/:id/approve',
  UserController.approveUserBankAccount,
);

router.put(
  '/user_bank_accounts/:id/reject',
  UserController.rejectUserBankAccount,
);

router.get('/pagarme/report/count', UserController.findPagarme);

router.get('/pagarme/report/data/filters', UserController.findPagarmeProducers);

router.get('/export', UserController.exportUsers);

router.get('/balances', UserController.findUsersBalances);

router.get('/balances/export', UserController.exportUsersBalances);

router.get('/referral', ReferralUsersController.findReferralUsers);
router.get(
  '/referral/:userUuid',
  ReferralUsersController.findReferralUserDetails,
);
router.put(
  '/referral/:userUuid/status',
  ReferralUsersController.updateReferralUserStatus,
);
router.put(
  '/referral/:userUuid/disabled',
  ReferralUsersController.updateReferralDisabled,
);

router.get('/:userUuid', UserController.findUser);

router.get('/:userUuid/withdrawals', WithdrawalsController.findUserWithdrawals);

router.get(
  '/:userUuid/withdrawals/info',
  WithdrawalsController.findWithdrawalPspId,
);

router.put('/:userUuid', UserController.updateUser);

router.get('/:userUuid/generate-access', UserController.generateAccess);

router.get('/:userUuid/withdrawals/export', WithdrawalsController.exportToXlsx);

router.get('/:userUuid/kyc', findUserKycs);

router.get('/:userUuid/balances', UserBalancesController.findUserBalances);

router.get('/:userUuid/notes', UserController.getNotes);

router.get('/:userUuid/block-notes', UserController.getUserBlockNotes);

router.get('/:userUuid/notes/:noteUuid/history', UserController.getNoteHistory);
router.get('/:userUuid/metrics', UserController.getMetrics);

router.get('/:userUuid/pagarme-balance', UserController.getPagarmeBalance);

router.get('/:userUuid/pagarme-balance', UserController.getPagarmeBalance);

router.get(
  '/:userUuid/recipient-balances',
  UserController.getRecipientBalances,
);

router.post('/:userUuid/notes', UserController.createNote);

router.delete('/:userUuid/notes/:id', UserController.deleteNote);

router.get(
  '/:userUuid/transactions/filters',
  UserBalancesController.findSaleFilters,
);

router.get(
  '/:userUuid/transactions',
  UserBalancesController.findUserTransactions,
);

router.get(
  '/:userUuid/transactions/metrics',
  UserBalancesController.findUserMetrics,
);

router.put(
  '/:userUuid/withdrawal',
  UserBalancesController.updateBlockWithdrawal,
);
router.get(
  '/:userUuid/automation/block-withdrawal',
  UserBalancesController.getAutoBlockStatus,
);
router.put(
  '/:userUuid/automation/block-withdrawal',
  UserBalancesController.updateAutoBlockStatus,
);

router.get('/transactions/:saleUuid', UserBalancesController.getSaleData);

router.get('/:userUuid/coproductions', UserCoproductionsController.get);

router.get('/:userUuid/affiliates', AffiliatesController.get);

router.put(
  '/:userUuid/fees',
  validateSchema(feesSchema),
  UserController.updateUsersFees,
);

router.put(
  '/:userUuid/change-email',
  validateSchema(updateEmailSchema),
  UserController.changeEmail,
);

router.put(
  '/:userUuid/change-document',
  validateSchema(updateDocumenSchema),
  UserController.changeDocument,
);

router.put(
  '/:userUuid/toggle-active',
  validateSchema(updateActiveSchema),
  UserController.toggleActive,
);

router.put('/:userUuid/remove-cnpj', UserController.removeCNPJ);

router.put('/:userUuid/manager', UserController.updateManager);

router.patch('/:userUuid/awards/block', UserController.blockAwardEligibility);
router.patch(
  '/:userUuid/awards/unblock',
  UserController.unblockAwardEligibility,
);

router.get(
  '/:userUuid/upsell-native',
  UserController.getUpsellNative,
);
router.patch(
  '/:userUuid/upsell-native/enable',
  UserController.enableUpsellNative,
);
router.patch(
  '/:userUuid/upsell-native/disable',
  UserController.disableUpsellNative,
);

router.get(
  '/:userUuid/international-governance',
  UserController.getInternationalGovernance,
);
router.patch(
  '/:userUuid/international-governance',
  validateSchema(internationalGovernanceSchema),
  UserController.updateInternationalGovernance,
);

router.get('/reactivation/producers', UserController.listReactivationProducers);
router.patch(
  '/reactivation/producers/:userUuid',
  UserController.updateReactivationStatus,
);
router.post(
  '/reactivation/producers/reset',
  UserController.resetReactivationStatuses,
);
router.get(
  '/reactivation/producers/report',
  UserController.generateReactivationReport,
);

module.exports = router;

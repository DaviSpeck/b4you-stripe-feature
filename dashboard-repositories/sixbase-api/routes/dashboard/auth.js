const express = require('express');
const auth = require('../../middlewares/auth');
const validateDTO = require('../../middlewares/validate-dto');
const loginDTO = require('../../dto/auth/login');
const forgotPasswordDTO = require('../../dto/auth/forgotPassword');
const changePasswordDTO = require('../../dto/auth/changePassword');
const changeLoggedUserPasswordDTO = require('../../dto/auth/chageLoggedUserPassword');

const {
  validateAuth,
  validateRecoveryPassword,
  validateToken,
  isThereTooManyRequests,
  isThereACollaborator,
} = require('../../middlewares/validatorsAndAdapters/auth');
const {
  changeAccountController,
  changePasswordUserController,
  changeUserPasswordController,
  forgotUserPasswordController,
  isProducerLoggedController,
  loginController,
  loginMerlinController,
  studentProducerSessionController,
  userLogoutController,
  validateTokenUserController,
  generateBackofficeAuth,
  generateMobileLoginLinkController,
  generateMobileAuth,
} = require('../../controllers/auth');

const router = express.Router();

router.post(
  '/login',
  validateDTO(loginDTO),
  isThereTooManyRequests,
  validateAuth,
  loginController,
);

router.post(
  '/login-merlin',
  validateDTO(loginDTO),
  isThereTooManyRequests,
  validateAuth,
  loginMerlinController,
);

router.get('/backoffice', generateBackofficeAuth);
router.get('/logout', auth, userLogoutController);

// Geração e consumo de link de login para app nativo
router.post('/native/link', auth, generateMobileLoginLinkController);
router.get('/native', generateMobileAuth);

router.get('/me', auth, isProducerLoggedController);

router.post(
  '/change-password',
  auth,
  validateDTO(changeLoggedUserPasswordDTO),
  changeUserPasswordController,
);

router.put(
  '/change-account/:account_id',
  auth,
  isThereACollaborator,
  changeAccountController,
);

router.get(
  '/validate/token/:token',
  validateToken('params'),
  validateTokenUserController,
);

router.post(
  '/forgotpassword',
  validateDTO(forgotPasswordDTO),
  validateRecoveryPassword,
  forgotUserPasswordController,
);

router.post(
  '/change/password',
  validateDTO(changePasswordDTO),
  validateToken(),
  changePasswordUserController,
);

router.get('/student', auth, studentProducerSessionController);

module.exports = router;

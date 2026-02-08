const express = require('express');
const auth = require('../../middlewares/auth_student');
const authDash = require('../../middlewares/auth');
const {
  validateToken,
  validateStudentTokenSession,
  validateRecoveryPassword,
  isThereTooManyRequests,
} = require('../../middlewares/validatorsAndAdapters/auth');
const {
  changePasswordController,
  forgotStudentPasswordController,
  isStudentLoggedController,
  studentLogoutController,
  studentLoginController,
  validateTokenController,
} = require('../../controllers/auth');

const router = express.Router();

const validateDto = require('../../middlewares/validate-dto');
const loginDTO = require('../../dto/auth/login');
const creatorSchoolSchema = require('../../dto/auth/creator-school');
const changePasswordDTO = require('../../dto/auth/changePassword');
const forgotPasswordDTO = require('../../dto/auth/forgotPassword');
const {
  validateAuthStudent,
} = require('../../middlewares/validatorsAndAdapters/auth');
const {
  creatorSchoolController,
} = require('../../controllers/creator-school/creator-school');

router.post(
  '/login',
  validateDto(loginDTO),
  isThereTooManyRequests,
  validateAuthStudent,
  studentLoginController,
);

router.get(
  '/validate/token/:token',
  validateToken('params'),
  validateTokenController,
);

router.get(
  '/validate/login/:token',
  validateStudentTokenSession('params'),
  studentLoginController,
);

router.post(
  '/change/password',
  validateDto(changePasswordDTO),
  validateToken(),
  changePasswordController,
);

router.post(
  '/forgotpassword',
  validateDto(forgotPasswordDTO),
  validateRecoveryPassword,
  forgotStudentPasswordController,
);

router.get('/logout', auth, studentLogoutController);

router.get('/me', auth, isStudentLoggedController);

router.post(
  '/creator-school',
  authDash,
  validateDto(creatorSchoolSchema),
  creatorSchoolController,
);

module.exports = router;

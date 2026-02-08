const express = require('express');

const router = express.Router();
const multer = require('multer');
const Encrypter = require('../../utils/helpers/encrypter');
const logger = require('../../utils/logger');
const multerImagesConfig = require('../../config/multer/configs/images');
const updatePasswordDTO = require('../../dto/students/updatePassword');
const updateStudantDto = require('../../dto/students/updateStudent');
const updateStudentProfileDTO = require('../../dto/students/updateProfile');
const updateBankAccountDTO = require('../../dto/students/updateBankAccount');
const validateImageUpload = require('../../middlewares/files/imageUpload');
const ApiError = require('../../error/ApiError');
const FileManager = require('../../services/FileManager');
const validateDto = require('../../middlewares/validate-dto');
const { updateStudent } = require('../../database/controllers/students');
const {
  deleteStudentAvatarController,
  getStudentProfile,
  updateAvatarController,
  updatePasswordController,
  updateProfileController,
  updateBankAccountController,
} = require('../../controllers/membership/student');
const {
  validateStudentPassword,
  validateStudentDocument,
} = require('../../middlewares/validatorsAndAdapters/students');
const {
  validateFile,
} = require('../../middlewares/validatorsAndAdapters/common');

router.put(
  '/',
  validateImageUpload,
  multer(multerImagesConfig).fields([{ name: 'profile_img', maxCount: 1 }]),
  validateDto(updateStudantDto),
  async (req, res, next) => {
    const { id, profile_picture_key } = req.student;
    const {
      address,
      credit_card,
      document_number,
      document_type,
      full_name,
      password,
      whatsapp,
    } = req.body;
    let student = null;
    try {
      const hashedPassword = await Encrypter.hash(password);
      const studentObj = {
        address,
        credit_card,
        document_number,
        document_type,
        full_name,
        password: hashedPassword,
        whatsapp,
      };

      if (req.files.profile_img) {
        studentObj.profile_picture = req.files.profile_img[0].location;
        const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
        await FileManagerInstance.deleteFile(profile_picture_key);
      }
      student = await updateStudent(id, studentObj);
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ level: 'error', message: `${error.stack || error}` });
      } else {
        logger.error({ level: 'error', message: error });
      }
      return next(
        ApiError.internalServerError('Internal error, PUT: /student/'),
      );
    }
    return res.status(200).send(student);
  },
);

router.put(
  '/profile',
  validateDto(updateStudentProfileDTO),
  validateStudentDocument,
  updateProfileController,
);

router.put(
  '/password',
  validateDto(updatePasswordDTO),
  validateStudentPassword,
  updatePasswordController,
);

router.put(
  '/avatar',
  validateImageUpload,
  multer(multerImagesConfig).single('profile_picture'),
  validateFile,
  updateAvatarController,
);

router.delete('/avatar', deleteStudentAvatarController);

router.put(
  '/bank-account',
  validateDto(updateBankAccountDTO),
  updateBankAccountController,
);

router.get('/profile', getStudentProfile);

module.exports = router;

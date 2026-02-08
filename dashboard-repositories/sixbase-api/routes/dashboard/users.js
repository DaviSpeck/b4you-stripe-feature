const express = require('express');
const multer = require('multer');
const yup = require('yup');
const validateDto = require('../../middlewares/validate-dto');
const auth = require('../../middlewares/auth');
const multerImagesConfig = require('../../config/multer/configs/images');
// const multerDocumentsConfig = require('../../config/multer/configs/documents');
const UserDto = require('../../dto/users/createUser');
const updateEmail = require('../../dto/users/updateEmail');
const updateEmailToken = require('../../dto/users/updateEmailTokens');
const updateAddressDTO = require('../../dto/users/updateAddress');
const updateBankAccountDTO = require('../../dto/users/updateBankAccount');
const updateBankAccountCNPJDTO = require('../../dto/users/updateBankAccountCNPJ');
const updateBiographyDTO = require('../../dto/users/updateBiography');
const updatePasswordDTO = require('../../dto/users/updatePassword');
const updateCompanyDTO = require('../../dto/users/updateCompanyData');
const validateImageUpload = require('../../middlewares/files/imageUpload');

const router = express.Router();

const {
  createUserController,
  deleteUserAvatarController,
  getCurrentUserController,
  getVerifiedInfoController,
  updateCompanyDataController,
  updateProfileController,
  updateUserAvatarController,
  updateUserPasswordController,
  uploadDocumentsController,
  getUserFeesController,
  updateEmailController,
  updateEmailTokensController,
  updateBankCnpjController,
  getUserBalances,
  getUserManagerController,
} = require('../../controllers/dashboard/user');
const {
  validateUserPassword,
  validateBodyData,
} = require('../../middlewares/validatorsAndAdapters/user');
const {
  validateFile,
} = require('../../middlewares/validatorsAndAdapters/common');
const { updateUser, findUser } = require('../../database/controllers/users');
const Forms = require('../../database/models/Forms');
const FormAnswers = require('../../database/models/Form_answers');
const ApiError = require('../../error/ApiError');
const onboarding = require('../../dto/users/onboarding');
const { rawDocument } = require('../../utils/formatters');
const Users = require('../../database/models/Users');

router.post('/', validateDto(UserDto), createUserController);

router.get('/profile/fees', auth, getUserFeesController);

router.put(
  '/profile/address',
  auth,
  validateDto(updateAddressDTO),
  validateBodyData,
  updateProfileController,
);

router.put('/profile/address-prize', auth, async (req, res, next) => {
  const {
    body,
    user: { id: id_user },
  } = req;
  try {
    const schema = yup.object().shape({
      zipcode: yup.string().required(),
      street: yup.string().required(),
      number: yup.string().required(),
      complement: yup.string(),
      neighborhood: yup.string().required(),
      city: yup.string().required(),
      state: yup.string().required(),
    });
    try {
      await schema.validate(body);
    } catch (error) {
      return next(
        ApiError.badRequest(
          'Ao atualizar um endereço, não é possível enviar campos nulos.',
        ),
      );
    }
    await Users.update(
      { prize_address: body },
      {
        where: {
          id: id_user,
        },
      },
    );

    return res.status(200).send(body);
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    return res.sendStatus(500);
  }
});

router.put(
  '/profile/bankaccount',
  auth,
  validateDto(updateBankAccountDTO),
  validateBodyData,
  updateProfileController,
);

router.put(
  '/profile/bankaccount/cnpj',
  auth,
  validateDto(updateBankAccountCNPJDTO),
  validateBodyData,
  updateBankCnpjController,
);

router.put(
  '/profile/general',
  auth,
  validateDto(updateBiographyDTO),
  validateBodyData,
  updateProfileController,
);

router.put(
  '/profile/password',
  auth,
  validateDto(updatePasswordDTO),
  validateUserPassword,
  updateUserPasswordController,
);

router.put(
  '/profile/avatar',
  auth,
  validateImageUpload,
  multer(multerImagesConfig).single('profile_picture'),
  validateFile,
  updateUserAvatarController,
);

router.delete('/profile/avatar', auth, deleteUserAvatarController);

router.get('/profile', auth, getCurrentUserController);

router.get('/manager', auth, getUserManagerController);

router.post('/verify-id', auth, uploadDocumentsController);

router.put(
  '/company',
  auth,
  validateDto(updateCompanyDTO),
  updateCompanyDataController,
);

router.get('/verify-id', auth, getVerifiedInfoController);

router.use(
  '/notifications-settings',
  auth,
  require('./notifications_settings'),
);

router.put('/email', auth, validateDto(updateEmail), updateEmailController);

router.post(
  '/email-update',
  auth,
  validateDto(updateEmailToken),
  updateEmailTokensController,
);

router.put(
  '/onboarding',
  auth,
  validateDto(onboarding),
  async (req, res, next) => {
    const {
      body,
      user: { id: id_user },
    } = req;
    try {
      const {
        instagram,
        tiktok,
        document_number = null,
        user_type,
        ...rest
      } = body;

      // Atualizar dados de usuário (instagram, tiktok, document_number)
      const userData = {
        instagram,
        tiktok,
      };

      if (document_number) {
        const raw = rawDocument(document_number);
        const alreadyHasAnUser = await findUser({
          document_number: raw,
        });

        if (alreadyHasAnUser) throw ApiError.badRequest('CPF em uso');
        userData.document_number = raw;
      }

      await updateUser(id_user, userData);

      // Salvar dados de onboarding em form_answers (nova estrutura)
      if (user_type) {
        // Determinar form_type: 2 para creator, 3 para marca
        const form_type = user_type === 'creator' ? 2 : 3;

        // Buscar formulário ativo
        const activeForm = await Forms.findOne({
          where: {
            form_type,
            is_active: 1,
          },
          order: [['created_at', 'DESC']],
        });

        if (!activeForm) {
          throw ApiError.badRequest('Formulário ativo não encontrado');
        }

        // Salvar cada campo como form_answer
        const formData = rest; // Todos os campos exceto instagram, tiktok, document_number, user_type

        // Usar Promise.all para processar em paralelo
        const savePromises = Object.entries(formData)
          .filter(([, value]) => value !== null && value !== undefined)
          .map(async ([key, value]) => {
            // Verificar se já existe answer para esta key
            const existingAnswer = await FormAnswers.findOne({
              where: {
                id_user,
                id_form: activeForm.id,
                key,
              },
            });

            if (existingAnswer) {
              // Atualizar
              return existingAnswer.update({
                value: String(value),
              });
            }
            // Criar novo
            return FormAnswers.create({
              id_user,
              id_form: activeForm.id,
              key,
              value: String(value),
            });
          });

        await Promise.all(savePromises);
      }

      return res.sendStatus(200);
    } catch (error) {
      if (error instanceof ApiError) return res.status(error.code).send(error);
      return next(
        ApiError.internalServerError(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
          error,
        ),
      );
    }
  },
);

router.delete('/', auth, async (req, res, next) => {
  const {
    owner: { id: id_user, email },
  } = req;
  try {
    // eslint-disable-next-line
    console.log('Deletando conta id => ', id_user);
    // eslint-disable-next-line
    console.log('Deletando conta email => ', email);
    await updateUser(id_user, { active: false });
    req.session.destroy();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

router.get('/balance', auth, getUserBalances);

module.exports = router;

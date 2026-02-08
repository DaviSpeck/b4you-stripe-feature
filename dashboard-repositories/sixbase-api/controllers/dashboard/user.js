const fs = require('fs');
// const consultarCNPJ = require('consultar-cnpj');
const { CnpjaOpen } = require('@cnpja/sdk');
const yup = require('yup');
const ApiError = require('../../error/ApiError');
const CreateUserUseCase = require('../../useCases/dashboard/CreateUser');
const SerializeUser = require('../../presentation/dashboard/user');
const UserSerializer = require('../../presentation/users');
const SerializeVerifiedInfo = require('../../presentation/dashboard/verifiedDocumentsInfo');
const UpdateCompanyDataUseCase = require('../../useCases/dashboard/users/UpdateCompanyCNPJData');
const DeleteAvatarImageUseCase = require('../../useCases/dashboard/users/DeleteAvatarImage');
const SerializeUserFees = require('../../presentation/dashboard/userFees');
const MailService = require('../../services/MailService');
const { blockedIPs } = require('../../types/antifraudList');
const rawData = require('../../database/rawData');
const { rawDocument } = require('../../utils/formatters');
const {
  updateUser,
  findUserByID,
  findUser,
  findUserByEmailOrDocument,
} = require('../../database/controllers/users');
const {
  findLastPendingByUser,
} = require('../../database/controllers/user_bank_accounts');
const {
  saveOnSession,
  resolveUserPermissions,
  saveManyToSession,
} = require('../common');
const { resolveImageFromBuffer } = require('../../utils/files');
const Encrypter = require('../../utils/helpers/encrypter');
const Image = require('../../utils/helpers/images');
const {
  findWithdrawalSettings,
} = require('../../database/controllers/withdrawals_settings');
const { validateAndFormatDocument } = require('../../utils/validations');
const {
  findOrCreateNotificationsSettings,
} = require('../../database/controllers/notifications_settings');
const SalesSettingsRepository = require('../../repositories/sequelize/SalesSettingsRepository');
const UserHistoryRepository = require('../../repositories/sequelize/UserHistoryRepository');
const UserRepository = require('../../repositories/sequelize/UserRepository');
const RequestUpdateUserEmail = require('../../useCases/dashboard/users/RequestUpdateEmail');
const UpdateUserEmail = require('../../useCases/dashboard/users/UpdateEmail');
const logger = require('../../utils/logger');
const date = require('../../utils/helpers/date');
const Users = require('../../database/models/Users');
const Users_backoffice = require('../../database/models/Users_backoffice');
const aws = require('../../queues/aws');
const PagarMe = require('../../services/payments/Pagarme');
const { sequelize } = require('../../database/models');
const UpdateBankAccountRequest = require('../../useCases/dashboard/users/UpdateBankAccountRequest');
const UpdateCompanyBankAccountRequest = require('../../useCases/dashboard/users/UpdateCompanyBankAccountRequest');

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};

const validateIP = (ip, email) => {
  if (blockedIPs.includes(ip)) {
    console.log('IP bloqueado', ip, email);
    throw new Error(`Error 0x001`);
  }
  return true;
};

const updateUserOnSessionAndReturnCurrentUser = async (
  id_user,
  session,
  permissions,
) => {
  const currentUser = await findUserByID(id_user);
  const rawUser = rawData(currentUser);
  rawUser.permissions = permissions;
  await saveOnSession(session, rawUser, 'user');
  return currentUser;
};

const updateUserPasswordController = async (req, res, next) => {
  const {
    owner: { id, permissions },
  } = req;
  const { new_password } = req.body;
  try {
    const hashedPassword = await Encrypter.hash(new_password);
    await updateUser(id, {
      password: hashedPassword,
    });
    await updateUserOnSessionAndReturnCurrentUser(id, req.session, permissions);
    return res.status(200).send({ success: true, message: 'Senha atualizada' });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const updateUserAvatarController = async (req, res, next) => {
  const {
    owner: { id, permissions },
    file,
  } = req;
  try {
    const fileBuffer = await Image.formatImageProducer(
      file.path,
      Image.CONFIG.AVATAR_PRODUCER,
    );
    const { file: url, key } = await resolveImageFromBuffer(
      fileBuffer,
      file.key,
    );
    fs.unlinkSync(file.path);

    await updateUser(id, {
      profile_picture: url,
      profile_picture_key: key,
    });
    await updateUserOnSessionAndReturnCurrentUser(id, req.session, permissions);
    return res.status(200).send({
      success: true,
      message: 'Foto do perfil atualizada',
      profile_picture: url,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const createUserController = async (req, res, next) => {
  const { b4youReferral } = req.cookies;
  const { email, full_name, password, document_number, whatsapp } = req.body;
  const { type } = req.query;
  const { ip } = req;

  try {
    validateIP(ip, email);
    const isThereAnUserWithEmail = await findUser({
      email,
    });
    if (isThereAnUserWithEmail)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'E-mail já está em uso',
        }),
      );
    const rawDocumentNumber = rawDocument(document_number);
    const isThereAnUserWithCPF = await findUser({
      document_number: rawDocumentNumber,
    });
    if (isThereAnUserWithCPF)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'CPF já está em uso',
        }),
      );
    const [first_name, ...last_name] = full_name.split(' ');
    const createdUser = await new CreateUserUseCase({
      document_number: rawDocumentNumber,
      email,
      first_name: first_name.trim().toLowerCase(),
      last_name: last_name.join(' ').trim(),
      password,
      whatsapp,
      b4youReferral,
      ...(type === 'dreams' && { user_type: 3 }),
      ...(type === 'attracione' && { user_type: 4 }),
    }).create();
    createdUser.permissions = resolveUserPermissions();
    const sessionData = [
      { key: 'user', value: createdUser },
      { key: 'owner', value: createdUser },
    ];
    saveManyToSession(req.session, sessionData);
    createdUser.collaborations = [];
    return res.status(200).send(new UserSerializer(createdUser).adapt());
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
};

const createUserMobileController = async (req, res, next) => {
  const { email, document_number, first_name, last_name, password, whatsapp } =
    req.body;
  try {
    const { rawDocument: validDocument } =
      validateAndFormatDocument(document_number);
    const isThereAnUser = await findUserByEmailOrDocument({
      email,
      document_number: validDocument,
    });
    if (isThereAnUser)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Conta já em uso',
        }),
      );
    const createdUser = await new CreateUserUseCase({
      document_number: rawDocument,
      email,
      first_name,
      last_name,
      password,
      whatsapp,
    }).create();
    return res.status(200).send(new UserSerializer(createdUser).adapt());
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
};

const getCurrentUserController = async (req, res, next) => {
  const {
    owner: { id },
  } = req;
  try {
    const currentUser = await findUserByID(id);
    const salesSettings = await SalesSettingsRepository.find(currentUser.id);
    const withdrawalSettings = await findWithdrawalSettings({
      id_user: currentUser.id,
    });
    const notificationsSettings = await findOrCreateNotificationsSettings(id);

    const lastPending = await findLastPendingByUser(id);

    let bank_account_pending_kind = null;
    if (lastPending) {
      bank_account_pending_kind = lastPending.is_company ? 'pj' : 'pf';
    }

    return res.status(200).send(
      new SerializeUser({
        ...rawData(currentUser),
        salesSettings: rawData(salesSettings),
        withdrawalSettings,
        notificationsSettings,
        bank_account_pending_approval: !!lastPending,
        bank_account_pending_kind,
        bank_account_pending_at: lastPending ? lastPending.created_at : null,
      }).adapt(),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const updateProfileController = async (req, res, next) => {
  const {
    owner: { id: id_user, permissions },
    data,
  } = req;
  try {
    if (req.route.path.includes('profile/address')) {
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
        await schema.validate(data);
      } catch (error) {
        return next(
          ApiError.badRequest(
            'Ao atualizar um endereço, não é possível enviar campos nulos.',
          ),
        );
      }
    }
    const { first_name, last_name, birth_date } = data;
    if (first_name && last_name) {
      data.full_name = `${first_name} ${last_name}`;
    }
    if (birth_date && date(birth_date).isAfter(date().now())) {
      throw ApiError.badRequest('Data Inválida');
    }

    let bankAccount = null;
    if (req.path === '/profile/bankaccount') {
      const useCase = new UpdateBankAccountRequest(id_user, data);
      bankAccount = await useCase.execute();
    }

    await updateUser(id_user, data);
    const currentUser = await updateUserOnSessionAndReturnCurrentUser(
      id_user,
      req.session,
      permissions,
    );
    return res.status(200).send(
      new SerializeUser({
        ...rawData(currentUser),
        bank_account_pending_approval: bankAccount?.pending_approval,
      }).adapt(),
    );
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
};

const updateBankCnpjController = async (req, res, next) => {
  const {
    owner: { id: id_user, permissions },
    data,
  } = req;
  try {
    const useCase = new UpdateCompanyBankAccountRequest(id_user, data);
    const bankAccount = await useCase.execute();

    await updateUser(id_user, data);
    const currentUser = await updateUserOnSessionAndReturnCurrentUser(
      id_user,
      req.session,
      permissions,
    );
    return res.status(200).send(
      new SerializeUser({
        ...rawData(currentUser),
        bank_account_pending_approval: bankAccount.pending_approval,
      }).adapt(),
    );
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
};

const uploadDocumentsController = async (req, res, next) => {
  const {
    owner: { id: id_user },
    body,
  } = req;
  try {
    const user = await Users.findOne({
      where: { id: id_user },
      attributes: ['id', 'pagarme_recipient_id', 'pagarme_recipient_id_3'],
    });

    let allVerified = true;

    if (user.pagarme_recipient_id) {
      try {
        const pagarmeInstance2 = new PagarMe('B4YOU_PAGARME_2');
        const pagarmeResponse = await pagarmeInstance2.getReceiver(
          user.pagarme_recipient_id,
        );
        if (pagarmeResponse.status === 'active') {
          await Users.update(
            { verified_pagarme: 3 },
            {
              where: {
                id: user.id,
              },
            },
          );
        } else {
          allVerified = false;
        }
      } catch (error) {
        allVerified = false;
        // eslint-disable-next-line
        console.log('erro ao consultar seller', error);
      }
    } else {
      allVerified = false;
    }

    if (user.pagarme_recipient_id_3) {
      try {
        const pagarmeInstance3 = new PagarMe('B4YOU_PAGARME_3');
        const pagarmeResponse = await pagarmeInstance3.getReceiver(
          user.pagarme_recipient_id_3,
        );
        if (pagarmeResponse.status === 'active') {
          await Users.update(
            { verified_pagarme_3: 3 },
            {
              where: {
                id: user.id,
              },
            },
          );
        } else {
          allVerified = false;
        }
      } catch (error) {
        allVerified = false;
        // eslint-disable-next-line
        console.log('erro ao consultar seller', error);
      }
    } else {
      allVerified = false;
    }
    if (allVerified) {
      return res.sendStatus(200);
    }

    const dataToUpdate = {
      agency: body.agency,
      account_number: body.account_number,
      account_type: body.account_type,
      bank_code: body.bank_code,
      birth_date: date(body.birth_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      occupation: body.occupation,
      street: body.street,
      number: body.number,
      complement: body.complement,
      neighborhood: body.neighborhood,
      city: body.city,
      state: body.state,
      zipcode: body.zipcode,
    };
    await Users.update(dataToUpdate, {
      where: {
        id: user.id,
      },
    });
    await aws.add('create-seller-pagarme', {
      id_user: user.id,
      is_company: false,
      data: {
        revenue: 1900,
        occupation: body.occupation,
      },
    });
    return res.sendStatus(200);
  } catch (error) {
    /* eslint-disable no-console */
    console.log(JSON.stringify(error));
    logger.error(error);
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
};

const getVerifiedInfoController = async (req, res, next) => {
  const {
    owner: { id: id_user },
  } = req;
  try {
    const currentUser = await findUserByID(id_user);
    return res.status(200).send(new SerializeVerifiedInfo(currentUser).adapt());
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
};

const updateCompanyDataController = async (req, res, next) => {
  const {
    owner: { id: id_user, permissions },
    body,
  } = req;
  try {
    let empresa = null;
    try {
      const cnpja = new CnpjaOpen();
      empresa = await cnpja.office.read({ taxId: rawDocument(body.cnpj) });
      console.log(empresa);
      body.company_name = empresa.company.name;
      body.trading_name = empresa?.alias ? empresa.alias : empresa.company.name;
      await new UpdateCompanyDataUseCase(id_user, body).execute();
      await updateUserOnSessionAndReturnCurrentUser(
        id_user,
        req.session,
        permissions,
      );
      await aws.add('create-seller-pagarme', {
        id_user,
        is_company: true,
      });
    } catch (error) {
      console.log(`erro nova lib consulta cnpj`, error);
    }
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
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
};

const deleteUserAvatarController = async (req, res, next) => {
  const {
    owner: { id: id_user },
  } = req;
  try {
    await new DeleteAvatarImageUseCase(id_user).execute();
    return res.status(200).send('Imagem de perfil removida com sucesso');
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getUserFeesController = async (req, res, next) => {
  const {
    owner: { id: id_user },
  } = req;

  try {
    const salesSettings = await SalesSettingsRepository.find(id_user);
    const withdrawalSettings = await findWithdrawalSettings({ id_user });
    return res
      .status(200)
      .send(
        new SerializeUserFees({ salesSettings, withdrawalSettings }).adapt(),
      );
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const updateEmailController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { email },
    ip,
  } = req;
  try {
    const agent = req.headers['user-agent'];
    await new RequestUpdateUserEmail(
      UserHistoryRepository,
      UserRepository,
      makeMailService(),
    ).execute({ id_user, new_email: email, ip, agent });
    return res
      .status(200)
      .send({ success: true, message: 'Solicitação de email enviada' });
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
};

const updateEmailTokensController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { current_token, new_token },
    ip,
  } = req;
  try {
    const agent = req.headers['user-agent'];
    await new UpdateUserEmail(
      UserHistoryRepository,
      UserRepository,
      makeMailService(),
    ).execute({ id_user, current_token, new_token, ip, agent });
    req.session.destroy();
    return res.status(200).send({ sucess: true });
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
};

const getUserBalances = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { page = 0, size = 10 },
  } = req;

  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * limit;

    const commissions = await sequelize.query(
      `
      SELECT 
        release_date, 
        SUM(amount) AS amount
      FROM commissions
      WHERE id_user = :id_user
        AND id_status = 2
      GROUP BY release_date
      ORDER BY release_date 
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { id_user, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const [countResult] = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM (
        SELECT release_date
        FROM commissions
        WHERE id_user = :id_user
          AND id_status = 2
        GROUP BY release_date
      ) AS grouped
      `,
      {
        replacements: { id_user },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const total = countResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).send({
      page: parseInt(page, 10),
      size: limit,
      total,
      totalPages,
      data: commissions,
    });
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
};

const getUserManagerController = async (req, res, next) => {
  const {
    owner: { id },
  } = req;

  try {
    const user = await Users.findByPk(id, {
      include: [
        {
          model: Users_backoffice,
          as: 'manager',
          required: false,
          attributes: ['phone'],
        },
      ],
      attributes: ['id', 'id_manager'],
    });

    if (!user) {
      throw ApiError.notFound('Usuário não encontrado');
    }

    if (!user.manager || !user.id_manager) {
      return res.status(200).json({
        has_manager: false,
        manager: null,
      });
    }

    return res.status(200).json({
      has_manager: true,
      manager: {
        phone: user.manager.phone,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  getUserFeesController,
  createUserController,
  deleteUserAvatarController,
  getCurrentUserController,
  getVerifiedInfoController,
  updateCompanyDataController,
  updateProfileController,
  updateUserAvatarController,
  updateUserPasswordController,
  uploadDocumentsController,
  updateEmailController,
  updateEmailTokensController,
  createUserMobileController,
  updateBankCnpjController,
  getUserBalances,
  getUserManagerController,
};

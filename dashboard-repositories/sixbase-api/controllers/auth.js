const jwt = require('jsonwebtoken');
const { QueryTypes } = require('sequelize');
const Cache = require('../config/Cache');
const ApiError = require('../error/ApiError');
const UserSerializer = require('../presentation/users');
const StudentSerializer = require('../presentation/membership/students');
const StudentTokenSerializer = require('../presentation/membership/auth');
const SerializeUserToken = require('../presentation/dashboard/resetToken');
const Encrypter = require('../utils/helpers/encrypter');
const ForgotPasswordEmail = require('../services/email/ForgotPassword');
const { serializePermissions } = require('../presentation/common');
const { capitalizeName } = require('../utils/formatters');
const FormAnswers = require('../database/models/Form_answers');
const {
  createResetStudentPassword,
  deleteResetRequest,
  findResetRequestByIdStudent,
} = require('../database/controllers/resetStudent');
const {
  findResetRequestByIdUser,
  deleteResetUserRequest,
  createResetUserPassword,
} = require('../database/controllers/resetUser');
const {
  updateStudent,
  findStudent,
} = require('../database/controllers/students');
const {
  updateUser,
  findUserByUUID,
  findUserOnboardingProfile,
} = require('../database/controllers/users');
const {
  saveOnSession,
  resolveUserPermissions,
  saveManyToSession,
} = require('./common');
const { findUserByID } = require('../database/controllers/users');
const UsersTotalCommission = require('../database/models/UsersTotalCommission');
const Token = require('../utils/helpers/token');
const User_login_logs = require('../database/models/User_login_logs');

function serializeRequest(req) {
  delete req.body.password;
  return {
    method: req.method || null,
    originalUrl: req.originalUrl || null,
    url: req.url || null,
    baseUrl: req.baseUrl || null,
    path: req.path || null,
    headers: req.headers || null,
    query: req.query || null,
    params: req.params || null,
    body: req.body || null,
    ip: req.ip || null,
    protocol: req.protocol || null,
    hostname: req.hostname || null,
    secure: req.secure || null,
    xhr: req.xhr || null,
    cookies: req.cookies || null,
    signedCookies: req.signedCookies || null,
    subdomains: req.subdomains || null,
  };
}

const generateBackofficeAuth = async (req, res) => {
  const { token } = req.query;
  try {
    const isValid = jwt.verify(token, process.env.TOKEN_ACCESS_BACKOFFICE);
    const { user } = isValid;
    const loginUser = await findUserByUUID(user);
    loginUser.permissions = resolveUserPermissions();
    const sessionData = [
      { key: 'user', value: loginUser },
      { key: 'owner', value: loginUser },
    ];
    saveManyToSession(req.session, sessionData);
    user.collaborations = [];
    return res.status(200).send(new UserSerializer(loginUser).adapt());
  } catch (error) {
    return res.status(400).send('ooooops');
  }
};

const resolveCollaborations = (collaborations) => {
  if (!collaborations || !Array.isArray(collaborations)) return [];
  return collaborations.map(({ producer, permissions }) => ({
    ...producer,
    permissions: serializePermissions(permissions),
  }));
};

const ONEWEEKINMINUTES = 7 * 24 * 60;

// Gera um token temporário para o app nativo abrir a WebView já logada
const generateMobileLoginLinkController = async (req, res, next) => {
  const { user } = req;

  try {
    if (!user) {
      throw ApiError.unauthorized('Usuário não autenticado');
    }

    const payload = {
      user: user.uuid,
    };

    const token = jwt.sign(payload, process.env.TOKEN_ACCESS_MOBILE, {
      expiresIn: '5m',
    });

    return res.status(200).send({
      token,
      expires_in: 300,
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

const loginController = async (req, res, next) => {
  const {
    user,
    body: { device_id },
  } = req;
  try {
    if (device_id) {
      await Cache.set(device_id, user.uuid, ONEWEEKINMINUTES);
      user.token = Token.generateToken(
        { email: user.email },
        60 * 60 * 24 * 30,
      );
    }
    user.permissions = resolveUserPermissions();
    const userCollaborations = resolveCollaborations(user.collaborations);
    const { collaborations: _, ...rest } = user;
    rest.id = user.id;
    const sessionData = [
      { key: 'user', value: rest },
      { key: 'owner', value: rest },
    ];
    saveManyToSession(req.session, sessionData);
    userCollaborations.push(rest);
    user.collaborations = userCollaborations;
    const totalReward = await UsersTotalCommission.findOne({
      raw: true,
      where: { id_user: user.id },
    });
    user.reward = totalReward ? totalReward.total : 0;
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userLogin = await User_login_logs.findOne({
        where: {
          ip,
          id_user: user.id,
        },
      });
      if (!userLogin)
        await User_login_logs.create({
          ip,
          id_user: user.id,
          params: serializeRequest(req),
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('error on save log ip user', error);
    }

    const onboarding = await findUserOnboardingProfile(user.id);
    user.onboarding_completed = Boolean(onboarding);

    return res.status(200).send(new UserSerializer(user).adapt());
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

const loginMerlinController = (req, res) =>
  res.status(200).json({ id_user: req.user.id });

const studentLoginController = async (req, res, next) => {
  const { student } = req;
  try {
    req.session.student = student;
    return res.status(200).send(new StudentSerializer(student).adapt());
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

const studentLogoutController = async (req, res, next) => {
  try {
    req.session.student = null;
    return res.sendStatus(200);
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

const userLogoutController = async (req, res, next) => {
  const { device_id } = req.query;

  try {
    if (device_id) {
      await Cache.del(device_id);
    }

    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) return reject(err);
        return resolve();
      });
    });

    res.clearCookie('connect.sid');
    return res.sendStatus(200);
  } catch (error) {
    return next(error);
  }
};

const validateTokenController = async (req, res, next) => {
  const { data } = req;
  try {
    return res.status(200).send({
      success: true,
      full_name: new StudentTokenSerializer(data).adapt(),
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

const validateTokenUserController = async (req, res, next) => {
  const { data } = req;
  try {
    return res.status(200).send({
      success: true,
      full_name: new SerializeUserToken(data).adapt(),
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

const changePasswordController = async (req, res, next) => {
  const {
    body: { password },
    data,
  } = req;

  try {
    const { id, id_student, student } = data;
    const hashedPassword = await Encrypter.hash(password);
    await updateStudent(id_student, {
      password: hashedPassword,
      status: 'active',
    });
    await deleteResetRequest(id);
    req.session.student = student;
    return res.status(200).send({ success: true, message: 'Senha alterada' });
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

const changePasswordUserController = async (req, res, next) => {
  const { password } = req.body;
  const { data } = req;
  try {
    const { id, id_user, user } = data;
    const hashedPassword = await Encrypter.hash(password);
    await updateUser(id_user, {
      password: hashedPassword,
      status: 'active',
    });
    await deleteResetUserRequest(id);
    user.permissions = resolveUserPermissions();
    const { collaborations: _, ...rest } = user;
    rest.id = user.id;
    const sessionData = [
      { key: 'user', value: rest },
      { key: 'owner', value: rest },
    ];
    saveManyToSession(req.session, sessionData);
    return res.status(200).send({ success: true, message: 'Senha alterada' });
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

const isStudentLoggedController = async (req, res, next) => {
  const { student } = req;
  try {
    if (student.producer_id)
      return res.status(200).send(new StudentSerializer(student).adapt());
    const currentStudent = await findStudent({ id: student.id });
    return res
      .status(200)
      .send(new StudentSerializer(currentStudent.toJSON()).adapt());
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

const sendMail = async ({ email, full_name }, token) => {
  const emailData = {
    full_name: capitalizeName(full_name),
    token,
    email,
    url: process.env.URL_SIXBASE_MEMBERSHIP,
  };
  await new ForgotPasswordEmail(emailData).send();
};

const forgotStudentPasswordController = async (req, res, next) => {
  const { entity: student } = req;
  let token;
  try {
    const alreadyExistsRecovery = await findResetRequestByIdStudent(student.id);
    if (alreadyExistsRecovery) {
      token = alreadyExistsRecovery.uuid;
    } else {
      const { uuid } = await createResetStudentPassword({
        id_student: student.id,
      });
      token = uuid;
    }
    await sendMail(student, token);
    return res
      .status(200)
      .send({ success: true, message: 'E-mail enviado com sucesso' });
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

const forgotUserPasswordController = async (req, res, next) => {
  const { entity: user } = req;
  let token;
  try {
    const alreadyExistsRecovery = await findResetRequestByIdUser(user.id);
    if (alreadyExistsRecovery) {
      token = alreadyExistsRecovery.uuid;
    } else {
      const { uuid } = await createResetUserPassword({
        id_user: user.id,
      });
      token = uuid;
    }
    const { first_name, last_name, email } = user;
    await new ForgotPasswordEmail({
      full_name: capitalizeName(`${first_name} ${last_name}`),
      email,
      token,
      url: process.env.URL_SIXBASE_DASHBOARD,
    }).send();
    return res
      .status(200)
      .send({ success: true, message: 'E-mail enviado com sucesso' });
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

const isProducerLoggedController = async (req, res, next) => {
  const {
    owner: { id },
    user: { current_account },
  } = req;
  try {
    const user = await findUserByID(id);
    user.permissions = resolveUserPermissions();
    const userCollaborations = resolveCollaborations(user.collaborations);
    const { collaborations: _, ...rest } = user;
    rest.id = user.id;
    const sessionData = [
      { key: 'user', value: rest },
      { key: 'owner', value: rest },
    ];
    saveManyToSession(req.session, sessionData);
    userCollaborations.push(rest);
    user.collaborations = userCollaborations;
    user.current_account = current_account;
    const totalReward = await UsersTotalCommission.findOne({
      raw: true,
      where: { id_user: user.id },
    });
    user.reward = totalReward ? totalReward.total : 0;

    // Determina tipo de usuário baseado em form_answers
    // form_type = 2 => creator, form_type = 3 => marca
    const [result] = await FormAnswers.sequelize.query(
      `SELECT f.form_type
       FROM form_answers fa
       JOIN forms f ON f.id = fa.id_form
       WHERE fa.id_user = :id_user
       AND f.is_active = 1
       ORDER BY fa.created_at DESC
       LIMIT 1`,
      {
        type: QueryTypes.SELECT,
        replacements: { id_user: user.id },
      }
    );

    user.type = result && result.form_type === 2 ? 'creator' : 'marca';
    const onboarding = await findUserOnboardingProfile(user.id);
    user.onboarding_completed = Boolean(onboarding);

    return res.status(200).send(new UserSerializer(user).adapt());
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

const changeAccountController = async (req, res) => {
  const { newUser } = req;
  const updatedUser = {
    ...newUser,
    current_account: newUser.current_account || newUser.uuid,
  };
  saveOnSession(req.session, updatedUser, 'user');
  return res.status(200).send(new UserSerializer(updatedUser).adapt());
};

const changeUserPasswordController = async (req, res, next) => {
  const {
    user: { id },
    body: { password, new_password, confirm_password },
  } = req;
  try {
    if (new_password !== confirm_password)
      throw ApiError.badRequest('Senhas não coincidem');
    const currentUser = await findUserByID(id);
    const validPassword = await Encrypter.compare(
      password,
      currentUser.password,
    );
    if (!validPassword)
      throw ApiError.badRequest(
        'Esta é sua senha atual. Por favor, crie uma nova.',
      );
    const userPassword = await Encrypter.hash(new_password);
    await updateUser(id, { password: userPassword });
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
};

const studentProducerSessionController = async (req, res, next) => {
  const {
    user: {
      id,
      full_name,
      email,
      uuid,
      document_number,
      profile_picture,
      bank_code,
      agency,
      account_number,
      account_type,
      operation,
      whatsapp,
    },
    query: { classroom_id = null },
  } = req;

  try {
    const student = {
      id: 0,
      full_name,
      email,
      uuid,
      document_number,
      profile_picture,
      status: 'active',
      first_name: full_name,
      producer_id: id,
      bank_code,
      agency,
      account_number,
      account_type,
      operation,
      whatsapp,
      classroom_id,
    };
    req.session.student = student;
    return res.status(200).send({ url: process.env.URL_SIXBASE_MEMBERSHIP });
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

// Consome o token do app nativo, cria a sessão da dashboard e retorna o usuário logado
const generateMobileAuth = async (req, res) => {
  const { token, device_id } = req.query;
  try {
    if (!token) {
      return res.status(400).send('Token não informado');
    }

    const isValid = jwt.verify(token, process.env.TOKEN_ACCESS_MOBILE);
    const { user } = isValid;

    const loginUser = await findUserByUUID(user);
    if (!loginUser) {
      return res.status(400).send('Usuário não encontrado');
    }

    loginUser.permissions = resolveUserPermissions();
    const sessionData = [
      { key: 'user', value: loginUser },
      { key: 'owner', value: loginUser },
    ];
    saveManyToSession(req.session, sessionData);

    if (device_id) {
      await Cache.set(device_id, loginUser.uuid, ONEWEEKINMINUTES);
    }

    loginUser.collaborations = [];

    const onboarding = await findUserOnboardingProfile(user.id);
    user.onboarding_completed = Boolean(onboarding);

    return res.status(200).send(new UserSerializer(loginUser).adapt());
  } catch (error) {
    return res.status(400).send('Token inválido ou expirado');
  }
};

module.exports = {
  changeUserPasswordController,
  changePasswordController,
  forgotStudentPasswordController,
  isStudentLoggedController,
  loginController,
  loginMerlinController,
  studentLogoutController,
  userLogoutController,
  studentLoginController,
  validateTokenController,
  isProducerLoggedController,
  forgotUserPasswordController,
  validateTokenUserController,
  changePasswordUserController,
  changeAccountController,
  studentProducerSessionController,
  generateBackofficeAuth,
  generateMobileLoginLinkController,
  generateMobileAuth,
};

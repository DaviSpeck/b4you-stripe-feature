const fs = require('fs');
const {
  updateUser,
  findUserByID,
} = require('../../database/controllers/users');
const ApiError = require('../../error/ApiError');
const SerializeUser = require('../../presentation/users');
const { banks } = require('../../utils/banks');
const { resolveImageFromBuffer } = require('../../utils/files');
const encrypter = require('../../utils/helpers/encrypter');
const Image = require('../../utils/helpers/images');

module.exports.updateProfile = async (req, res, next) => {
  const { body, user } = req;
  try {
    await updateUser(user.id, body);
    const currentUser = await findUserByID(user.id);
    return res.status(200).send(new SerializeUser(currentUser).adapt());
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

module.exports.getBanks = async (req, res) => res.status(200).send(banks);

module.exports.deleteBank = async (req, res, next) => {
  const { user } = req;
  try {
    await updateUser(user.id, {
      bank_code: null,
      agency: null,
      account_number: null,
      account_type: null,
      operation: null,
    });
    const currentUser = await findUserByID(user.id);
    return res.status(200).send(new SerializeUser(currentUser).adapt());
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

module.exports.updatePassword = async (req, res, next) => {
  const {
    user,
    body: { password, new_password },
  } = req;
  try {
    const isValid = await encrypter.compare(password, user.password);
    if (!isValid)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Senha atual inválida',
        }),
      );
    const hashedPassword = await encrypter.hash(new_password);
    await updateUser(user.id, {
      password: hashedPassword,
    });
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

module.exports.updateProfilePicture = async (req, res, next) => {
  const {
    user: { id },
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

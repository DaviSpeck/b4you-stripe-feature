const fs = require('fs');
const ApiError = require('../../error/ApiError');
const SerializeStudentProfile = require('../../presentation/membership/profile');
const UpdateBankAccountUseCase = require('../../useCases/membership/updateBankAccount');
const DeleteUserAvatarUseCase = require('../../useCases/membership/DeleteUserAvatar');
const StudentSerializer = require('../../presentation/membership/students');
const Encrypter = require('../../utils/helpers/encrypter');
const Image = require('../../utils/helpers/images');
const rawData = require('../../database/rawData');
const {
  updateStudent,
  findStudent,
} = require('../../database/controllers/students');
const { resolveImageFromBuffer } = require('../../utils/files');

const updateProfileController = async (req, res, next) => {
  const {
    student: { id },
  } = req;
  const { biography, whatsapp, full_name } = req.body;
  try {
    await updateStudent(id, {
      biography,
      full_name,
      whatsapp,
    });
    const currentStudent = await findStudent({ id });
    return res
      .status(200)
      .send(new StudentSerializer(rawData(currentStudent)).adapt());
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

const updateAvatarController = async (req, res, next) => {
  const {
    student: { id },
    file,
  } = req;

  try {
    const fileBuffer = await Image.formatImageStudent(
      file.path,
      Image.CONFIG.AVATAR_STUDENT,
    );
    const { file: url, key } = await resolveImageFromBuffer(
      fileBuffer,
      file.key,
    );
    fs.unlinkSync(file.path);
    await updateStudent(id, {
      profile_picture: url,
      profile_picture_key: key,
    });
    req.session.student.profile_picture = url;
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

const deleteStudentAvatarController = async (req, res, next) => {
  const { id } = req.student;
  try {
    await new DeleteUserAvatarUseCase(id).execute();
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

const updatePasswordController = async (req, res, next) => {
  const { id } = req.student;
  const { new_password } = req.body;
  try {
    const hashedPassword = await Encrypter.hash(new_password);
    await updateStudent(id, {
      password: hashedPassword,
    });
    req.session.student.password = hashedPassword;
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

const getStudentProfile = async (req, res, next) => {
  const { student } = req;
  try {
    let currentStudent = null;
    if (student.producer_id) {
      currentStudent = student;
    } else {
      currentStudent = await findStudent({ id: student.id });
    }
    return res
      .status(200)
      .send(new SerializeStudentProfile(currentStudent).adapt());
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

const updateBankAccountController = async (req, res, next) => {
  const { student } = req;
  try {
    await new UpdateBankAccountUseCase({
      id_student: student.id,
      bank: req.body,
    }).execute();
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

module.exports = {
  deleteStudentAvatarController,
  getStudentProfile,
  updateAvatarController,
  updatePasswordController,
  updateProfileController,
  updateBankAccountController,
};

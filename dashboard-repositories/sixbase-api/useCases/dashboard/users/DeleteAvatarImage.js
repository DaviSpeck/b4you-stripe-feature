const {
  findUserByID,
  updateUser,
} = require('../../../database/controllers/users');
const FileManager = require('../../../services/FileManager');
const ApiError = require('../../../error/ApiError');

module.exports = class {
  constructor(id_user) {
    this.id_user = id_user;
  }

  async execute() {
    const user = await findUserByID(this.id_user);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    if (!user.profile_picture_key)
      throw ApiError.badRequest('Usuário não possui foto de perfil');
    const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
    await FileManagerInstance.deleteFile(user.profile_picture_key);
    await updateUser(this.id_user, {
      profile_picture: null,
      profile_picture_key: null,
    });
  }
};

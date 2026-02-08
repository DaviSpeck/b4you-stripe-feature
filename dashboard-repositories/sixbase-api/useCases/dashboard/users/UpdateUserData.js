const ApiError = require('../../../error/ApiError');
const {
  findUserByID,
  updateUser,
} = require('../../../database/controllers/users');

module.exports = class UpdateUserData {
  constructor(id_user, data) {
    this.id_user = id_user;
    this.data = data;
  }

  async save() {
    const user = await findUserByID(this.id_user);
    if (!user) throw ApiError.badRequest('user not found');
    const keys = Object.keys(this.data);
    if (keys.length === 0) throw ApiError.badRequest('empty data');
    await updateUser(this.id_user, this.data);
  }
};

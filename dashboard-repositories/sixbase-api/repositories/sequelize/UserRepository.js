const Users = require('../../database/models/Users');

module.exports = class UserRepository {
  static async findByEmail(email) {
    const user = await Users.findOne({
      where: {
        email,
      },
    });

    if (user) return user.toJSON();
    return null;
  }

  static async findById(id) {
    const user = await Users.findOne({
      where: {
        id,
      },
    });

    if (user) return user.toJSON();
    return null;
  }

  static async update(where, data) {
    await Users.update(data, { where });
  }
};

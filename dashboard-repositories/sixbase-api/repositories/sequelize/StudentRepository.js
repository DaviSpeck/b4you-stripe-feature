const Students = require('../../database/models/Students');

module.exports = class UserRepository {
  static async findByEmail(email) {
    const user = await Students.findOne({
      where: {
        email,
      },
    });

    if (user) return user.toJSON();
    return null;
  }

  static async findById(id) {
    const student = await Students.findOne({
      where: {
        id,
      },
    });

    if (student) return student.toJSON();
    return null;
  }
};

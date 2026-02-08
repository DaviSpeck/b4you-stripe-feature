const User_History = require('../../database/models/User_History');

module.exports = class UserHistoryRepository {
  static async create(data) {
    const userHistory = await User_History.create(data);
    return userHistory;
  }

  static async update(where, data) {
    await User_History.update(data, { where });
  }

  static async find(where) {
    const userHistory = await User_History.findOne({ where });
    if (userHistory) return userHistory.toJSON();
    return null;
  }

  static async delete(where) {
    await User_History.destroy({ where });
    return null;
  }
};

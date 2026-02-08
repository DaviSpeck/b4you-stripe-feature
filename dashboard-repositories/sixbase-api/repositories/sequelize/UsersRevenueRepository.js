const { Op } = require('sequelize');
const UsersRevenue = require('../../database/models/UsersRevenue');
const date = require('../../utils/helpers/date');
const { DATABASE_DATE_WITHOUT_TIME } = require('../../types/dateTypes');

module.exports = class UsersRevenueRepository {
  static async sum30DaysTotal(id_user) {
    const sum = await UsersRevenue.sum('total', {
      where: {
        id_user,
        paid_at: {
          [Op.gte]: date().subtract(29, 'd').format(DATABASE_DATE_WITHOUT_TIME),
        },
      },
    });
    return sum;
  }
};

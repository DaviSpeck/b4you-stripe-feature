const Sequelize = require('sequelize');

class UserTotalCommission extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          references: {
            model: 'users',
            key: 'id',
          },
          type: Sequelize.BIGINT,
        },
        total: {
          type: Sequelize.DECIMAL(20, 2),
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        underscored: true,
        sequelize,
        modelName: 'users_total_commission',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
  }
}

module.exports = UserTotalCommission;

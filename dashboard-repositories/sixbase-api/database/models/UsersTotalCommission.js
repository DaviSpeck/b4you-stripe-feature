const Sequelize = require('sequelize');

module.exports = class UsersTotalCommission extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          unique: true,
        },
        total: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
      },
      {
        freezeTableName: true,
        underscored: true,
        sequelize,
        timestamps: false,
        modelName: 'users_total_commission',
      },
    );

    return this;
  }
};

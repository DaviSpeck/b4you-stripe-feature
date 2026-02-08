const Sequelize = require('sequelize');

module.exports = class CouponsUse extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        document_number: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        id_coupon: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            key: 'id',
            model: 'coupons',
          },
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'coupons_use',
        underscored: true,
      },
    );

    return this;
  }
};

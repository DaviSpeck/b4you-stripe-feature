import * as Sequelize from 'sequelize';

export class Coupons extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        coupon: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        restrict_offers: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        uuid: {
          type: Sequelize.UUID,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        expires_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'coupons',
        underscored: true,
        paranoid: true,
      }
    );

    return this;
  }
}

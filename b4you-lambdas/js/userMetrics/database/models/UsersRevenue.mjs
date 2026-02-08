import * as Sequelize from 'sequelize';

export class UsersRevenue extends Sequelize.Model {
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
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        paid_at: {
          type: Sequelize.DATEONLY,
        },
        total: Sequelize.DECIMAL(20, 2),
      },
      {
        freezeTableName: true,
        underscored: true,
        sequelize,
        timestamps: false,
        modelName: 'users_revenue',
      }
    );

    return this;
  }
}

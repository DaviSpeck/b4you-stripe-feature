import * as Sequelize from 'sequelize';

export class Commissions extends Sequelize.Model {
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
        id_status: {
          type: Sequelize.INTEGER,
        },
        amount: {
          type: Sequelize.DECIMAL(20, 2),
        },
        release_date: {
          type: Sequelize.DATEONLY,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
        },
        id_role: {
          type: Sequelize.INTEGER,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'commissions',
      }
    );

    return this;
  }
}

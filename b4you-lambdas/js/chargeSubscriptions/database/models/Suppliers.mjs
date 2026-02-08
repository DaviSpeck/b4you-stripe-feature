import * as Sequelize from 'sequelize';

export class Suppliers extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.BIGINT,
        },
        id_user: {
          type: Sequelize.BIGINT,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_status: {
          type: Sequelize.TINYINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        id_offer: {
          type: Sequelize.BIGINT,
          references: {
            model: 'product_offer',
            key: 'id',
          },
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
        rejected_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        sequelize,
        modelName: 'suppliers',
        paranoid: true,
      }
    );

    return this;
  }
}

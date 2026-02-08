import * as Sequelize from 'sequelize';

export class Affiliates extends Sequelize.Model {
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
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        commission: {
          type: Sequelize.DECIMAL(10, 2),
        },
        subscription_fee: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        subscription_fee_only: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        subscription_fee_commission: {
          type: Sequelize.DECIMAL(10, 2),
        },
        commission_all_charges: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        status: {
          type: Sequelize.INTEGER,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.BIGINT,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'affiliates',
      },
    );

    return this;
  }

}


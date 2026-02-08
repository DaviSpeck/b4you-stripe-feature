import * as Sequelize from 'sequelize';

export class Cart extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_offer: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        full_name: {
          type: Sequelize.STRING,
        },
        document_number: {
          type: Sequelize.STRING,
        },
        whatsapp: {
          type: Sequelize.STRING,
        },
        abandoned: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        modelName: 'cart',
      }
    );

    return this;
  }
}

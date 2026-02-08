import * as Sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export class Invoices extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
        },
        id_transaction: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
        },
        id_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_receiver: {
          type: Sequelize.BIGINT,
        },
        generate_in: {
          type: Sequelize.DATEONLY,
        },
        generated_at: {
          type: Sequelize.DATE,
        },
        id_user: {
          type: Sequelize.BIGINT,
        },
        id_plugin: {
          type: Sequelize.INTEGER,
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
        integration_response: {
          type: Sequelize.JSON,
        },
      },
      {
        hooks: {
          beforeCreate: (invoice) => {
            invoice.uuid = uuidv4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'invoices',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.sales, {
      through: models.sales_invoices,
      foreignKey: 'id_invoice',
    });
  }
}

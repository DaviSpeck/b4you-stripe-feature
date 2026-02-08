import * as Sequelize from 'sequelize';

export class Sales_invoices extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_invoice: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        sequelize,
        timestamps: false,
        modelName: 'sales_invoices',
      }
    );
    return this;
  }
  static associate(models) {
    this.hasOne(models.sales, {
      foreignKey: 'id',
      sourceKey: 'id_sale',
      foreignKey: 'id',
    });
    this.hasOne(models.invoices, {
      foreignKey: 'id',
      sourceKey: 'id_invoice',
      foreignKey: 'id',
    });
  }
}

const Sequelize = require('sequelize');

class Sales_invoices extends Sequelize.Model {
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
        paranoid: true,
        freezeTableName: true,
        sequelize,
        modelName: 'sales_invoices',
      },
    );

    return this;
  }
}

module.exports = Sales_invoices;

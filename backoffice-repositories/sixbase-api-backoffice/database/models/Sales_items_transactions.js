const Sequelize = require('sequelize');

class Sales_items_transactions extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_transaction: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'sales_items_transactions',
      },
    );

    return this;
  }
}

module.exports = Sales_items_transactions;

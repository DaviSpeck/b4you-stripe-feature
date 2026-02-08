

const table = 'coupons';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn(table, 'id_product', {
        type: Sequelize.BIGINT,
        references: {
          key: 'id',
          model: 'products',
        },
      }),
      queryInterface.addColumn(table, 'amount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      }),
      queryInterface.addColumn(table, 'payment_methods', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn(table, 'id_affiliate', {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          key: 'id',
          model: 'affiliates',
        },
      }),
      queryInterface.addColumn(table, 'first_sale_only', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(table, 'single_use_by_client', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(table, 'override_cookie', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(table, 'min_amount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: null,
      }),
      queryInterface.addColumn(table, 'min_items', {
        type: Sequelize.INTEGER,
        defaultValue: null,
      }),
      queryInterface.addColumn(table, 'free_shipping', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn(table, 'id_product'),
      queryInterface.removeColumn(table, 'amount'),
      queryInterface.removeColumn(table, 'payment_methods'),
      queryInterface.removeColumn(table, 'id_affiliate'),
      queryInterface.removeColumn(table, 'first_sale_only'),
      queryInterface.removeColumn(table, 'single_use_by_client'),
      queryInterface.removeColumn(table, 'override_cookie'),
      queryInterface.removeColumn(table, 'min_amount'),
      queryInterface.removeColumn(table, 'min_items'),
      queryInterface.removeColumn(table, 'free_shipping'),
    ]);
  },
};

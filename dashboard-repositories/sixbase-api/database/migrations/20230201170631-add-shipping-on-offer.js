module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'shipping_type', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      }),
      queryInterface.addColumn('product_offer', 'shipping_price', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      }),
      queryInterface.addColumn('product_offer', 'require_address', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'shipping_type'),
      queryInterface.removeColumn('product_offer', 'shipping_price'),
      queryInterface.removeColumn('product_offer', 'require_address'),
    ]);
  },
};

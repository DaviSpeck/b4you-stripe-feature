module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'price_upsell'),
      queryInterface.removeColumn('products', 'label_accept_upsell'),
      queryInterface.removeColumn('products', 'label_reject_upsell'),
      queryInterface.removeColumn('products', 'hex_button_upsell'),
      queryInterface.removeColumn('products', 'id_upsell'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'price_upsell', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      }),
      queryInterface.addColumn('products', 'label_accept_upsell', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'label_reject_upsell', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'hex_button_upsell', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('products', 'id_upsell', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
    ]);
  },
};

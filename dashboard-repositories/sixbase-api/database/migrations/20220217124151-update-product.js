module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'thankyou_page'),
      queryInterface.removeColumn('products', 'fire_purchase_on_billet'),
      queryInterface.removeColumn('products', 'customcode_thankyou'),
      queryInterface.removeColumn('products', 'customcode_billet'),
      queryInterface.addColumn('products', 'biography', {
        type: Sequelize.TEXT,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'thankyou_page', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'fire_purchase_on_billet', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'customcode_thankyou', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('products', 'customcode_billet', {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn('products', 'biography'),
    ]);
  },
};

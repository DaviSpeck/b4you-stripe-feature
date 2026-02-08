module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'products_ebooks',
      'allow_piracy_watermark',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    );
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products_ebooks', 'allow_piracy_watermark'),
    ]);
  },
};

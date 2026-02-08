module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('products', 'certificate_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.renameColumn('products', 'certificate_img', 'certificate'),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('products', 'certificate_key'),
      queryInterface.renameColumn('products', 'certificate', 'certificate_img'),
    ]);
  },
};

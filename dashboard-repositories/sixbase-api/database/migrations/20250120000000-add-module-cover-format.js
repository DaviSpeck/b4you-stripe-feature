module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'module_cover_format', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'vertical',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'module_cover_format');
  },
};

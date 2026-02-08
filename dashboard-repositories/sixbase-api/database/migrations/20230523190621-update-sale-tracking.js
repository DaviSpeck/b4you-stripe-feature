module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales_items', 'tracking_company', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'tracking_company'),
    ]);
  },
};

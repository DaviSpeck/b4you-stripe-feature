module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales_items', 'id_status', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('sales_items', 'id_status');
  },
};

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('sales', 'id_status');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('sales', 'id_status', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};

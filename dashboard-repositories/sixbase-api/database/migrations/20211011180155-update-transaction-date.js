module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('transactions', 'release_date', {
      type: Sequelize.DATEONLY,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('transactions', 'release_date', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },
};

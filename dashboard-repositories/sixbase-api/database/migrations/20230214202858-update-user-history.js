module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('user_history', 'id_student', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('user_history', 'id_user', {
        allowNull: true,
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('user_history', 'id_student'),
    ]);
  },
};

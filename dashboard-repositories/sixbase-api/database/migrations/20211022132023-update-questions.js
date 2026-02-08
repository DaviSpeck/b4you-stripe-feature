module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('questions', 'status', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('questions', 'team_member', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.removeColumn('questions', 'id_top_question'),
      queryInterface.removeColumn('questions', 'id_question'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('questions', 'status'),
      queryInterface.removeColumn('questions', 'team_member'),
      queryInterface.addColumn('questions', 'id_top_question', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('questions', 'id_question', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('verify_identity', 'details', {
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn('users', 'cnpj_details', {
        type: Sequelize.TEXT,
      }),
      queryInterface.removeColumn('users', 'status_documents'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('verify_identity', 'details'),
      queryInterface.removeColumn('user', 'cnpj_details'),
      queryInterface.addColumn('user', 'status_documents', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      }),
    ]);
  },
};

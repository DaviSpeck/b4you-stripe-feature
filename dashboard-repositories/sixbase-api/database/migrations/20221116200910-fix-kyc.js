module.exports = {
  up: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('users', 'id_documents')]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'id_documents', {
        type: Sequelize.INTEGER,
      }),
    ]);
  },
};

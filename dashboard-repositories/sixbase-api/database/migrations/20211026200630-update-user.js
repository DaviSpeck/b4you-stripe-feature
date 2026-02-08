module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'id_documents', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.renameColumn('users', 'account_verified', 'verified_id'),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('users', 'id_documents'),
      queryInterface.renameColumn('users', 'verified_id', 'account_verified'),
    ]);
  },
};

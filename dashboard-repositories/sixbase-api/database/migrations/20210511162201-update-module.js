module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('modules', 'id_user', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('modules', 'uuid', {
        type: Sequelize.UUID,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      await queryInterface.removeColumn('modules', 'id_user'),
      await queryInterface.removeColumn('modules', 'uuid'),
    ]);
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'affiliate_uuid', {
        type: Sequelize.UUID,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('users', 'affiliate_uuid')]);
  },
};

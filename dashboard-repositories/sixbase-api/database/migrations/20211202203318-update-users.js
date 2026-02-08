module.exports = {
  up: async (queryInterface) => {
    await Promise.all([queryInterface.removeColumn('users', 'affiliate_uuid')]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'affiliate_uuid', {
        type: Sequelize.UUID,
      }),
    ]);
  },
};

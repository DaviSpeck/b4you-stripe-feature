module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('charges', 'provider', {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
      queryInterface.addColumn('charges', 'provider_id', {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('charges', 'provider'),
      queryInterface.removeColumn('charges', 'provider_id'),
    ]);
  },
};

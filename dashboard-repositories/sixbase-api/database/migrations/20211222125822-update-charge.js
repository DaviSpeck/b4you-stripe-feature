module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('charges', 'line_code', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('charges', 'billet_url', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('charges', 'line_code'),
      queryInterface.removeColumn('charges', 'billet_url'),
    ]);
  },
};

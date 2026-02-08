module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('charges', 'payment_splited', {
        type: Sequelize.BOOLEAN,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('charges', 'payment_splited'),
    ]);
  },
};

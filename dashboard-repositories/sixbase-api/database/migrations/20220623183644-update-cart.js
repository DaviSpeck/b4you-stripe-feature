module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('cart', 'abandoned', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn('charges', 'next_business_day', {
        type: Sequelize.DATEONLY,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('cart', 'abandoned'),
      queryInterface.removeColumn('charges', 'next_business_day'),
    ]);
  },
};

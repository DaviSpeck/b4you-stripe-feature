module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('subscriptions', 'payment_method', {
        type: Sequelize.STRING,
        defaultValue: 'card',
      }),
      queryInterface.addColumn('subscriptions', 'renew', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('subscriptions', 'last_notify', {
        type: Sequelize.DATEONLY,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('subscriptions', 'payment_method'),
      queryInterface.removeColumn('subscriptions', 'renew'),
      queryInterface.removeColumn('subscriptions', 'last_notify'),
    ]);
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'trade_name', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('users', 'is_company', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn('users', 'status_documents', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.addColumn('users', 'account_verified', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.removeColumn('users', 'transaction_fixed_fee'),
      queryInterface.removeColumn('users', 'transaction_percentage_fee'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('users', 'trade_name'),
      queryInterface.removeColumn('users', 'is_company'),
      queryInterface.removeColumn('users', 'status_documents'),
      queryInterface.removeColumn('users', 'account_verified'),
      queryInterface.addColumn('users', 'transaction_fixed_fee', {
        type: Sequelize.DECIMAL(10, 2),
      }),
      queryInterface.addColumn('users', 'transaction_percentage_fee', {
        type: Sequelize.DECIMAL(10, 2),
      }),
    ]);
  },
};

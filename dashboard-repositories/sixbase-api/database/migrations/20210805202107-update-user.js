module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('users', 'document_type'),
      queryInterface.addColumn('users', 'tin', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn('users', 'bank_code', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn('users', 'agency', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn('users', 'account_number', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn('users', 'account_type', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('users', 'document_type', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.removeColumn('users', 'tin'),
      queryInterface.changeColumn('users', 'bank_code', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.changeColumn('users', 'agency', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.changeColumn('users', 'account_number', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.changeColumn('users', 'account_type', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },
};

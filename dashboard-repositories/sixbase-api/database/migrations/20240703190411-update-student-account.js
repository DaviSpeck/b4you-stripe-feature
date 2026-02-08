module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('students', 'account_type', {
      type: Sequelize.STRING,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('students', 'account_type');
  },
};

module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('students', 'classroom_ids'),
      queryInterface.removeColumn('students', 'unlimited'),
      queryInterface.removeColumn('students', 'membership'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('students', 'classroom_ids', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('students', 'unlimited', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn('students', 'membership', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};

module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('modules_classrooms', 'created_at'),
      queryInterface.removeColumn('modules_classrooms', 'updated_at'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('modules_classrooms', 'created_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('modules_classrooms', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },
};

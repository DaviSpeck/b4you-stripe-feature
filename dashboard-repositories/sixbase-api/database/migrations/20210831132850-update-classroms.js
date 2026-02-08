module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('classrooms', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('classrooms', 'is_default', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('classrooms', 'label', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('classrooms', 'deleted_at'),
      queryInterface.removeColumn('classrooms', 'is_default'),
      queryInterface.removeColumn('classrooms', 'label'),
    ]);
  },
};

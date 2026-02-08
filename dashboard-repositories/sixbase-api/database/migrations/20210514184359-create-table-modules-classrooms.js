module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('modules_classrooms', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_classroom: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_module: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('modules_classrooms'),
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reset_student', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => queryInterface.dropTable('reset_student'),
};

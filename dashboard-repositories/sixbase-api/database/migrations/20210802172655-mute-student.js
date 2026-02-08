module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mute_student', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('mute_student');
  },
};

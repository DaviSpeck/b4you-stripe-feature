module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_products', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_classroom: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      has_access: {
        type: Sequelize.BOOLEAN,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_products');
  },
};

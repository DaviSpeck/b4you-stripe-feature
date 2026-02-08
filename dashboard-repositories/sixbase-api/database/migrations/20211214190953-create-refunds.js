module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('refunds', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_status: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      requested_by_student: {
        type: Sequelize.BOOLEAN,
      },
      reason: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('refunds'),
};

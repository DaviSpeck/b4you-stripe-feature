module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_sale: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_status: {
        type: Sequelize.INTEGER,
      },
      id_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      generate_in: {
        type: Sequelize.DATEONLY,
      },
      generated_at: {
        type: Sequelize.DATE,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('invoices'),
};

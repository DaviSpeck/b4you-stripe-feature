/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('commissions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      id_status: {
        type: Sequelize.INTEGER,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
      },
      release_date: {
        type: Sequelize.DATEONLY,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      id_role: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('commissions'),
};

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('product_plans', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_frequency: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('product_plans'),
};

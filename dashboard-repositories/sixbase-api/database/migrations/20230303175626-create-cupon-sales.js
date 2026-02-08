module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('coupons_sales', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_coupon: {
        type: Sequelize.BIGINT,
      },
      id_sale: {
        type: Sequelize.BIGINT,
      },
      percentage: {
        type: Sequelize.DECIMAL(10, 2),
      },
      paid: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('coupons_sales'),
};

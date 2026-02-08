module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('coupons', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_offer: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      coupon: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      percentage: {
        type: Sequelize.DECIMAL(10, 2),
      },
      uuid: {
        type: Sequelize.UUID,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      expires_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('coupons'),
};

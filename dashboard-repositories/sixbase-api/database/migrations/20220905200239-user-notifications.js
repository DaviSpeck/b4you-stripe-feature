module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('notifications_settings', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      show_product_name: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      generated_pix: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      generated_billet: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      paid_pix: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      paid_billet: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      paid_card: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      expired_pix: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      expired_billet: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('notifications_settings'),
};

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('product_affiliate_settings', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      manual_approve: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      email_notification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      show_customer_details: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      list_on_market: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      support_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      general_rules: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      commission: {
        type: Sequelize.DECIMAL(10, 2),
      },
      click_attribution: {
        type: Sequelize.INTEGER,
      },
      cookies_validity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      url_promotion_material: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('product_affiliate_settings'),
};

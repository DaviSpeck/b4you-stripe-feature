'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('products', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_upsale:{
        type: Sequelize.INTEGER,
      },
      id_classroom:{
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      payment_type: {
        type: Sequelize.STRING,
      },
      payment_frequency: {
        type: Sequelize.STRING,
      },
      content_delivery: {
        type: Sequelize.STRING,
      },
      picture: {
        type: Sequelize.STRING,
      },
      warranty:{
        type: Sequelize.STRING,
      },
      sales_page_url:{
        type: Sequelize.STRING,
      },
      support_email:{
        type: Sequelize.STRING,
      },
      producer_name:{
        type: Sequelize.STRING,
      },
      logo:{
        type: Sequelize.STRING,
      },
      hex_color:{
        type: Sequelize.STRING,
      },
      payment_methods:{
        type: Sequelize.STRING,
      },
      creditcard_descriptor:{
        type: Sequelize.STRING,
      },
      installments:{
        type: Sequelize.INTEGER,
      },  
      thankyou_page:{
        type: Sequelize.STRING,
      },
      price_upsale:{
        type: Sequelize.DECIMAL(10,2),
      },
      label_accept_upsale:{
        type: Sequelize.STRING,
      },
      label_reject_upsale:{
        type: Sequelize.STRING,
      },
      hex_button_upsale:{
        type: Sequelize.STRING,
      },
      fire_purchase_on_billet:{
        type: Sequelize.BOOLEAN,
      },
      customcode_thankyou:{
        type: Sequelize.STRING,
      },
      customcode_checkout:{
        type: Sequelize.STRING,
      },
      customcode_billet:{
        type: Sequelize.STRING,
      },
      annual_discount:{
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.BIGINT,
      },
      updated_at: {
        type: Sequelize.BIGINT,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('products');
  },
};

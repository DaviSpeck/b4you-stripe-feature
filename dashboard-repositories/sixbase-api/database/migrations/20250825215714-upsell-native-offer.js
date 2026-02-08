/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('upsell_native_offer', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
      },
      offer_id: { type: Sequelize.INTEGER },
      upsell_product_id: { type: Sequelize.INTEGER },
      upsell_offer_id: { type: Sequelize.INTEGER },
      title: { type: Sequelize.STRING },
      subtitle: { type: Sequelize.STRING },
      is_one_click: { type: Sequelize.BOOLEAN },
      is_embed_video: { type: Sequelize.BOOLEAN },
      media_url: { type: Sequelize.STRING },
      media_embed: { type: Sequelize.STRING },
      btn_text_accept: { type: Sequelize.STRING },
      btn_text_refuse: { type: Sequelize.STRING },
      btn_color_accept: { type: Sequelize.STRING },
      btn_text_color_accept: { type: Sequelize.STRING },
      btn_text_color_refuse: { type: Sequelize.STRING },
      btn_text_accept_size: { type: Sequelize.STRING },
      btn_text_refuse_size: { type: Sequelize.STRING },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('upsell_native_offer');
  },
};

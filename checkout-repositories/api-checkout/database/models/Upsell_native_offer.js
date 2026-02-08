const { Sequelize } = require('sequelize');

class Upsell_native_offer extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
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
        product_id: { type: Sequelize.INTEGER },
        offer_id: { type: Sequelize.INTEGER },
        upsell_product_id: { type: Sequelize.INTEGER },
        upsell_offer_id: { type: Sequelize.INTEGER },

        // Configuração de etapas de venda
        step_color_background: {
          type: Sequelize.STRING,
          defaultValue: '#ffffffff',
        },
        step_color: {
          type: Sequelize.STRING,
          defaultValue: '#0F1B35',
        },
        is_step_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
        // ============================== //

        // Configuração do cabeçalho da página
        header: {
          type: Sequelize.STRING,
          defaultValue:
            'Não saia desta página sem conferir esta oferta imperdível!',
        },
        header_background_color: {
          type: Sequelize.STRING,
          defaultValue: '#0F1B35',
        },
        header_text_color: {
          type: Sequelize.STRING,
          defaultValue: '#ffffffff',
        },
        is_header_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
        // ================================== //

        // Configuração mensagem "Não feche esta página"
        alert_not_close_primary_color: {
          type: Sequelize.STRING,
          defaultValue: '#0F1B35',
        },
        alert_not_close_primary_text_color: {
          type: Sequelize.STRING,
          defaultValue: '#F1F1F1',
        },
        is_message_not_close: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        // ================================== //

        // Configuração do título da oferta
        title_image: { type: Sequelize.STRING, defaultValue: null },
        title: { type: Sequelize.STRING, defaultValue: 'Título da oferta' },
        title_size: { type: Sequelize.INTEGER, defaultValue: 24 },
        title_color: { type: Sequelize.STRING, defaultValue: '#0F1B35' },

        subtitle_one: { type: Sequelize.STRING, defaultValue: null },
        subtitle_one_size: { type: Sequelize.INTEGER, defaultValue: 24 },
        subtitle_one_weight: { type: Sequelize.INTEGER, defaultValue: 400 },
        subtitle_one_color: { type: Sequelize.STRING, defaultValue: '#0F1B35' },

        subtitle_two: { type: Sequelize.STRING, defaultValue: null },
        subtitle_two_size: { type: Sequelize.INTEGER, defaultValue: 24 },
        subtitle_two_weight: { type: Sequelize.INTEGER, defaultValue: 400 },
        subtitle_two_color: { type: Sequelize.STRING, defaultValue: '#0F1B35' },
        // ================================== //

        // Configuração de botão de compra
        is_one_click: { type: Sequelize.BOOLEAN, defaultValue: true },
        btn_text_accept: {
          type: Sequelize.STRING,
          defaultValue: 'Texto do botão de compra',
        },
        btn_text_accept_size: {
          type: Sequelize.INTEGER,
          defaultValue: 16,
        },
        btn_text_color_accept: {
          type: Sequelize.STRING,
          defaultValue: '#F1F1F1',
        },
        btn_color_accept: { type: Sequelize.STRING, defaultValue: '#0F1B35' },
        // ================================== //

        // Configuração de botão de recusa
        btn_text_refuse: {
          type: Sequelize.STRING,
          defaultValue: 'Texto do botão de recusar compra',
        },
        btn_text_refuse_size: {
          type: Sequelize.INTEGER,
          defaultValue: 16,
        },
        btn_text_color_refuse: {
          type: Sequelize.STRING,
          defaultValue: '#373737ff',
        },
        // ================================== //

        // Configurações gerais
        background: { type: Sequelize.STRING, defaultValue: '#ffffffff' },
        background_image_desktop: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        background_image_mobile: { type: Sequelize.STRING, defaultValue: null },
        media_url: { type: Sequelize.STRING, defaultValue: null },
        media_embed: { type: Sequelize.STRING, defaultValue: null },
        is_embed_video: { type: Sequelize.BOOLEAN, defaultValue: false },
        is_multi_offer: { type: Sequelize.BOOLEAN, defaultValue: true },
        is_footer_visible: { type: Sequelize.BOOLEAN, defaultValue: false },
        // ================================== //

        creation_origin: {
          type: Sequelize.STRING,
          defaultValue: 'product',
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'upsell_native_offer',
      },
    );

    return this;
  }
}

module.exports = Upsell_native_offer;

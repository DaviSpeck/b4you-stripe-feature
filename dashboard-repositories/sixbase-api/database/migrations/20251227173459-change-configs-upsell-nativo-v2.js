module.exports = {
  async up(queryInterface, Sequelize) {
    // Configuração de etapas de venda
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'step_color_background',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'step_color_background',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.changeColumn('upsell_native_offer', 'step_color', {
      type: Sequelize.STRING,
      defaultValue: '#0f1b35',
    });
    await queryInterface.changeColumn('upsell_native_product', 'step_color', {
      type: Sequelize.STRING,
      defaultValue: '#0f1b35',
    });
    await queryInterface.addColumn('upsell_native_offer', 'is_step_visible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.addColumn('upsell_native_product', 'is_step_visible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    // Configuração do cabeçalho da página
    await queryInterface.changeColumn('upsell_native_offer', 'title', {
      type: Sequelize.STRING,
      defaultValue: 'Título da oferta',
    });
    await queryInterface.changeColumn('upsell_native_product', 'title', {
      type: Sequelize.STRING,
      defaultValue: 'Título da oferta',
    });
    await queryInterface.addColumn(
      'upsell_native_offer',
      'header_background_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'header_background_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.addColumn('upsell_native_offer', 'header_text_color', {
      type: Sequelize.STRING,
      defaultValue: '#ffffffff',
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'header_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#ffffffff',
      },
    );
    await queryInterface.addColumn('upsell_native_offer', 'is_header_visible', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'is_header_visible',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );
    // Configuração mensagem "Não feche esta página"
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'alert_not_close_primary_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#f1f1f1',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'alert_not_close_primary_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#f1f1f1',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'alert_not_close_primary_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'alert_not_close_primary_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'is_message_not_close',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'is_message_not_close',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    );
    // Configuração do título da oferta
    await queryInterface.addColumn('upsell_native_offer', 'title_image', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('upsell_native_product', 'title_image', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.changeColumn('upsell_native_offer', 'title', {
      type: Sequelize.STRING,
      defaultValue: 'Título da oferta',
    });
    await queryInterface.changeColumn('upsell_native_product', 'title', {
      type: Sequelize.STRING,
      defaultValue: 'Título da oferta',
    });
    await queryInterface.addColumn('upsell_native_offer', 'title_size', {
      type: Sequelize.INTEGER,
      defaultValue: 24,
    });
    await queryInterface.addColumn('upsell_native_product', 'title_size', {
      type: Sequelize.INTEGER,
      defaultValue: 24,
    });
    await queryInterface.addColumn('upsell_native_offer', 'title_color', {
      type: Sequelize.STRING,
      defaultValue: '#0f1b35',
    });
    await queryInterface.addColumn('upsell_native_product', 'title_color', {
      type: Sequelize.STRING,
      defaultValue: '#0f1b35',
    });
    await queryInterface.removeColumn('upsell_native_offer', 'subtitle');
    await queryInterface.removeColumn('upsell_native_product', 'subtitle');
    // ===> Subtitle_one
    await queryInterface.addColumn('upsell_native_offer', 'subtitle_one', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('upsell_native_product', 'subtitle_one', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('upsell_native_offer', 'subtitle_one_size', {
      type: Sequelize.INTEGER,
      defaultValue: 24,
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'subtitle_one_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: 24,
      },
    );
    await queryInterface.addColumn(
      'upsell_native_offer',
      'subtitle_one_weight',
      { type: Sequelize.INTEGER, defaultValue: 400 },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'subtitle_one_weight',
      { type: Sequelize.INTEGER, defaultValue: 400 },
    );
    await queryInterface.addColumn(
      'upsell_native_offer',
      'subtitle_one_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'subtitle_one_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    // ===> Subtitle_two
    await queryInterface.addColumn('upsell_native_offer', 'subtitle_two', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('upsell_native_product', 'subtitle_two', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('upsell_native_offer', 'subtitle_two_size', {
      type: Sequelize.INTEGER,
      defaultValue: 24,
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'subtitle_two_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: 24,
      },
    );
    await queryInterface.addColumn(
      'upsell_native_offer',
      'subtitle_two_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.addColumn(
      'upsell_native_offer',
      'subtitle_two_weight',
      { type: Sequelize.INTEGER, defaultValue: 400 },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'subtitle_two_weight',
      { type: Sequelize.INTEGER, defaultValue: 400 },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'subtitle_two_color',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    // Configuração de botão de compra
    await queryInterface.changeColumn('upsell_native_offer', 'is_one_click', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.changeColumn('upsell_native_product', 'is_one_click', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_accept',
      {
        type: Sequelize.STRING,
        defaultValue: 'Texto do botão de compra',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_accept',
      {
        type: Sequelize.STRING,
        defaultValue: 'Texto do botão de compra',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_accept_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: 16,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_accept_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: 16,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: '#f1f1f1',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: '#f1f1f1',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: '#0f1b35',
      },
    );
    // Configuração de botão de recusa
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: 'Texto do botão de recusar compra',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: 'Texto do botão de recusar compra',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_refuse_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: 16,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_refuse_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: 16,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_color_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: '#373737ff',
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_color_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: '#373737ff',
      },
    );
    // Configurações gerais
    await queryInterface.changeColumn('upsell_native_offer', 'background', {
      type: Sequelize.STRING,
      defaultValue: '#ffffffff',
    });
    await queryInterface.changeColumn('upsell_native_product', 'background', {
      type: Sequelize.STRING,
      defaultValue: '#ffffffff',
    });
    await queryInterface.addColumn(
      'upsell_native_offer',
      'background_image_desktop',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'background_image_desktop',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.addColumn(
      'upsell_native_offer',
      'background_image_mobile',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.addColumn(
      'upsell_native_product',
      'background_image_mobile',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.addColumn('upsell_native_offer', 'is_footer_visible', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.addColumn(
      'upsell_native_product',
      'is_footer_visible',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // Configuração de etapas de venda
    await queryInterface.removeColumn('upsell_native_offer', 'is_step_visible');
    await queryInterface.removeColumn(
      'upsell_native_product',
      'is_step_visible',
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'step_color_background',
      {
        type: Sequelize.STRING,
        defaultValue: null, // ou o valor original antes da migration
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'step_color_background',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn('upsell_native_offer', 'step_color', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.changeColumn('upsell_native_product', 'step_color', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    // Cabeçalho da página
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'header_background_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'header_background_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'header_text_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'header_text_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'is_header_visible',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'is_header_visible',
    );
    // Mensagem "Não feche esta página"
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'alert_not_close_primary_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'alert_not_close_primary_text_color',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'alert_not_close_primary_color',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'alert_not_close_primary_color',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'is_message_not_close',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'is_message_not_close',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: null,
      },
    );
    // Título da oferta
    await queryInterface.removeColumn('upsell_native_offer', 'title_image');
    await queryInterface.removeColumn('upsell_native_product', 'title_image');
    await queryInterface.removeColumn('upsell_native_offer', 'title_size');
    await queryInterface.removeColumn('upsell_native_product', 'title_size');
    await queryInterface.removeColumn('upsell_native_offer', 'title_color');
    await queryInterface.removeColumn('upsell_native_product', 'title_color');
    // Subtitle
    await queryInterface.addColumn('upsell_native_offer', 'subtitle', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('upsell_native_product', 'subtitle', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.removeColumn('upsell_native_offer', 'subtitle_one');
    await queryInterface.removeColumn('upsell_native_product', 'subtitle_one');
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'subtitle_one_size',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_one_size',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'subtitle_one_weight',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_one_weight',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_two_weight',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'subtitle_one_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_one_color',
    );
    await queryInterface.removeColumn('upsell_native_offer', 'subtitle_two');
    await queryInterface.removeColumn('upsell_native_product', 'subtitle_two');
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'subtitle_two_size',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_two_size',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'subtitle_two_weight',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_two_weight',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'subtitle_two_color',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'subtitle_two_color',
    );
    // Botão de compra
    await queryInterface.changeColumn('upsell_native_offer', 'is_one_click', {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    });
    await queryInterface.changeColumn('upsell_native_product', 'is_one_click', {
      type: Sequelize.BOOLEAN,
      defaultValue: null,
    });
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_accept',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_accept',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_accept_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_accept_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_color_accept',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    // Botão de recusa
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_refuse_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_refuse_size',
      {
        type: Sequelize.INTEGER,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_offer',
      'btn_text_color_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    await queryInterface.changeColumn(
      'upsell_native_product',
      'btn_text_color_refuse',
      {
        type: Sequelize.STRING,
        defaultValue: null,
      },
    );
    // Configurações gerais
    await queryInterface.changeColumn('upsell_native_offer', 'background', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.changeColumn('upsell_native_product', 'background', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'background_image_desktop',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'background_image_desktop',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'background_image_mobile',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'background_image_mobile',
    );
    await queryInterface.removeColumn(
      'upsell_native_offer',
      'is_footer_visible',
    );
    await queryInterface.removeColumn(
      'upsell_native_product',
      'is_footer_visible',
    );
  },
};

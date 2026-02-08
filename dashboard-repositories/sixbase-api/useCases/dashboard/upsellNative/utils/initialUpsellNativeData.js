const initalUpsellNativeData = (params) => {
  const { product_id } = params;

  return {
    isActive: true,
    product_id,
    upsell_product_id: null,
    upsell_offer_id: null,

    // Configuração de etapas de venda
    step_color_background: '#ffffffff',
    step_color: '#0f1b35',
    is_step_visible: true,

    // Configuração do cabeçalho da página
    header: 'Não saia desta página sem conferir esta oferta imperdível!',
    header_background_color: '#0f1b35',
    header_text_color: '#ffffffff',
    is_header_visible: true,
    is_footer_visible: false,

    // Configuração mensagem "Não feche esta página"
    alert_not_close_primary_color: '#0f1b35',
    alert_not_close_primary_text_color: '#f1f1f1',
    is_message_not_close: true,

    // Configuração do título da oferta
    title_image: null,
    title: 'Título da oferta',
    title_size: 24,
    title_color: '#0f1b35',

    subtitle_one: null,
    subtitle_one_size: 24,
    subtitle_one_color: '#0f1b35',

    subtitle_two: null,
    subtitle_two_size: 24,
    subtitle_two_color: '#0f1b35',

    // Configuração de botão de compra
    is_one_click: true,
    btn_text_accept: 'Texto do botão de compra',
    btn_text_accept_size: 16,
    btn_text_color_accept: '#f1f1f1',
    btn_color_accept: '#0f1b35',

    // Configuração de botão de recusa
    btn_text_refuse: 'Texto do botão de recusar compra',
    btn_text_refuse_size: 16,
    btn_text_color_refuse: '#373737ff',

    // Configurações gerais
    background: '#ffffffff',
    backgroun_image_desktop: null,
    backgroun_image_mobile: null,
    media_url: null,
    media_embed: null,
    is_embed_video: false,
    is_multi_offer: true,
  };
};

module.exports = { initalUpsellNativeData };

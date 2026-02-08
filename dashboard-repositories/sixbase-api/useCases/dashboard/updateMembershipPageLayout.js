const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const presentMembershipPageLayout = require('../../presentation/dashboard/membershipPageLayout');
const { VIDEOTYPE } = require('../../types/productTypes');

const mapLayoutToRowFields = (layout, product) => {
  const row = {};

  const getBlock = (type) =>
    (layout.layout || []).find((b) => b.type === type) || {};

  const description = getBlock('description');
  const descriptionConfig = description.config || {};

  const modules = getBlock('modules');
  const modulesConfig = modules.config || {};

  const producer = getBlock('producer');
  const producerConfig = producer.config || {};

  const cta = getBlock('cta');
  const ctaConfig = cta.config || {};

  const faq = getBlock('faq');
  const faqConfig = faq.config || {};

  const social = getBlock('social');
  const socialConfig = social.config || {};

  // Tema / cores vindos do próprio produto (mantemos fonte única por enquanto)
  row.apply_membership_colors = product.apply_membership_colors;
  row.hex_color_membership_primary = product.hex_color_membership_primary;
  row.hex_color_membership_secondary = product.hex_color_membership_secondary;
  row.hex_color_membership_text = product.hex_color_membership_text;
  row.hex_color_membership_hover = product.hex_color_membership_hover;

  // Capa / banners vindos do produto
  row.cover_custom = product.cover_custom;
  row.cover_custom_key = product.cover_custom_key;
  row.module_cover_format = product.module_cover_format;
  row.banner = product.banner;
  row.banner_key = product.banner_key;
  row.banner_mobile = product.banner_mobile;
  row.banner_mobile_key = product.banner_mobile_key;

  // Description
  row.description_title = descriptionConfig.title || 'Sobre o Curso';
  row.description_use_product_description =
    descriptionConfig.useProductDescription !== undefined
      ? descriptionConfig.useProductDescription
      : true;
  row.description_content = descriptionConfig.content || '';
  row.description_show_stats =
    descriptionConfig.showStats !== undefined
      ? descriptionConfig.showStats
      : true;

  // Modules
  row.modules_title = modulesConfig.title || 'Módulos do Curso';
  row.modules_show_progress =
    modulesConfig.showProgress !== undefined
      ? modulesConfig.showProgress
      : true;
  row.modules_layout = modulesConfig.layout || 'grid';
  row.modules_columns = modulesConfig.columns || 4;

  // Producer
  row.producer_title = producerConfig.title || 'Sobre o Produtor';
  row.producer_show_biography =
    producerConfig.showBiography !== undefined
      ? producerConfig.showBiography
      : true;
  row.producer_show_avatar =
    producerConfig.showAvatar !== undefined ? producerConfig.showAvatar : true;
  row.producer_show_social_links =
    producerConfig.showSocialLinks !== undefined
      ? producerConfig.showSocialLinks
      : false;
  row.producer_layout = producerConfig.layout || 'horizontal';

  // CTA
  row.cta_title = ctaConfig.title || null;
  row.cta_description = ctaConfig.description || null;
  row.cta_button_text = ctaConfig.buttonText || null;
  row.cta_button_link = ctaConfig.buttonLink || null;
  row.cta_button_style = ctaConfig.buttonStyle || 'primary';
  row.cta_alignment = ctaConfig.alignment || 'center';
  row.cta_background_color = ctaConfig.backgroundColor || null;

  // FAQ
  row.faq_title = faqConfig.title || 'Perguntas Frequentes';
  row.faq_items = Array.isArray(faqConfig.items) ? faqConfig.items : null;
  row.faq_allow_multiple_open =
    faqConfig.allowMultipleOpen !== undefined
      ? faqConfig.allowMultipleOpen
      : false;

  // Social
  row.social_title = socialConfig.title || 'Me siga nas redes';
  row.social_alignment = socialConfig.alignment || 'center';
  row.social_style = socialConfig.style || 'icons';
  row.social_links = Array.isArray(socialConfig.links)
    ? socialConfig.links
    : null;

  row.version = layout.version || '1.0';
  row.layout_data = layout.layout || null;

  return row;
};

module.exports = async ({ uuidProduct, idUser, layout }) => {
  const { products, membership_page_layouts: MembershipPageLayouts } =
    db.sequelize.models;

  const product = await products.findOne({
    where: {
      uuid: uuidProduct,
      id_user: idUser,
    },
  });

  if (!product) {
    throw new ApiError('Produto não encontrado', 404);
  }

  // Check product type - only video products (courses) can have custom layout
  if (product.id_type !== VIDEOTYPE) {
    throw new ApiError(
      'Layout customizado disponível apenas para produtos do tipo vídeo/curso',
      400,
    );
  }

  // Validate layout structure
  if (!layout.version || !Array.isArray(layout.layout)) {
    throw new ApiError('Estrutura de layout inválida', 400);
  }

  // Validate blocks
  for (const block of layout.layout) {
    if (!block.id || !block.type || typeof block.order !== 'number') {
      throw new ApiError('Cada bloco deve ter id, type e order definidos', 400);
    }
  }

  const fields = mapLayoutToRowFields(layout, product);

  const [row] = await MembershipPageLayouts.findOrCreate({
    where: { id_product: product.id },
    defaults: {
      id_product: product.id,
      ...fields,
    },
  });

  await row.update(fields);

  // Reutiliza o presenter para devolver o JSON no mesmo formato de antes
  const savedLayout = presentMembershipPageLayout({
    version: fields.version,
    layout: layout.layout,
  });

  return savedLayout;
};

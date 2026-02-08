const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const Cache = require('../../config/Cache');
const presentMembershipPageLayout = require('../../presentation/membership/membershipPageLayout');

const buildLayoutFromRow = (row) => {
  if (!row) {
    return null;
  }

  const version = row.version || '1.0';

  const layout = [];
  layout.push({
    id: 'default-description',
    type: 'description',
    order: 0,
    config: {
      title: row.description_title || 'Sobre o Curso',
      useProductDescription:
        row.description_use_product_description === undefined
          ? true
          : row.description_use_product_description,
      content: row.description_content || '',
      showStats:
        row.description_show_stats === undefined
          ? true
          : row.description_show_stats,
    },
  });

  layout.push({
    id: 'default-modules',
    type: 'modules',
    order: 1,
    config: {
      title: row.modules_title || 'Módulos do Curso',
      showProgress:
        row.modules_show_progress === undefined
          ? true
          : row.modules_show_progress,
      layout: row.modules_layout || 'grid',
      columns: row.modules_columns || 4,
    },
  });

  layout.push({
    id: 'default-producer',
    type: 'producer',
    order: 2,
    config: {
      title: row.producer_title || 'Sobre o Produtor',
      showBiography:
        row.producer_show_biography === undefined
          ? true
          : row.producer_show_biography,
      showAvatar:
        row.producer_show_avatar === undefined
          ? true
          : row.producer_show_avatar,
      showSocialLinks:
        row.producer_show_social_links === undefined
          ? false
          : row.producer_show_social_links,
      layout: row.producer_layout || 'horizontal',
    },
  });

  if (
    row.cta_title ||
    row.cta_description ||
    row.cta_button_text ||
    row.cta_button_link
  ) {
    layout.push({
      id: 'default-cta',
      type: 'cta',
      order: 3,
      config: {
        title: row.cta_title || '',
        description: row.cta_description || '',
        buttonText: row.cta_button_text || '',
        buttonLink: row.cta_button_link || '',
        buttonStyle: row.cta_button_style || 'primary',
        alignment: row.cta_alignment || 'center',
        backgroundColor: row.cta_background_color || 'transparent',
      },
    });
  }

  if (
    row.faq_items &&
    Array.isArray(row.faq_items) &&
    row.faq_items.length > 0
  ) {
    layout.push({
      id: 'default-faq',
      type: 'faq',
      order: 4,
      config: {
        title: row.faq_title || 'Perguntas Frequentes',
        items: row.faq_items || [],
        allowMultipleOpen:
          row.faq_allow_multiple_open === undefined
            ? false
            : row.faq_allow_multiple_open,
      },
    });
  }

  if (
    row.social_links &&
    Array.isArray(row.social_links) &&
    row.social_links.length > 0
  ) {
    layout.push({
      id: 'default-social',
      type: 'social',
      order: 5,
      config: {
        title: row.social_title || 'Me siga nas redes',
        alignment: row.social_alignment || 'center',
        style: row.social_style || 'icons',
        links: row.social_links || [],
      },
    });
  }

  return {
    version,
    layout,
  };
};

const getDefaultRow = () => ({
  version: '1.0',
  description_title: 'Sobre o Curso',
  description_use_product_description: true,
  description_content: '',
  description_show_stats: true,
  modules_title: 'Módulos do Curso',
  modules_show_progress: true,
  modules_layout: 'grid',
  modules_columns: 4,
  producer_title: 'Sobre o Produtor',
  producer_show_biography: true,
  producer_show_avatar: true,
  producer_show_social_links: false,
  producer_layout: 'horizontal',
});

module.exports = async ({ uuidProduct }) => {
  const cacheKey = `membership_page_layout:${uuidProduct}`;
  const cached = await Cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const { products, membership_page_layouts: MembershipPageLayouts } =
    db.sequelize.models;

  const product = await products.findOne({
    where: {
      uuid: uuidProduct,
    },
  });

  if (!product) {
    throw new ApiError('Produto não encontrado', 404);
  }

  let row = await MembershipPageLayouts.findOne({
    where: { id_product: product.id },
  });

  if (!row) {
    const defaultRow = getDefaultRow();
    row = await MembershipPageLayouts.create({
      id_product: product.id,
      ...defaultRow,
    });
  }

  let layout;
  if (
    row.layout_data &&
    Array.isArray(row.layout_data) &&
    row.layout_data.length > 0
  ) {
    const sortedLayout = [...row.layout_data].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      return orderA - orderB;
    });
    layout = {
      version: row.version || '1.0',
      layout: sortedLayout,
    };
  } else {
    layout = buildLayoutFromRow(row);
  }

  const result = presentMembershipPageLayout(layout);

  await Cache.set(cacheKey, JSON.stringify(result), 30);

  return result;
};

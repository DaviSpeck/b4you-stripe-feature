const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const presentMembershipPageLayout = require('../../presentation/dashboard/membershipPageLayout');

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

const buildLayoutFromRow = (row) => {
  const version = row.version || '1.0';

  return {
    version,
    layout: [
      {
        id: 'default-description',
        type: 'description',
        order: 0,
        config: {
          title: row.description_title,
          useProductDescription: row.description_use_product_description,
          content: row.description_content,
          showStats: row.description_show_stats,
        },
      },
      {
        id: 'default-modules',
        type: 'modules',
        order: 1,
        config: {
          title: row.modules_title,
          showProgress: row.modules_show_progress,
          layout: row.modules_layout,
          columns: row.modules_columns,
        },
      },
      {
        id: 'default-producer',
        type: 'producer',
        order: 2,
        config: {
          title: row.producer_title,
          showBiography: row.producer_show_biography,
          showAvatar: row.producer_show_avatar,
          showSocialLinks: row.producer_show_social_links,
          layout: row.producer_layout,
        },
      },
    ],
  };
};

module.exports = async ({ uuidProduct, idUser }) => {
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

  if (product.content_delivery !== 'membership') {
    throw new ApiError(
      'Layout customizado disponível apenas para produtos com área de membros',
      400,
    );
  }

  const defaults = getDefaultRow();

  const [row] = await MembershipPageLayouts.findOrCreate({
    where: { id_product: product.id },
    defaults: {
      id_product: product.id,
      ...defaults,
    },
  });

  await row.update({
    ...defaults,
    layout_data: null,
  });

  const layout = buildLayoutFromRow(row);

  return presentMembershipPageLayout(layout);
};

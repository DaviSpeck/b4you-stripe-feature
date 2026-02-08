const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const db = require('../../database/models');
const { VIDEOTYPE, EBOOKTYPE, PAYMENT_ONLY_TYPE, PHYSICAL_TYPE } = require('../../types/productTypes');

const CONTENT_TYPES = [VIDEOTYPE, EBOOKTYPE];

const getProductTypeLabel = (idType) => {
  switch (idType) {
    case VIDEOTYPE:
      return 'Curso/Vídeo';
    case EBOOKTYPE:
      return 'E-book';
    case PAYMENT_ONLY_TYPE:
      return 'Apenas Pagamento';
    case PHYSICAL_TYPE:
      return 'Produto Físico';
    default:
      return 'Outro';
  }
};

module.exports = async ({ uuidProduct, idUser }) => {
  const {
    products,
    product_offer: ProductOffer,
    product_pages: ProductPages,
    modules: Modules,
    products_ebooks: ProductsEbooks,
  } = db.sequelize.models;

  const product = await products.findOne({
    where: {
      uuid: uuidProduct,
      id_user: idUser,
    },
  });

  if (!product) {
    throw new ApiError('Produto não encontrado', 404);
  }

  const producerProducts = await products.findAll({
    where: {
      id_user: product.id_user,
      id_type: { [Op.in]: [VIDEOTYPE, EBOOKTYPE, PAYMENT_ONLY_TYPE, PHYSICAL_TYPE] },
      id: { [Op.ne]: product.id },
    },
    attributes: [
      'id',
      'uuid',
      'name',
      'cover',
      'content_delivery',
      'available_checkout_link_types',
      'support_whatsapp',
      'id_type',
    ],
    include: [
      {
        model: ProductOffer,
        as: 'product_offer',
        attributes: ['id', 'uuid', 'price', 'name', 'active'],
        required: false,
      },
      {
        model: ProductPages,
        as: 'product_pages',
        attributes: ['id', 'uuid', 'label', 'url'],
        required: false,
      },
      {
        model: Modules,
        as: 'module',
        attributes: ['id'],
        required: false,
      },
      {
        model: ProductsEbooks,
        as: 'ebooks',
        attributes: ['id'],
        required: false,
      },
    ],
    order: [['name', 'ASC']],
  });

  const productsWithContent = producerProducts.filter((p) => {
    if (p.id_type === VIDEOTYPE) {
      return p.module && p.module.length > 0;
    }
    if (p.id_type === EBOOKTYPE) {
      return p.ebooks && p.ebooks.length > 0;
    }
    if (p.id_type === PAYMENT_ONLY_TYPE || p.id_type === PHYSICAL_TYPE) {
      return true;
    }
    return false;
  });

  const productsWithPrice = productsWithContent.filter((p) => {
    if (!p.product_offer || p.product_offer.length === 0) {
      return false;
    }
    return p.product_offer.some((offer) => offer.price > 0);
  });

  return productsWithPrice.map((p) => {
    const isContentProduct = CONTENT_TYPES.includes(p.id_type);

    return {
      id: p.id,
      uuid: p.uuid,
      name: p.name,
      cover: p.cover,
      price:
        p.product_offer && p.product_offer.length > 0
          ? Math.round(p.product_offer[0].price * 100)
          : 0,
      contentDelivery: p.content_delivery,
      availableCheckoutTypes: p.available_checkout_link_types || 3, // 1=single, 2=three-steps, 3=all
      supportWhatsapp: p.support_whatsapp || null,
      idType: p.id_type,
      productType: isContentProduct ? 'content' : 'store',
      productTypeLabel: getProductTypeLabel(p.id_type),
      offers: (p.product_offer || [])
        .filter((offer) => offer.active && offer.price > 0)
        .map((offer) => ({
          id: offer.id,
          uuid: offer.uuid,
          name: offer.name,
          price: Math.round(offer.price * 100),
        })),
      allOffers: (p.product_offer || [])
        .filter((offer) => offer.price > 0)
        .map((offer) => ({
          id: offer.id,
          uuid: offer.uuid,
          name: offer.name,
          price: Math.round(offer.price * 100),
          active: offer.active,
        })),
      pages: (p.product_pages || []).map((page) => ({
        id: page.id,
        uuid: page.uuid,
        label: page.label,
        url: page.url,
      })),
    };
  });
};

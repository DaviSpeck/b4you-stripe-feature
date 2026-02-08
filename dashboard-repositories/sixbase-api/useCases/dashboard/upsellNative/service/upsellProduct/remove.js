const {
  UpsellNativeProductRepository,
} = require('../../../../../repositories/sequelize/upsellNativeProduct');
const {
  OffersUpsellNativeRepository,
} = require('../../repository/offersUpsell.repository');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');
const {
  verifyUpsellProductExists,
} = require('../../validators/upsellProductExist.validator');

async function Remove(props) {
  const { uuid, user } = props;

  const product = await verifyProductExists({
    uuid,
    user,
    values: ['id'],
  });
  const product_id = product.id;

  const upsell = await UpsellNativeProductRepository.findOne({
    where: { product_id },
    values: ['id'],
  });

  if (!upsell) {
    return;
  }

  await OffersUpsellNativeRepository.remove({
    where: { upsell_id: upsell.id },
  });

  await UpsellNativeProductRepository.remove({
    where: { id: upsell.id },
  });
}

async function RemoveImage(params) {
  const { uuid } = params;

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });
  const product_id = product.id;

  const upsellProduct = await verifyUpsellProductExists({
    product_id,
    values: ['id'],
  });
  const { id } = upsellProduct;

  await UpsellNativeProductRepository.update({
    where: { id },
    data: { media_url: null },
  });
}

async function RemoveTitleImage(params) {
  const { uuid } = params;

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });
  const product_id = product.id;

  const upsellProduct = await verifyUpsellProductExists({
    product_id,
    values: ['id'],
  });
  const { id } = upsellProduct;

  await UpsellNativeProductRepository.update({
    where: { id },
    data: { title_image: null },
  });
}

async function RemoveBackgroundImageDesktop(params) {
  const { uuid } = params;

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });
  const product_id = product.id;

  const upsellProduct = await verifyUpsellProductExists({
    product_id,
    values: ['id'],
  });
  const { id } = upsellProduct;

  await UpsellNativeProductRepository.update({
    where: { id },
    data: { background_image_desktop: null },
  });
}

async function RemoveBackgroundImageMobile(params) {
  const { uuid } = params;

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });
  const product_id = product.id;

  const upsellProduct = await verifyUpsellProductExists({
    product_id,
    values: ['id'],
  });
  const { id } = upsellProduct;

  await UpsellNativeProductRepository.update({
    where: { id },
    data: { background_image_mobile: null },
  });
}

async function RemoveEmbed(params) {
  const { uuid } = params;

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });
  const product_id = product.id;

  const upsellProduct = await verifyUpsellProductExists({
    product_id,
    values: ['id'],
  });
  const { id } = upsellProduct;

  await UpsellNativeProductRepository.update({
    where: { id },
    data: {
      media_embed: null,
    }
  });
}

module.exports = {
  Remove,
  RemoveImage,
  RemoveTitleImage,
  RemoveBackgroundImageDesktop,
  RemoveBackgroundImageMobile,
  RemoveEmbed,
};

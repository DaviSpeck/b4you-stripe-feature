const fs = require('fs');
const {
  OffersUpsellNativeRepository,
} = require('../../repository/offersUpsell.repository');
const { upsellNativeDto } = require('../../upsellNative.dto');
const { getIdsByUuid } = require('../../utils/getIdsByUuid');
const { upsellSerealizer } = require('../../upsellNative.serealizer');
const {
  ProductOfferRepository,
} = require('../../repository/productOffer.repository');
const {
  verifyProductExists,
} = require('../../validators/productExists.validator');
const ImageHelper = require('../../../../../utils/helpers/images');
const ApiError = require('../../../../../error/ApiError');
const { resolveImageFromBuffer } = require('../../../../../utils/files');
const {
  verifyUpsellOfferExists,
} = require('../../validators/upsellOfferExist.validator');
const { verifyOfferExists } = require('../../validators/offerExists.validator');
const {
  UpsellNativeProductRepository,
} = require('../../../../../repositories/sequelize/upsellNativeProduct');
const {
  initalUpsellNativeData,
} = require('../../utils/initialUpsellNativeData');
const { ProductRepository } = require('../../repository/product.repository');

async function Update(params) {
  const { uuid, data, user } = params;

  const dataToUpdate = { ...data };

  const { id: product_id } = await verifyProductExists({
    uuid,
    user,
    values: ['id'],
  });

  let upsell = await UpsellNativeProductRepository.findOne({
    where: { product_id },
  });

  if (!upsell) {
    await ProductRepository.update({
      where: { id: product_id },
      data: { is_upsell_active: true },
    });

    const initialData = initalUpsellNativeData({ product_id });
    const createdUpsell = await UpsellNativeProductRepository.create(
      initialData,
    );
    upsell = createdUpsell.dataValues ?? createdUpsell;
  }

  // eslint-disable-next-line no-extra-boolean-cast
  if (Boolean(dataToUpdate.isMultiOffer)) {
    const { offers } = dataToUpdate;

    const offersIds = await ProductOfferRepository.findAll({
      where: {
        uuid: offers,
      },
      values: ['id'],
    });

    await OffersUpsellNativeRepository.remove({
      where: { upsell_id: upsell.id },
    });

    const newOffers = offersIds.map((item) => ({
      upsell_id: upsell.id,
      offer_id: item.id,
    }));

    await OffersUpsellNativeRepository.createMany(newOffers);

    dataToUpdate.upsellOfferId = null;
  }

  const { offerId, offerUuid, productId, productUuid } = await getIdsByUuid({
    offerUuid: dataToUpdate.upsellOfferId, // uuid
    productUuid: dataToUpdate.upsellProductId, // uuid
  });

  // ISSO CONVERTE O VALORES DO BODY, QUE VEM FORMATO UUID (STRING), PARA O FORMATO DE ID (NUMERICO)
  dataToUpdate.upsellProductId = productId;
  dataToUpdate.upsellOfferId = offerId;
  // ==============================================================================================

  await UpsellNativeProductRepository.update({
    where: { id: upsell.id },
    data: upsellNativeDto({ ...upsell, ...dataToUpdate }),
  });

  return upsellSerealizer({
    ...upsell,
    ...dataToUpdate,
    upsellProductId: productUuid,
    upsellOfferId: offerUuid,
    is_active: Boolean(dataToUpdate.isUpsellActive),
    is_one_click: Boolean(dataToUpdate.isOneClick),
    is_embed_video: Boolean(dataToUpdate.isEmbedVideo),
    is_active_message: Boolean(dataToUpdate.isActiveMessage),
    is_multi_offer: Boolean(dataToUpdate.isMultiOffer),
    upsell_product_id: productUuid,
    upsell_offer_id: offerUuid,
  });
}

async function UpdateEmbed(params) {
  const { uuid, data, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });
  const { id: offer_id } = offer;

  const upsellOffer = await verifyUpsellOfferExists({
    offer_id,
    values: ['id'],
    user
  });
  const { id } = upsellOffer;

  await UpsellNativeProductRepository.update({
    where: { id },
    data: {
      media_embed: data.media_embed,
      media_url: null,
    },
  });
}

async function UpdateTitleImage(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeProductRepository.update({
    where: { product_id: product.id },
    data: { title_image: url },
  });

  return { url };
}

async function UpdateBackgroundImageDesktop(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeProductRepository.update({
    where: { product_id: product.id },
    data: { background_image_desktop: url },
  });

  return { url };
}

async function UpdateBackgroundImageMobile(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeProductRepository.update({
    where: { product_id: product.id },
    data: { background_image_mobile: url },
  });

  return { url };
}

async function UpdateImage(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const product = await verifyProductExists({
    uuid,
    values: ['id'],
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeProductRepository.update({
    where: { product_id: product.id },
    data: {
      media_url: url,
      media_embed: null,
    }
  });

  return { url };
}

module.exports = {
  Update,
  UpdateImage,
  UpdateEmbed,
  UpdateTitleImage,
  UpdateBackgroundImageMobile,
  UpdateBackgroundImageDesktop,
};

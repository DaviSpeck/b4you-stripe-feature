const fs = require('fs');
const ApiError = require('../../../../../error/ApiError');
const {
  OffersUpsellNativeRepository,
} = require('../../repository/offersUpsell.repository');
const {
  ProductOfferRepository,
} = require('../../repository/productOffer.repository');
const { upsellNativeDto } = require('../../upsellNative.dto');
const { upsellSerealizer } = require('../../upsellNative.serealizer');
const { getIdsByUuid } = require('../../utils/getIdsByUuid');
const { verifyOfferExists } = require('../../validators/offerExists.validator');
const {
  verifyUpsellOfferExists,
} = require('../../validators/upsellOfferExist.validator');
const ImageHelper = require('../../../../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../../../../utils/files');
const {
  UpsellNativeOfferRepository,
} = require('../../../../../repositories/sequelize/upsellNativeOffer');

async function Update(params) {
  const { uuid, data, user } = params;

  const dataToUpdate = { ...data };

  const offer = await verifyOfferExists({ uuid, values: ['id'], user });

  const upsell = await verifyUpsellOfferExists({
    offer_id: offer.id,
    user
  });

  // eslint-disable-next-line no-extra-boolean-cast
  if (Boolean(dataToUpdate.isMultiOffer)) {
    const { offers } = dataToUpdate;

    const offersIds = await ProductOfferRepository.findAll({
      where: {
        uuid: offers.map((item) => item.uuid),
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

  await UpsellNativeOfferRepository.update({
    where: { id: upsell.id },
    data: upsellNativeDto({ ...upsell, ...dataToUpdate, offerId: offer.id }),
  });

  return upsellSerealizer({
    ...upsell,
    ...dataToUpdate,
    upsellProductId: productUuid,
    upsellOfferId: offerUuid,
    offerId: offer.id,
    creationOrigin: 'self',
    isOneClick: Boolean(dataToUpdate.isOneClick),
    isEmbedVideo: Boolean(dataToUpdate.isEmbedVideo),
    isMessageNotClose: Boolean(dataToUpdate.isMessageNotClose),
    isMultiOffer: Boolean(dataToUpdate.isMultiOffer),
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

  await UpsellNativeOfferRepository.update({
    where: { id },
    data: {
      media_embed: data.media_embed,
      media_url: null,
    },
  });
}

async function UpdateImage(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const offer = await verifyOfferExists({
    uuid,
    values: ['id'],
    user
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeOfferRepository.update({
    where: { offer_id: offer.id },
    data: {
      media_url: url,
      media_embed: null,
    }
  });

  return { url };
}

async function UpdateTitleImage(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const offer = await verifyOfferExists({
    uuid,
    values: ['id'],
    user
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeOfferRepository.update({
    where: { offer_id: offer.id },
    data: { title_image: url },
  });

  return { url };
}

async function UpdateBackgroundImageDesktop(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const offer = await verifyOfferExists({
    uuid,
    values: ['id'],
    user
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeOfferRepository.update({
    where: { offer_id: offer.id },
    data: { background_image_desktop: url },
  });

  return { url };
}

async function UpdateBackgroundImageMobile(params) {
  const { file, uuid } = params;

  if (!file) {
    throw ApiError.badRequest('Um arquivo de imagem precisa ser enviado');
  }

  const offer = await verifyOfferExists({
    uuid,
    values: ['id'],
    user
  });

  const fileBuffer = await ImageHelper.formatImageCover(
    file.path,
    ImageHelper.CONFIG.PRODUCT_BANNER_MOBILE,
  );

  const dataHeader = await resolveImageFromBuffer(fileBuffer, file.key);

  fs.unlinkSync(file.path);

  const { file: url } = dataHeader;

  await UpsellNativeOfferRepository.update({
    where: { offer_id: offer.id },
    data: { background_image_mobile: url },
  });

  return { url };
}

module.exports = {
  Update,
  UpdateEmbed,
  UpdateImage,
  UpdateTitleImage,
  UpdateBackgroundImageDesktop,
  UpdateBackgroundImageMobile,
};

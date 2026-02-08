const {
  OffersUpsellNativeRepository,
} = require('../../repository/offersUpsell.repository');
const {
  verifyUpsellOfferExists,
} = require('../../validators/upsellOfferExist.validator');
const { verifyOfferExists } = require('../../validators/offerExists.validator');
const {
  UpsellNativeOfferRepository,
} = require('../../../../../repositories/sequelize/upsellNativeOffer');

async function Remove(props) {
  const { uuid, user } = props;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });
  const {
    id: offer_id,
  } = offer;

  const upsell = await verifyUpsellOfferExists({
    offer_id,
    user
  });

  await OffersUpsellNativeRepository.remove({
    where: { upsell_id: upsell.id },
  });

  await UpsellNativeOfferRepository.remove(upsell.id);
}

async function RemoveImage(params) {
  const { uuid, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });
  const {
    id: offer_id,
  } = offer;

  const upsellOffer = await verifyUpsellOfferExists({
    offer_id,
    values: ['id'],
    user
  });
  const { id } = upsellOffer;

  await UpsellNativeOfferRepository.update({
    where: { id },
    data: { media_url: null },
  });
}

async function RemoveEmbed(params) {
  const { uuid, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });
  const {
    id: offer_id,
  } = offer;

  const upsellOffer = await verifyUpsellOfferExists({
    offer_id,
    values: ['id'],
    user
  });
  const { id } = upsellOffer;

  await UpsellNativeOfferRepository.update({
    where: { id },
    data: {
      media_embed: null,
    }
  });
}

async function RemoveTitleImage(params) {
  const { uuid, user } = params;

  const offer = await verifyOfferExists({
    uuid,
    values: ['id', 'id_product', 'uuid'],
    user
  });
  const {
    id: offer_id,
  } = offer;

  const upsellOffer = await verifyUpsellOfferExists({
    offer_id,
    values: ['id'],
    user
  });
  const { id } = upsellOffer;

  await UpsellNativeOfferRepository.update({
    where: { id },
    data: { title_image: null },
  });
}

async function RemoveBackgroundImageDesktop(params) {
  const { uuid, user } = params;

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
    data: { background_image_desktop: null },
  });
}

async function RemoveBackgroundImageMobile(params) {
  const { uuid, user } = params;

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
    data: { background_image_mobile: null },
  });
}

module.exports = {
  Remove,
  RemoveImage,
  RemoveEmbed,
  RemoveTitleImage,
  RemoveBackgroundImageDesktop,
  RemoveBackgroundImageMobile,
};

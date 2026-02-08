const fs = require('fs');
const ApiError = require('../../error/ApiError');
const ImageHelper = require('../../utils/helpers/images');
const SerializeOffer = require('../../presentation/dashboard/offers');
const Cache = require('../../config/Cache');
const {
  updateOrderBump,
  deleteOrderBump,
  createOrderBump,
  findOneOrderBump,
  updateOrderBumpImage,
} = require('../../database/controllers/order_bumps');

const {
  findProductOffer,
} = require('../../database/controllers/product_offer');

const {
  findOfferForUpsellAndOrderBump,
} = require('../../database/controllers/product_offer');
const { resolveImageFromBuffer } = require('../../utils/files');

const invalidateCache = async (uuid) => {
  await Cache.del(`offer_${uuid}`);
  await Cache.del(`offer_checkout_${uuid}`);
};

const updateOrderBumpPriceController = async (req, res, next) => {
  const { order_bump, data, offer } = req;

  try {
    await updateOrderBump(data, { id: order_bump.id });
    await invalidateCache(offer.uuid);

    const newOffer = await findProductOffer({ id: offer.id });
    return res.status(200).send(new SerializeOffer(newOffer).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const deleteOrderBumpController = async (req, res, next) => {
  const {
    order_bump,
    offer: { id: id_offer, uuid },
  } = req;
  try {
    await deleteOrderBump({ id: order_bump.id });
    await invalidateCache(uuid);
    const newOffer = await findProductOffer({ id: id_offer });
    return res.status(200).send(new SerializeOffer(newOffer).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const createOrderBumpController = async (req, res, next) => {
  const {
    offer: { id: id_offer, uuid },
    body: {
      offer_id,
      product_name,
      label,
      title,
      description,
      price_before,
      show_quantity,
      max_quantity,
      plan_id,
    },
    user: { id: id_user },
  } = req;

  try {
    let selectedPlan;

    const orderBumpOffer = await findOfferForUpsellAndOrderBump({
      offer_id,
      id_user,
    });

    if (!orderBumpOffer) throw ApiError.badRequest('Oferta não encontrada');

    const isThereAnOrderBump = await findOneOrderBump({
      id_offer,
      order_bump_offer: orderBumpOffer.id,
    });

    if (isThereAnOrderBump)
      throw ApiError.badRequest('Oferta já é um order bump');

    const obCreated = await createOrderBump({
      title,
      product_name,
      label,
      description,
      id_offer,
      price_before,
      order_bump_offer: orderBumpOffer.id,
      show_quantity,
      max_quantity,
      order_bump_plan: plan_id || null,
    });

    const lastObForResponse = obCreated.get({ plain: true });

    if (plan_id) {
      selectedPlan = orderBumpOffer.plans?.find(
        (plan) => plan.uuid === plan_id,
      );

      if (!selectedPlan) {
        throw ApiError.badRequest(
          'Plano não encontrado ou a oferta não é uma assinatura.',
        );
      }

      lastObForResponse.offer = {
        price: selectedPlan.price,
      };
    }

    await invalidateCache(uuid);
    const newOffer = await findProductOffer({ id: id_offer });

    if (plan_id && newOffer.order_bumps?.length) {
      const newObIndex = newOffer.order_bumps.findIndex(
        (ob) => ob.uuid === obCreated.uuid
      );

      if (newObIndex !== -1 && selectedPlan) {
        newOffer.order_bumps[newObIndex].offer.price = selectedPlan.price;
      }
    }

    return res.status(200).send(
      new SerializeOffer({
        ...newOffer,
        last_ob_created: lastObForResponse,
      }).adapt(),
    );
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const updateOrderBumpImageController = async (req, res, next) => {
  try {
    const { order_bump, file } = req;

    const fileBufferCover = await ImageHelper.formatImageCover(
      file.path,
      ImageHelper.CONFIG.PRODUCT_COVER,
    );

    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);

    fs.unlinkSync(file.path);

    const { file: url, key } = dataCover;

    await updateOrderBumpImage(order_bump.id, {
      cover: url,
      cover_key: key,
    });

    return res.status(200).send({
      success: true,
      message: 'Imagem do order bump atualizada',
      url,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const deleteOrderBumpImageController = async (req, res, next) => {
  try {
    const { order_bump } = req;

    await updateOrderBumpImage(order_bump.id, {
      cover: null,
      cover_key: null,
    });

    return res.status(200).send({
      success: true,
      message: 'Imagem do order bump removida',
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports = {
  updateOrderBumpPriceController,
  deleteOrderBumpController,
  createOrderBumpController,
  invalidateCache,
  updateOrderBumpImageController,
  deleteOrderBumpImageController,
};

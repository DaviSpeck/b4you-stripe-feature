const ApiError = require('../../error/ApiError');
const CreatePixelFacebookUseCase = require('../../useCases/dashboard/pixels/CreateFacebookPixel');
const CreatePixelGoogleAdsUseCase = require('../../useCases/dashboard/pixels/CreateGoogleAds');
const CreatePixelGoogleAnalyticsUseCase = require('../../useCases/dashboard/pixels/CreateGoogleAnalytics');
const CreatePixelPinterestUseCase = require('../../useCases/dashboard/pixels/CreatePinterest');
const CreatePixelOutbrainUseCase = require('../../useCases/dashboard/pixels/CreateOutbrain');
const CreatePixelTaboolaUseCase = require('../../useCases/dashboard/pixels/CreateTaboola');
const CreatePixelTikTokUseCase = require('../../useCases/dashboard/pixels/CreateTikTok');
const CreatePixelKwaiUseCase = require('../../useCases/dashboard/pixels/CreateKwai');
const DeletePixelUseCase = require('../../useCases/dashboard/pixels/DeletePixel');
const FindPixelsUserProductUseCase = require('../../useCases/dashboard/pixels/FindProductUser');
const SerializaPixelList = require('../../presentation/dashboard/pixelList');
const SerializePixel = require('../../presentation/dashboard/pixelCreated');
const UpdateFacebookUseCase = require('../../useCases/dashboard/pixels/UpdateFacebook');
const UpdateGoogleAdsUseCase = require('../../useCases/dashboard/pixels/UpdateGoogleAds');
const UpdateGoogleAnalyticsUseCase = require('../../useCases/dashboard/pixels/UpdateGoogleAnalytics');
const UpdatePinterestUseCase = require('../../useCases/dashboard/pixels/UpdatePinterest');
const UpdateOutbrainUseCase = require('../../useCases/dashboard/pixels/UpdateOutbrain');
const UpdateTaboolaUseCase = require('../../useCases/dashboard/pixels/UpdateTaboola');
const UpdateTikTokUseCase = require('../../useCases/dashboard/pixels/UpdateTikTok');

const controllerCreatePixelFacebook = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: {
      label,
      pixel_id,
      paid_pix,
      generated_pix,
      is_affiliate,
      token,
      domain,
    },
  } = req;
  try {
    const pixelFacebookObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      id_role,
      paid_pix,
      generated_pix,
      is_affiliate,
      token,
      domain,
    };
    const pixel = await new CreatePixelFacebookUseCase(
      pixelFacebookObj,
    ).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelGoogleAnalytics = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: { label, pixel_id },
  } = req;
  try {
    const pixelGoogleAnalyticObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      id_role,
    };
    const pixel = await new CreatePixelGoogleAnalyticsUseCase(
      pixelGoogleAnalyticObj,
    ).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelPinterest = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: { label, pixel_id },
  } = req;

  try {
    const pixelPinterestObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      id_role,
    };
    const pixel = await new CreatePixelPinterestUseCase(
      pixelPinterestObj,
    ).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelKwai = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: {
      label,
      pixel_id,
      trigger_boleto,
      trigger_pix,
      initiate_checkout,
      purchase,
    },
  } = req;
  try {
    const pixelKwaiObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      id_role,
      trigger_boleto,
      trigger_pix,
      initiate_checkout,
      purchase,
    };
    const pixel = await new CreatePixelKwaiUseCase(pixelKwaiObj).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelGoogleAds = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: {
      label,
      pixel_id,
      initiate_checkout,
      purchase,
      trigger_pix,
      trigger_boleto,
    },
  } = req;
  try {
    const pixelGoogleAdsObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      initiate_checkout,
      trigger_pix,
      purchase,
      trigger_boleto,
      id_role,
    };
    const pixel = await new CreatePixelGoogleAdsUseCase(
      pixelGoogleAdsObj,
    ).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelOutbrain = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: {
      label,
      pixel_id,
      conversion_label,
      trigger_checkout,
      trigger_card,
      trigger_boleto,
    },
  } = req;
  try {
    const pixelOutbrainObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      conversion_label,
      trigger_checkout,
      trigger_card,
      trigger_boleto,
      id_role,
    };
    const pixel = await new CreatePixelOutbrainUseCase(
      pixelOutbrainObj,
    ).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelTaboola = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: {
      label,
      pixel_id,
      conversion_label,
      trigger_checkout,
      trigger_card,
      trigger_boleto,
    },
  } = req;
  try {
    const pixelTaboolaObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      conversion_label,
      trigger_checkout,
      trigger_card,
      trigger_boleto,
      id_role,
    };
    const pixel = await new CreatePixelTaboolaUseCase(
      pixelTaboolaObj,
    ).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerCreatePixelTikTok = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product, id_role },
    body: { label, pixel_id, trigger_purchase_boleto },
  } = req;
  try {
    const pixelTikTokObj = {
      id_user,
      id_product,
      label,
      pixel_id,
      trigger_purchase_boleto,
      id_role,
    };
    const pixel = await new CreatePixelTikTokUseCase(pixelTikTokObj).execute();
    return res.status(200).send(new SerializePixel(pixel).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerFindPixelUserProduct = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
  } = req;
  try {
    const pixels = await new FindPixelsUserProductUseCase(
      id_product,
      id_user,
    ).execute();
    return res.status(200).send(new SerializaPixelList(pixels).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerDeletePixel = async (req, res, next) => {
  const {
    params: { pixel_uuid },
    user: { id: id_user },
    product: { id: id_product },
  } = req;
  try {
    await new DeletePixelUseCase(pixel_uuid, id_product, id_user).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateKwai = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelKwaiObj = {
      id_user,
      id_product,
      data: body,
      uuid: pixel_uuid,
    };
    await new UpdateFacebookUseCase(pixelKwaiObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateFacebook = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelFacebookObj = {
      id_user,
      id_product,
      data: body,
      uuid: pixel_uuid,
    };
    await new UpdateFacebookUseCase(pixelFacebookObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateGoogleAnalytics = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelGoogleAnalyticObj = {
      id_user,
      id_product,
      uuid: pixel_uuid,
      data: body,
    };
    await new UpdateGoogleAnalyticsUseCase(pixelGoogleAnalyticObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdatePinterest = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelPinterestObj = {
      id_user,
      id_product,
      uuid: pixel_uuid,
      data: body,
    };
    await new UpdatePinterestUseCase(pixelPinterestObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateGoogleAds = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelGoogleAdsObj = {
      id_user,
      id_product,
      uuid: pixel_uuid,
      data: body,
    };
    await new UpdateGoogleAdsUseCase(pixelGoogleAdsObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateTaboola = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelTaboolaObj = {
      id_user,
      id_product,
      uuid: pixel_uuid,
      data: body,
    };
    await new UpdateTaboolaUseCase(pixelTaboolaObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateOutbrain = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    body,
    params: { pixel_uuid },
  } = req;
  try {
    const pixelOutbrainObj = {
      id_user,
      id_product,
      data: body,
      uuid: pixel_uuid,
    };
    await new UpdateOutbrainUseCase(pixelOutbrainObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const controllerUpdateTikTok = async (req, res, next) => {
  const {
    user: { id: id_user },
    product: { id: id_product },
    params: { pixel_uuid },
    body,
  } = req;
  try {
    const pixelTikTokObj = {
      id_user,
      id_product,
      data: body,
      uuid: pixel_uuid,
    };
    await new UpdateTikTokUseCase(pixelTikTokObj).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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
  controllerCreatePixelFacebook,
  controllerCreatePixelGoogleAds,
  controllerCreatePixelGoogleAnalytics,
  controllerCreatePixelOutbrain,
  controllerCreatePixelTaboola,
  controllerCreatePixelTikTok,
  controllerCreatePixelPinterest,
  controllerDeletePixel,
  controllerFindPixelUserProduct,
  controllerUpdatePinterest,
  controllerUpdateFacebook,
  controllerUpdateGoogleAds,
  controllerUpdateGoogleAnalytics,
  controllerUpdateOutbrain,
  controllerUpdateTaboola,
  controllerUpdateTikTok,
  controllerCreatePixelKwai,
  controllerUpdateKwai,
};

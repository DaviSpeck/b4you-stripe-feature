const { Op } = require('sequelize');
const FileManager = require('../../services/FileManager');
const { CHECKOUT_BASE_URLS } = require('../../utils/urlTransparentCheckout');

const fileManager = new FileManager(process.env.BUCKET_NAME);
const ApiError = require('../../error/ApiError');
const SerializeOffer = require('../../presentation/dashboard/offers');
const SerializeOrderedClassroom = require('../../presentation/dashboard/orderedClassrooms');
const SerializeProduct = require('../../presentation/dashboard/singleProduct');
const SerializeProductsWithOffers = require('../../presentation/dashboard/ProductsWithOffers');
const FindProductsThatArentOrderBumpsUseCase = require('../../useCases/dashboard/orderBumps/FindProductThatArentOrderBumps');
const SerializeOfferInstallments = require('../../presentation/dashboard/offers/offerInstallments');
const Suppliers = require('../../database/models/Suppliers');
const rawData = require('../../database/rawData');
const Cache = require('../../config/Cache');
const {
  createProductOffer,
  updateProductOffer,
  findProductOffers,
  findProductOffersPaginated,
  findProductOffer,
  deleteProductOffer,
  findRawProductOffer,
  findOffersBackRedirect,
  updateProductOfferWhere,
} = require('../../database/controllers/product_offer');
const { findClassrooms } = require('../../database/controllers/classrooms');
const {
  createOfferPlan,
  deleteOfferPlan,
} = require('../../database/controllers/offer_plans');
const {
  findAllFeeInterestCard,
} = require('../../database/controllers/fee_interest_card');
const {
  findAllProductsForSelectUpsellAndOrderBump,
  findProductIdByUuid,
  findCheckoutConfiguration,
  updateProduct,
} = require('../../database/controllers/products');
const ImageHelper = require('../../utils/helpers/images');
const { resolveImageFromBuffer } = require('../../utils/files');
const Plugins = require('../../database/models/Plugins');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const Suppliers_Product = require('../../database/models/Suppliers_Product');
const Products = require('../../database/models/Products');
const normalizeOfferMetadata = require('../../utils/normalizeOfferMetadata');

const invalidateCache = async (uuid) => {
  await Cache.del(`offer_${uuid}`);
  await Cache.del(`offer_checkout_${uuid}`);
};

const findSuppliersByOfferId = async (id_offer) =>
  Suppliers.findAll({
    raw: true,
    where: { id_offer },
    include: [
      {
        association: 'user',
        attributes: ['full_name', 'active'],
      },
    ],
  });

const createOfferController = async (req, res, next) => {
  const {
    offer,
    product: { payment_type },
  } = req;
  try {
    offer.metadata = normalizeOfferMetadata(offer.metadata);
    const { id } = await createProductOffer(offer);
    if (
      payment_type === 'subscription' &&
      offer.plans &&
      Array.isArray(offer.plans)
    ) {
      const plansPromises = [];
      offer.plans.forEach((plan) => {
        plansPromises.push(
          createOfferPlan({
            id_plan: plan.id,
            id_offer: id,
          }),
        );
      });
      await Promise.all(plansPromises);
    }

    const newOffer = await findProductOffer({ id });

    const existisDefaultsSuppliers = await Suppliers_Product.findAll({
      where: {
        id_product: offer.id_product,
        id_status: 2,
      },
    });

    if (existisDefaultsSuppliers.length > 0) {
      const suppliersPromises = [];

      existisDefaultsSuppliers.forEach((supplier) => {
        suppliersPromises.push(
          Suppliers.create({
            id_user: supplier.id_user,
            id_status: supplier.id_status,
            id_product: supplier.id_product,
            id_offer: newOffer.id,
            amount: supplier.amount,
            receives_shipping_amount: supplier.receives_shipping_amount,
          }),
        );
      });

      await Promise.all(suppliersPromises);
    }

    return res
      .status(200)
      .send(new SerializeOffer({ ...newOffer, payment_type }).adapt());
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

const duplicateOfferController = async (req, res, next) => {
  const {
    params: { offer_id },
  } = req;
  try {
    const offer = await findRawProductOffer({ uuid: offer_id });
    if (!offer) throw ApiError.badRequest('Oferta não encontrada');
    const {
      id: _id,
      uuid: _uuid,
      created_at: _created_at,
      updated_at: _updated_at,
      ...copyOffer
    } = offer;
    const newOffer = await createProductOffer(copyOffer);

    const originalSuppliers = await findSuppliersByOfferId(offer.id);

    await Promise.all(
      originalSuppliers.map((s) =>
        Suppliers.create({
          id_user: s.id_user,
          amount: s.amount,
          receives_shipping_amount: s.receives_shipping_amount,
          id_product: newOffer.id_product,
          id_offer: newOffer.id,
          id_status: s.id_status,
        }),
      ),
    );

    return res.sendStatus(200);
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

const updateOfferController = async (req, res, next) => {
  const {
    data,
    offer,
    plans,
    product: { payment_type },
  } = req;

  try {
    data.metadata = normalizeOfferMetadata(data.metadata);
    data.bling_sku = data.bling_sku?.trim() === '' ? null : data.bling_sku;
    data.tiny_sku = data.tiny_sku?.trim() === '' ? null : data.tiny_sku;

    const hasUpsellUrl = data.thankyou_page_upsell && data.thankyou_page_upsell.trim() !== '';
    const hasUpsellId = data.id_upsell && data.id_upsell !== null;
    const isClearing = 'thankyou_page_upsell' in data || 'id_upsell' in data;

    if (hasUpsellUrl || hasUpsellId) {
      data.is_upsell_active = true;
    } else if (isClearing && !hasUpsellUrl && !hasUpsellId) {
      data.is_upsell_active = false;
    }

    await updateProductOffer(offer.id, data);

    if (payment_type === 'subscription' && plans && Array.isArray(plans)) {
      await deleteOfferPlan({ id_offer: offer.id });
      const plansPromises = [];
      plans.forEach((plan) => {
        plansPromises.push(
          createOfferPlan({
            id_plan: plan.id,
            id_offer: offer.id,
          }),
        );
      });
      await Promise.all(plansPromises);
    }

    await invalidateCache(offer.uuid);
    const updatedOffer = await findProductOffer({ id: offer.id });

    let has_bling = false;
    if (updatedOffer.has_bling) has_bling = true;
    let has_tiny = false;
    if (updatedOffer.has_tiny) has_tiny = true;

    return res
      .status(200)
      .send(new SerializeOffer(updatedOffer, has_bling, has_tiny).adapt());
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

const updateOfferVideoController = async (req, res, next) => {
  const {
    body: { embed },
    offer,
  } = req;
  try {
    await updateProductOffer(offer.id, { url_video_checkout: embed });
    await invalidateCache(offer.uuid);
    return res.sendStatus(200);
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

const deleteOfferVideoController = async (req, res, next) => {
  const { offer } = req;
  try {
    await updateProductOffer(offer.id, { url_video_checkout: null });
    await invalidateCache(offer.uuid);
    return res.sendStatus(200);
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

const updateOfferImage3StepsController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.resizeHeaderMobile(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      offer_image: url,
      offer_image_key: key,
    });
    if (offer.offer_image) await fileManager.deleteFile(offer.offer_image);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta para 3 etapas atualizada',
      url,
      key,
      name: 'offer_image',
    });
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

const updateOfferImageSecondaryController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.formatImageCover(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_DESKTOP,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      banner_image_secondary: url,
      banner_image_secondary_key: key,
    });
    if (offer.banner_image_secondary_key)
      await fileManager.deleteFile(offer.banner_image_secondary_key);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta atualizada',
      url,
      key,
      name: 'banner_secondary',
    });
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

const updateOfferImageMobileController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.resizeHeaderMobile(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      banner_image_mobile: url,
      banner_image_mobile_key: key,
    });
    if (offer.banner_image_mobile_key)
      await fileManager.deleteFile(offer.banner_image_mobile_key);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta mobile atualizada',
      url,
      key,
      name: 'banner_mobile',
    });
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

const updateOfferImageMobileSecondaryController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.resizeHeaderMobile(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      banner_image_mobile_secondary: url,
      banner_image_mobile_secondary_key: key,
    });
    if (offer.banner_image_mobile_secondary_key)
      await fileManager.deleteFile(offer.banner_image_mobile_secondary_key);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta mobile atualizada',
      url,
      key,
      name: 'banner_mobile_secondary',
    });
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

const updateOfferImageOfferImageController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.resizeHeaderMobile(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_MOBILE,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      offer_image: url,
      offer_image_key: key,
    });
    if (offer.offer_image_key)
      await fileManager.deleteFile(offer.offer_image_key);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta alternativa',
      url,
      key,
      name: 'offer_image',
    });
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

const updateOfferImageController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.resizeHeaderMobile(
      file.path,
      ImageHelper.CONFIG.PRODUCT_HEADER_DESKTOP,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      banner_image: url,
      banner_image_key: key,
    });
    if (offer.banner_image_key)
      await fileManager.deleteFile(offer.banner_image_key);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta mobile atualizada',
      url,
      key,
      name: 'banner',
    });
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

const updateOfferImageSidebarController = async (req, res, next) => {
  const { offer, file } = req;
  try {
    const fileBufferCover = await ImageHelper.resizeImageSidebar(
      file.path,
      ImageHelper.CONFIG.PRODUCT_SIDEBAR_DESKTOP,
    );
    const dataCover = await resolveImageFromBuffer(fileBufferCover, file.key);
    const { file: url, key } = dataCover;
    await updateProductOffer(offer.id, {
      sidebar_image: url,
      sidebar_image_key: key,
    });
    if (offer.sidebar_image_key)
      await fileManager.deleteFile(offer.sidebar_image_key);
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem da oferta lateral atualizada',
      url,
      key,
      name: 'sidebar',
    });
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

const deleteOfferImageController = async (req, res, next) => {
  const {
    offer,
    params: { field },
  } = req;
  try {
    if (field === 'banner') {
      await updateProductOffer(offer.id, {
        banner_image: null,
        banner_image_key: null,
      });
      await fileManager.deleteFile(offer.banner_image_key);
    }
    if (field === 'banner_mobile') {
      await updateProductOffer(offer.id, {
        banner_image_mobile: null,
        banner_image_mobile_key: null,
      });
      await fileManager.deleteFile(offer.banner_image_mobile_key);
    }
    if (field === 'banner_mobile_secondary') {
      await updateProductOffer(offer.id, {
        banner_image_mobile_secondary: null,
        banner_image_mobile_secondary_key: null,
      });
      await fileManager.deleteFile(offer.banner_image_mobile_secondary_key);
    }
    if (field === 'offer_image') {
      await updateProductOffer(offer.id, {
        offer_image: null,
      });
      await fileManager.deleteFile(offer.offer_image.split('/').pop());
    }
    if (field === 'sidebar') {
      await updateProductOffer(offer.id, {
        sidebar_image: null,
        sidebar_image_key: null,
      });
      await fileManager.deleteFile(offer.sidebar_image_key);
    }
    if (field === 'banner_secondary') {
      await updateProductOffer(offer.id, {
        banner_image_secondary: null,
        banner_image_secondary_key: null,
      });
      await fileManager.deleteFile(offer.banner_image_secondary_key);
    }
    await invalidateCache(offer.uuid);
    return res.status(200).send({
      success: true,
      message: 'Imagem deletada',
      field,
    });
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

const findOffersController = async (req, res, next) => {
  const {
    query: { page = 0, size = 10 },
    product: { id: id_product },
  } = req;
  try {
    const offers = await findProductOffers({ id_product }, page, size);
    return res.status(200).send({
      count: offers.count,
      rows: new SerializeOffer(rawData(offers.rows)).adapt(),
    });
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

const findOfferByUuidController = async (req, res, next) => {
  try {
    const offer = await findProductOffer({ uuid: req.params.offer_uuid });

    if (!offer) {
      return res.status(404).json({ message: 'Oferta não encontrada' });
    }

    return res.status(200).send(offer);
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

const findOffersPaginatedController = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, name = null, status },
    product: { id: id_product },
    user: { id },
  } = req;

  const where = {
    id_product,
  };

  if (name) where.name = { [Op.like]: `%${name}%` };

  if (status === 'active') {
    where.active = 1;
  } else if (status === 'inactive') {
    where.active = 0;
  }

  try {
    const offers = await findProductOffersPaginated(where, page, size);

    const plugin = await Plugins.findOne({
      where: {
        id_user: id,
        id_plugin: [
          findIntegrationTypeByKey('blingshippingv3').id,
          findIntegrationTypeByKey('blingshipping').id,
        ],
      },
    });

    let has_bling = false;
    if (plugin) has_bling = true;

    const pluginTiny = await Plugins.findOne({
      where: {
        id_user: id,
        id_plugin: [findIntegrationTypeByKey('tiny').id],
      },
    });

    let has_tiny = false;
    if (pluginTiny) has_tiny = true;

    const serializedOffers = new SerializeOffer(
      rawData(offers.rows),
      has_bling,
      has_tiny,
    ).adapt();

    const updatedOffers = serializedOffers.map((offer) => {
      if (CHECKOUT_BASE_URLS[id_product]) {
        return {
          ...offer,
          url_checkout: `${CHECKOUT_BASE_URLS[id_product]}/${offer.uuid}`,
        };
      }
      return offer;
    });

    return res.status(200).send({
      count: offers.count,
      rows: updatedOffers,
    });
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

const findOfferClassroomsController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const classrooms = await findClassrooms({ id_product });
    if (classrooms.length === 0) return res.status(200).send(classrooms);
    const orderedClassrooms = classrooms.sort(
      (a, b) => b.is_default - a.is_default,
    );
    return res
      .status(200)
      .send(new SerializeOrderedClassroom(orderedClassrooms).adapt());
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

const deleteOfferController = async (req, res, next) => {
  const { offer } = req;
  try {
    await deleteProductOffer({ id: offer.id });
    await invalidateCache(offer.uuid);
    return res.sendStatus(200);
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

const findProductsThatArentOrderBumpsController = async (req, res, next) => {
  const {
    params: { offer_id },
    user: { id: id_user },
    product: { id: id_product },
  } = req;
  try {
    const products = await new FindProductsThatArentOrderBumpsUseCase(
      offer_id,
      id_product,
      id_user,
    ).execute();
    return res.status(200).send(new SerializeProduct(products).adapt());
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

const findProductOffersController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { subscriptions = true },
  } = req;

  try {
    const productsWithOffers = await findAllProductsForSelectUpsellAndOrderBump(
      {
        id_user,
        subscriptions,
      },
    );

    productsWithOffers.forEach((product) => {
      if (Array.isArray(product.product_offer)) {
        product.product_offer.forEach((offer) => {
          if (
            product.payment_type === 'subscription' &&
            offer.plans?.length > 0
          ) {
            const minPrice = offer.plans.reduce((min, plan) => {
              if (plan.price !== null && (min === null || plan.price < min)) {
                return plan.price;
              }
              return min;
            }, null);
            offer.price = minPrice;
          }
        });
      }
    });

    const plugin = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: [
          findIntegrationTypeByKey('blingshippingv3').id,
          findIntegrationTypeByKey('blingshipping').id,
        ],
      },
    });

    let has_bling = false;
    if (plugin) has_bling = true;

    return res
      .status(200)
      .send(
        new SerializeProductsWithOffers(productsWithOffers, has_bling).adapt(),
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

const findOffersBackRedirectController = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { offer_id },
  } = req;
  try {
    const offer = await findRawProductOffer({ uuid: offer_id });
    const offers = await findOffersBackRedirect({
      id_product,
      uuid: {
        [Op.ne]: offer_id,
      },
    });

    offers.map((element) => {
      if (element.plans.length > 0) {
        element.price = element.plans.sort(
          (a, b) => a.price - b.price,
        )[0].price;
      }
      return element;
    });

    if (offer.uuid_offer_back_redirect) {
      const offerSelect = await findRawProductOffer({
        uuid: offer.uuid_offer_back_redirect,
      });
      offers.unshift({
        uuid: offerSelect.uuid,
        name: offerSelect.name,
        price: offerSelect.price,
      });
    }
    const key = 'uuid';
    const unique = [
      ...new Map(offers.map((item) => [item[key], item])).values(),
    ];

    return res
      .status(200)
      .send(unique.map(({ uuid, price, name }) => ({ uuid, price, name })));
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

const updateOffersBackRedirectController = async (req, res, next) => {
  const {
    params: { offer_id },
    body: { backRedirect },
  } = req;
  try {
    if (!backRedirect) {
      await updateProductOfferWhere(
        { uuid: offer_id },
        { uuid_offer_back_redirect: null },
      );
    } else {
      await updateProductOfferWhere(
        { uuid: offer_id },
        { uuid_offer_back_redirect: backRedirect },
      );
    }
    return res.sendStatus(200);
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

const getOfferInstallmentsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    offer: { installments },
  } = req;
  try {
    const where = {
      [Op.or]: {
        id_user,
        is_default: true,
      },
    };
    const feeInterestCard = await findAllFeeInterestCard(where);
    const settingsFeeUser =
      feeInterestCard.length === 1
        ? feeInterestCard[0]
        : feeInterestCard.find((fee) => fee.id_user === id_user);
    return res
      .status(200)
      .send(
        new SerializeOfferInstallments(settingsFeeUser, installments).adapt(),
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

const updateOfferByProductController = async (req, res, next) => {
  const {
    params: { product_uuid },
    body: { customizations },
  } = req;
  try {
    const product_id = await findProductIdByUuid({ uuid: product_uuid });

    await updateProduct(product_id.id, {
      available_checkout_link_types:
        customizations.available_checkout_link_types,
    });

    if (!customizations) {
      await updateProductOfferWhere(
        { uuid: product_id.id },
        { checkout_customizations: null },
      );
    } else {
      await updateProductOfferWhere(
        { id_product: product_id.id },
        {
          checkout_customizations: {
            ...customizations,
            available_checkout_link_types: String(
              customizations.availabel_checkout_link_types,
            ),
          },
          default_installment: Number(customizations.default_installment),
        },
      );
    }
    const newCustomizations = await findCheckoutConfiguration({
      id_product: product_id.id,
    });
    return res.json({ ...newCustomizations.checkout_customizations });
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

const getCheckoutCustomizationsByProductUuidController = async (
  req,
  res,
  next,
) => {
  const {
    params: { product_uuid },
  } = req;
  try {
    const product_id = await findProductIdByUuid({ uuid: product_uuid });

    const { available_checkout_link_types } = await Products.findOne({
      nest: true,
      raw: true,
      where: {
        id: product_id.id,
      },
      attributes: ['available_checkout_link_types'],
    });

    const customizations = await findCheckoutConfiguration({
      id_product: product_id.id,
    });

    return res
      .status(200)
      .send({
        ...customizations.checkout_customizations,
        available_checkout_link_types,
      });
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

const updateOfferByUuidController = async (req, res, next) => {
  const { offer_uuid } = req.params;
  const data = req.body;

  try {
    const offer = await findProductOffer({ uuid: offer_uuid });

    if (!offer) {
      return res.status(404).send({ message: 'Oferta não encontrada' });
    }

    const hasUpsellUrl = data.thankyou_page_upsell && data.thankyou_page_upsell.trim() !== '';
    const hasUpsellId = data.id_upsell && data.id_upsell !== null;
    const isClearing = 'thankyou_page_upsell' in data || 'id_upsell' in data;

    if (hasUpsellUrl || hasUpsellId) {
      data.is_upsell_active = true;
    } else if (isClearing && !hasUpsellUrl && !hasUpsellId) {
      data.is_upsell_active = false;
    }

    await updateProductOffer(offer.id, data);
    await invalidateCache(offer_uuid);

    return res.status(200).send({ message: 'Oferta atualizada com sucesso' });
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

const findOffersByProductUuidController = async (req, res, next) => {
  const { product_uuid } = req.params;

  try {
    const product = await Products.findOne({
      where: { uuid: product_uuid },
      attributes: ['id'],
    });

    if (!product) {
      return res.status(404).send({ message: 'Produto não encontrado' });
    }

    const offers = await findProductOffers({ id_product: product.id }, 0, 100);

    return res.status(200).send(
      new SerializeOffer(rawData(offers.rows)).adapt()
    );
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

module.exports = {
  getCheckoutCustomizationsByProductUuidController,
  createOfferController,
  deleteOfferController,
  duplicateOfferController,
  findOfferByUuidController,
  findOfferClassroomsController,
  findOffersController,
  findProductOffersController,
  findProductsThatArentOrderBumpsController,
  getOfferInstallmentsController,
  updateOfferController,
  updateOfferImageController,
  updateOfferImageMobileController,
  updateOfferImageMobileSecondaryController,
  updateOfferImageSidebarController,
  deleteOfferImageController,
  updateOfferImageSecondaryController,
  updateOfferVideoController,
  deleteOfferVideoController,
  findOffersBackRedirectController,
  updateOffersBackRedirectController,
  findOffersPaginatedController,
  updateOfferImage3StepsController,
  updateOfferByProductController,
  updateOfferImageOfferImageController,
  updateOfferByUuidController,
  findOffersByProductUuidController,
};

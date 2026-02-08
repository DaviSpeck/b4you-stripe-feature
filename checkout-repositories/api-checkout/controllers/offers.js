const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const SerializeOffer = require('../presentation/checkout/offers');
const FindOfferCart = require('../useCases/checkout/offers/FindOfferCart');
const FindOfferbyShopifyId = require('../useCases/checkout/offers/FindOffer');
const SerializeOfferInfo = require('../presentation/checkout/offerInfo');
const {
  findSaleItemWithStudent,
} = require('../database/controllers/sales_items');
const FindAffiliate = require('../useCases/checkout/affiliates/FindAffiliate');
const { findAllPixel } = require('../database/controllers/pixels');
const { findOneCoupon } = require('../database/controllers/coupons');
const { findRoleTypeByKey } = require('../types/roles');
const SalesSettingsRepository = require('../repositories/sequelize/SalesSettingsRepository');
const Users = require('../database/models/Users');
const Affiliates = require('../database/models/Affiliates');
const Coproductions = require('../database/models/Coproductions');
const Managers = require('../database/models/Managers');
const dateHelper = require('../utils/helpers/date');
const createProductOffer = require('../database/controllers/product_offer');
const product = require('../database/controllers/products');
const Suppliers = require('../database/models/Suppliers');
const Cache = require('../config/Cache');
const date = require('../utils/helpers/date');
const CouponsUse = require('../database/models/CouponsUse');
const { getRawDocument } = require('../utils/formatters');
const { findFrenet } = require('./common');
const { createCookie } = require('../database/controllers/cookies_jar');
const uuidHelper = require('../utils/helpers/uuid');
const {
  validateCouponOffers,
} = require('../useCases/checkout/sales/validateCouponOffers');
const {
  findAffiliateClick,
  createAffiliateClick,
  updateAffiliateClick,
} = require('../database/controllers/affiliates');
const Coupons = require('../database/models/Coupons');
const Coupons_product_offers = require('../database/models/Coupons_product_offers');
const { getRequestDomain } = require('../utils/getRequestDomain');
const Upsell_native_offer = require('../database/models/Upsell_native_offer');
const Product_offer = require('../database/models/Product_offer');
const Products = require('../database/models/Products');
const Upsell_native_product = require('../database/models/Upsell_native_product');
const Offers_upsell_native = require('../database/models/Offers_upsell-native');
const {
  GetPaymentDataByOfferUuid,
  GetPaymentPixData,
} = require('../useCases/checkout/upsellNative/service/getPaymentInfoByOfferUuid.service');
// const Sales_settings = require('../database/models/Sales_settings');

const createShopifyProductOffer = async (req, res, next) => {
  const {
    uuid,
    name,
    price,
    description,
    payment_methods,
    allow_affiliate,
    discount_pix,
    installments,
    shipping_price,
    shipping_type,
    student_pays_interest,
    metadata,
    offer_image,
    allow_shipping_region,
    shipping_price_no,
    shipping_price_ne,
    shipping_price_co,
    shipping_price_su,
    shipping_price_so,
    thankyou_page,
    thankyou_page_upsell,
    allow_coupon,
    supplier_email,
    supplier_amount,
    shipping_text,
    dimensions,
    checkout_customizations,
    dynamic_supplier_amount,
    dynamic_supplier_email,
  } = req.body;
  try {
    const userAgent = req.headers['user-agent'] || '';

    if (
      userAgent.toLowerCase().includes('postman') ||
      userAgent.toLowerCase().includes('insomnia') ||
      userAgent.toLowerCase().includes('curl')
    ) {
      return res.status(403).send({ error: 'Solicitação inválida.' });
    }
    const j_offer_image = offer_image;
    const getProductIdByUuid = await product.findOneProduct({ uuid });

    if (!getProductIdByUuid) {
      return res.status(404).send({
        error: `Produto não encontrado para o UUID informado (${uuid}).`,
      });
    }

    const { id } = getProductIdByUuid;
    let effectivePrice;

    try {
      if (
        metadata &&
        metadata.line_items &&
        Array.isArray(metadata.line_items)
      ) {
        const lineItems = metadata.line_items;

        if (!lineItems.length) {
          return res.status(400).send({
            error: 'Solicitação inválida.',
          });
        }

        const totalFromMetadata = lineItems.reduce((acc, item) => {
          const itemPrice = Number(item.price || 0);
          const quantity = Number(item.quantity || 1);

          const discount =
            Number(item.total_discount || 0) ||
            (Array.isArray(item.discount_allocations)
              ? item.discount_allocations.reduce(
                (sum, d) => sum + Number(d.amount || 0),
                0,
              )
              : 0);

          return acc + (itemPrice * quantity) - discount;
        }, 0);

        effectivePrice = Number(totalFromMetadata.toFixed(2))

        if (!Number.isFinite(effectivePrice)) {
          return res.status(400).send({
            error: 'Solicitação inválida.',
          });
        }

        const expectedPrice = parseFloat(price);
        const isPriceValid = Math.abs(expectedPrice - effectivePrice) < 0.01;

        const isNameValid = lineItems.every((item) =>
          name.includes(item.title),
        );

        if (!isPriceValid || !isNameValid) {
          return res.status(400).send({
            error: 'Solicitação inválida.',
          });
        }
      } else {
        return res.status(400).send({
          error: 'Solicitação inválida.',
        });
      }
    } catch (error) {
      return res.status(400).send({
        error: 'Solicitação inválida.',
      });
    }
    const hasOffer = await createProductOffer.findProductOffer({
      id_product: id,
      name,
      price: effectivePrice,
      payment_methods,
      shipping_price,
    });
    if (!hasOffer) {
      const newOffer = await createProductOffer.createProductOffer({
        id_product: id,
        name,
        price: effectivePrice,
        description,
        payment_methods,
        allow_affiliate,
        discount_pix,
        installments,
        shipping_price,
        shipping_type,
        student_pays_interest,
        metadata,
        offer_image: j_offer_image,
        affiliate_visible: false,
        thankyou_page: thankyou_page || '',
        thankyou_page_upsell: thankyou_page_upsell || '',
        allow_shipping_region: allow_shipping_region || 0,
        shipping_price_no: shipping_price_no || 0,
        shipping_price_ne: shipping_price_ne || 0,
        shipping_price_co: shipping_price_co || 0,
        shipping_price_su: shipping_price_su || 0,
        shipping_price_so: shipping_price_so || 0,
        allow_coupon: allow_coupon || 1,
        shipping_text: shipping_text || '',
        dimensions: dimensions || '{}',
        checkout_customizations: checkout_customizations || '{}',
      });
      //---------------------
      if (
        supplier_email &&
        typeof supplier_email === 'string' &&
        supplier_email.trim() !== ''
      ) {
        const user = await Users.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            email: supplier_email,
          },
        });
        if (!user) {
          return null;
        }
        if (user.id === product.id_user) {
          return null;
        }
        const supplier = await Suppliers.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: user.id,
            id_product: newOffer.id_product,
            id_offer: newOffer.id,
            id_status: [1, 2],
          },
        });
        if (supplier) {
          return null;
        }
        const aff = await Affiliates.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: user.id,
            id_product: newOffer.id_product,
            status: [1, 2, 3],
          },
        });
        if (aff) {
          return null;
        }
        const coprod = await Coproductions.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: user.id,
            id_product: newOffer.id_product,
            status: [1, 2],
          },
        });
        if (coprod) {
          return null;
        }
        const manager = await Managers.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: user.id,
            id_product: newOffer.id_product,
            id_status: [1, 2],
          },
        });
        if (manager) {
          return null;
        }
        await Suppliers.create({
          id_user: user.id,
          id_status: 2,
          id_product: newOffer.id_product,
          id_offer: newOffer.id,
          amount: supplier_amount,
        });
      }
      //---------------------
      if (
        dynamic_supplier_email &&
        typeof dynamic_supplier_email === 'string' &&
        dynamic_supplier_email.trim() !== ''
      ) {
        const dynamic_user = await Users.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            email: dynamic_supplier_email,
          },
        });
        if (!dynamic_user) {
          return null;
        }
        if (dynamic_user.id === product.id_user) {
          return null;
        }
        const dynamic_supplier = await Suppliers.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: dynamic_user.id,
            id_product: newOffer.id_product,
            id_offer: newOffer.id,
            id_status: [1, 2],
          },
        });
        if (dynamic_supplier) {
          return null;
        }
        const dynamic_aff = await Affiliates.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: dynamic_user.id,
            id_product: newOffer.id_product,
            status: [1, 2, 3],
          },
        });
        if (dynamic_aff) {
          return null;
        }
        const dynamic_acoprod = await Coproductions.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: dynamic_user.id,
            id_product: newOffer.id_product,
            status: [1, 2],
          },
        });
        if (dynamic_acoprod) {
          return null;
        }
        const dynamic_manager = await Managers.findOne({
          raw: true,
          attributes: ['id'],
          where: {
            id_user: dynamic_user.id,
            id_product: newOffer.id_product,
            id_status: [1, 2],
          },
        });
        if (dynamic_manager) {
          return null;
        }
        await Suppliers.create({
          id_user: dynamic_user.id,
          id_status: 2,
          id_product: newOffer.id_product,
          id_offer: newOffer.id,
          amount: dynamic_supplier_amount,
        });
      }
      //----------
      return res.status(200).send({ newOffer });
    }
    if (hasOffer) {
      // await getAllDiscountCodes(getProductIdByUuid.id_user, hasOffer.id);
      if (
        !hasOffer.metadata ||
        Object.keys(hasOffer.metadata).length === 0 ||
        hasOffer.metadata === '[]' ||
        hasOffer.metadata === '{}'
      ) {
        await createProductOffer.updateProductOfferMetadata(
          hasOffer.id,
          metadata,
        );
      }
      if (hasOffer.offer_image === '' || hasOffer.offer_image === null) {
        await createProductOffer.updateProductOfferImage(
          hasOffer.id,
          offer_image,
        );
      }
    }
    return res.status(200).send({ hasOffer });
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

const findOfferController = async (req, res, next) => {
  const {
    params: { offer_id },
    query: { shopifyQtd, shopifyCprod, b4f },
    session: { personal_data },
    cookies: { sixid },
  } = req;
  try {
    const offer = await new FindOfferCart(offer_id).execute();

    if (!offer) {
      return res.sendStatus(400);
    }

    if (offer.popup?.coupon) {
      const coupon = await Coupons.findOne({
        where: {
          uuid: offer.popup.coupon,
        },
      });

      if (coupon) {
        offer.popup.coupon = coupon;
      }
    }

    if (Array.isArray(offer.order_bumps)) {
      offer.order_bumps = offer.order_bumps.map((bump) => {
        if (
          bump.offer &&
          bump.offer.offer_product &&
          bump.offer.offer_product.payment_type === 'subscription' &&
          bump.order_bump_plan &&
          Array.isArray(bump.offer.plans)
        ) {
          const plan = bump.offer.plans.find(
            (p) => p.uuid === bump.order_bump_plan,
          );
          if (plan) {
            bump.offer.price = plan.price;
          }
        }
        return bump;
      });
    }

    let hasActiveCoupon = false;

    if (offer.allow_coupon) {
      hasActiveCoupon = await findOneCoupon(
        {
          active: true,
          id_product: offer.id_product,
          [Op.or]: [{ restrict_offers: false }, { '$offers.id$': offer.id }],
        },
        {
          include: [
            {
              association: 'offers',
              attributes: ['id'],
              through: { attributes: [] },
              required: false,
            },
          ],
        },
      );
    }

    const settings = await SalesSettingsRepository.find(
      offer.offer_product.id_user,
    );

    let eventId = null;

    if (req.session.pixels) {
      eventId = req.session.pixels.eventId;
    } else {
      eventId = req.session.id;
      req.session.pixels = {
        eventId,
      };
    }

    let customizations = '';

    if (offer.checkout_customizations) {
      customizations = offer.checkout_customizations;
      customizations.alternative_name = offer.alternative_name;
      customizations.alternative_image = offer.offer_image;
      customizations.shipping_text = offer.shipping_text;
      customizations.default_installment = offer.default_installment;
    }
    const shipping_by_region = {};

    if (offer.allow_shipping_region === 1) {
      shipping_by_region.no = offer.shipping_price_no;
      shipping_by_region.ne = offer.shipping_price_ne;
      shipping_by_region.co = offer.shipping_price_co;
      shipping_by_region.so = offer.shipping_price_so;
      shipping_by_region.su = offer.shipping_price_su;
    }

    let offerShopify = '';

    if (shopifyCprod) {
      offerShopify = await new FindOfferbyShopifyId(shopifyCprod).execute();
    } else if (offer.metadata) {
      offerShopify = offer.metadata;
      if (
        offer.offer_image &&
        offer.offer_image !== undefined &&
        offer.offer_image.length > 0
      ) {
        try {
          const imageOffers = offer.offer_image;
          offerShopify = Object.values(offer.metadata.line_items).map(
            (metaItem) => {
              const imageItem = imageOffers.find(
                (img) => img.variant_id === metaItem.variant_id,
              );
              return {
                ...metaItem,
                ...(imageItem || {}),
              };
            },
          );
        } catch (error) {
          offerShopify = '';
        }
      }
    } else {
      offerShopify = 'Não foi possível encontrar ofertas shopify';
    }

    const calculateMaxAge = ({ cookies_validity }) => {
      if (cookies_validity === 0) {
        return dateHelper().add(5, 'y');
      }
      return dateHelper().add(cookies_validity, 'd');
    };

    let sixidId = sixid;

    if (!sixid && b4f) {
      sixidId = uuidHelper.nanoid();

      const findAffiliate = await new FindAffiliate({
        b4f,
        id_product: offer.id_product,
      }).execute();

      if (findAffiliate) {
        await createCookie({
          sixid: sixidId,
          id_offer: offer.id,
          id_product: offer.id_product,
          id_affiliate: findAffiliate.id,
          max_age: calculateMaxAge(offer.offer_product.affiliate_settings),
        });
      }
    }

    const affiliate = await new FindAffiliate({
      b4f,
      id_offer: offer.id,
      id_product: offer.id_product,
      affiliate_settings: offer.offer_product.affiliate_settings,
    }).execute();

    const has_frenet = await findFrenet(offer.offer_product);

    const diffInMinutes = (dateLastClick) => {
      const now = new Date();
      const diffInMs = now - dateLastClick;
      const diff = diffInMs / 1000 / 60;
      return diff;
    };

    if (affiliate) {
      const ip = req.ip ?? '159753654852';
      const redisKey = `last-click-link-event:${affiliate.id}:${offer.id}:${offer.id_product}:${ip}`;
      const lastClickFind = await Cache.get(redisKey);
      const lastClickMinutes = diffInMinutes(new Date(lastClickFind));

      const params = {
        id_product: offer.id_product,
        id_affiliate: affiliate.id,
        id_producer: offer.offer_product.id_user,
        id_offer: offer.id,
      };

      const findClick = await findAffiliateClick(params);

      if (findClick && lastClickMinutes >= 10) {
        await Cache.set(redisKey, new Date());
        await updateAffiliateClick(params, {
          click_amount: findClick.dataValues.click_amount + 1,
          updated_at: new Date(),
        });
      }

      if (!findClick) {
        await Cache.set(redisKey, new Date());
        await createAffiliateClick({
          ...params,
          click_amount: 1,
        });
      }

      const pixels = await findAllPixel({
        id_user: affiliate.id_user,
        id_role: findRoleTypeByKey('affiliate').id,
        id_product: offer.id_product,
      });
      if (pixels.length > 0) {
        offer.offer_product.pixels = [...pixels, ...offer.offer_product.pixels];
      }
      const affiliateUser = await Users.findOne({
        raw: true,
        attributes: [
          'verified_id',
          'verified_company_pagarme',
          'verified_pagarme',
          'verified_company_pagarme_3',
          'verified_pagarme_3',
        ],
        where: {
          id: affiliate.id_user,
        },
      });
      affiliate.user = affiliateUser;
    }

    const requestDomain = getRequestDomain(req);

    const turnstileKey2Domains = [
      'pay.b4you.com.br',
      'seguro.lummibrazil.com.br',
      'seguro.lipomonster.com.br',
      'checkout.avenaplus.com.br',
      'seguro.usebearry.com.br',
      'seguro.nutriccionforlife.com.br',
      'seguro.nandaintimus.com.br',
      'seguro.sejaziva.com.br',
      'pagamento.sejaziva.com.br',
    ];

    const isTurnstileKey2Domain = turnstileKey2Domains.some((domain) =>
      requestDomain.includes(domain),
    );

    const site_key =
      process.env.ENVIRONMENT === 'PRODUCTION' && isTurnstileKey2Domain
        ? process.env.TURNSTILE_SITE_KEY_2
        : process.env.TURNSTILE_SITE_KEY;

    const findProduct = await Products.findOne({
      where: { id: offer.id_product },
      // attributes: [
      //   'id',
      //   'is_upsell_active',
      //   'content_delivery',
      //   'cover',
      //   'name',
      // ],
      raw: true,
    });

    let upsellNativeData = await Upsell_native_offer.findOne({
      where: {
        offer_id: offer.id,
      },
      raw: true,
    });

    if (!upsellNativeData) {
      upsellNativeData = await Upsell_native_product.findOne({
        where: { product_id: findProduct.id },
        raw: true,
      });
    }

    let upsellNativeProductUuidSelected = null;
    let upsellNativeOfferUuidSelected = null;

    if (upsellNativeData && upsellNativeData.upsell_product_id) {
      const { uuid } = await Products.findOne({
        where: {
          id: upsellNativeData.upsell_product_id,
        },
        raw: true,
        attributes: ['uuid'],
      });
      upsellNativeProductUuidSelected = uuid;
    }

    if (upsellNativeData && upsellNativeData.upsell_offer_id) {
      const { uuid } = await Product_offer.findOne({
        where: {
          id: upsellNativeData.upsell_offer_id,
        },
        raw: true,
        attributes: ['uuid'],
      });
      upsellNativeOfferUuidSelected = uuid;
    }

    let offers;

    if (upsellNativeData && upsellNativeData.is_multi_offer) {
      const upsellNativeOfferArr = await Offers_upsell_native.findAll({
        where: {
          upsell_id: upsellNativeData.id,
        },
        raw: true,
        nest: true,
        attributes: ['offer_id'],
      });

      const findAllOffers = await Product_offer.findAll({
        where: { id: upsellNativeOfferArr.map((item) => item.offer_id) },
        raw: true,
        // attributes: [
        //   'uuid',
        //   'name',
        //   'price',
        //   'product',
        //   'description',
        //   'installments',
        //   'payment_methods',
        //   'checkout_customizations'
        // ],
      });

      offers = findAllOffers.map(async (item) => {
        const obj = {
          ...item,
          product: findProduct,
        };

        // const paymentSettings = await Sales_settings.findOne({
        //   where: {
        //     id_user: obj.product.id_user,
        //   },
        //   raw: true,
        //   nest: true,
        //   include: [
        //     {
        //       association: 'fee_interest_card',
        //       on: {
        //         [Op.or]: {
        //           id_user: obj.product.id_user,
        //           is_default: true,
        //         },
        //       },
        //     },
        //   ],
        // });

        obj.customizations = {
          alternative_name:
            findAllOffers?.checkout_customizations?.alternative_name,
          alternative_image:
            findAllOffers?.checkout_customizations?.alternative_image,
          default_installment:
            findAllOffers?.checkout_customizations?.default_installment,
        };

        delete obj.checkout_customizations;

        return obj;
      });
    }

    return res.status(200).send({
      ...new SerializeOffer({
        ...offer,
        affiliate,
        sessionPixelsEventId: eventId,
        settings,
        hasActiveCoupon,
        has_frenet: !!has_frenet,
        sixid: sixidId,
      }).adapt(),
      personal_data,
      shopifyQtd,
      shopifyCprod,
      offerShopify,
      customizations,
      shipping_by_region,
      cpf_bottom: offer.offer_product.id_user === 26670,
      cpf_step_1: offer.offer_product.id === 16295,
      site_key,
      is_upsell_native: Boolean(upsellNativeData),
      offer_upsell_native: upsellNativeData
        ? {
          ...upsellNativeData,
          offers,
          product_id: findProduct.id,
          upsell_product_uuid: upsellNativeProductUuidSelected,
          upsell_offer_uuid: upsellNativeOfferUuidSelected,
          btn_text_accept_size: Number(upsellNativeData.btn_text_accept_size),
          btn_text_refuse_size: Number(upsellNativeData.btn_text_refuse_size),
          is_one_click: Boolean(upsellNativeData.is_one_click),
          is_embed_video: Boolean(upsellNativeData.is_embed_video),
          is_multi_offer: Boolean(upsellNativeData.is_message_not_close),
          is_plan: offer.offer_product.payment_type === 'subscription',
          is_step_visible: Boolean(upsellNativeData.is_step_visible),
          is_header_visible: Boolean(upsellNativeData.is_header_visible),
          is_footer_visible: Boolean(upsellNativeData.is_footer_visible),
          is_message_not_close: Boolean(
            upsellNativeData.is_message_not_close,
          ),
        }
        : null,
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

const getOfferInfoController = async (req, res, next) => {
  const {
    query: { offer_id, sale_item_id, plan_id = null },
  } = req;

  try {
    if (!offer_id) throw ApiError.badRequest('offer_id é obrigatório');
    if (!sale_item_id) throw ApiError.badRequest('sale_item_id é obrigatório');
    const offer = await new FindOfferCart(offer_id).execute();
    if (!offer) throw ApiError.badRequest('Oferta não encontrada');
    const saleItem = await findSaleItemWithStudent({ uuid: sale_item_id });
    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
    const settings = await SalesSettingsRepository.find(
      offer.offer_product.id_user,
    );

    await GetPaymentPixData({
      offer_uuid: offer.uuid,
      offer_selected: 'SCg9J9m11O',
      sale_item_uuid: sale_item_id,
    });

    await GetPaymentDataByOfferUuid({
      offer_uuid: offer.uuid,
      user_id: offer.offer_product.producer.id,
    });

    return res.status(200).send(
      new SerializeOfferInfo({
        ...offer,
        settings,
        saleItem,
        plan_id,
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

const validateCouponController = async (req, res, next) => {
  const {
    params: { coupon, offer_id },
    query: { id_product, cpf, strict_validation },
  } = req;

  // strict_validation=true is an opt-in flag used only by the new checkout flow.
  const isStrict = String(strict_validation).toLowerCase() === 'true';

  try {
    const offer = await new FindOfferCart(offer_id).execute();

    let hasActiveCoupon = null;
    const key = `coupon_${coupon}_${id_product}`;
    const cachedCoupon = await Cache.get(key);

    if (cachedCoupon) {
      hasActiveCoupon = JSON.parse(cachedCoupon);
      if (
        hasActiveCoupon.expires_at &&
        date().diff(hasActiveCoupon.expires_at) >= 0
      ) {
        await Cache.del(key);
        hasActiveCoupon = null;
      }
    } else {
      hasActiveCoupon = await findOneCoupon({
        coupon,
        active: true,
        id_product,
        expires_at: {
          [Op.or]: {
            [Op.gte]: dateHelper().now(),
            [Op.eq]: null,
          },
        },
      });

      if (hasActiveCoupon) {
        await Cache.set(key, JSON.stringify(hasActiveCoupon));
      }
    }

    if (!hasActiveCoupon) {
      return res
        .status(200)
        .send(isStrict ? { valid: false, code: 'NOT_FOUND' } : false);
    }

    const cProductOffers = await Coupons_product_offers.findAll({
      raw: true,
      attributes: ['id_offer'],
      where: {
        id_coupon: hasActiveCoupon.id,
      },
    });

    const { isAllowed } = validateCouponOffers(
      hasActiveCoupon,
      offer.id,
      cProductOffers,
    );

    if (!isAllowed) {
      return res
        .status(200)
        .send(isStrict ? { valid: false, code: 'NOT_ALLOWED' } : false);
    }

    const rawDocument = getRawDocument(cpf);
    if (
      rawDocument &&
      (hasActiveCoupon.first_sale_only || hasActiveCoupon.single_use_by_client)
    ) {
      const alreadyUsed = await CouponsUse.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_coupon: hasActiveCoupon.id,
          document_number: rawDocument,
        },
      });

      hasActiveCoupon.already_used = !!alreadyUsed;

      if (hasActiveCoupon.already_used && isStrict) {
        return res.status(200).send({
          valid: false,
          code: 'ALREADY_USED',
          message: 'Cupom já utilizado para este documento',
        });
      }
    }

    return res
      .status(200)
      .send(
        isStrict ? { valid: true, coupon: hasActiveCoupon } : hasActiveCoupon,
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

module.exports = {
  findOfferController,
  getOfferInfoController,
  validateCouponController,
  createShopifyProductOffer,
};
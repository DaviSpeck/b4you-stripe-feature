const Cache = require('../../config/Cache');
const ApiError = require('../../error/ApiError');
const dateHelper = require('../../utils/helpers/date');
const uuidHelper = require('../../utils/helpers/uuid');
const { findAffiliateStatusByKey } = require('../../status/affiliateStatus');
const { createCookie } = require('../../database/controllers/cookies_jar');
const ProductPages = require('../../database/models/ProductPages');
const Product_affiliate_settings = require('../../database/models/Product_affiliate_settings');
const Product_offer = require('../../database/models/Product_offer');
const Affiliates = require('../../database/models/Affiliates');
const { getCookieOptions } = require('../../utils/getCookieOptions');

const TEN_YEARS = 365 * 10 * 24 * 60 * 60 * 1000;

const findOffer = async (uuid) => {
  const offer_key = `offer_${uuid}_pages`;
  const cachedOffer = await Cache.get(offer_key);
  if (cachedOffer) return JSON.parse(cachedOffer);
  const offer = await Product_offer.findOne({
    raw: true,
    where: {
      uuid,
      active: true,
      allow_affiliate: true,
    },
    attributes: ['id', 'uuid', 'id_product', 'sales_page_url'],
  });
  if (!offer) return null;
  await Cache.set(offer_key, JSON.stringify(offer));
  return offer;
};

const findAffiliate = async (uuid) => {
  const affiliate_key = `affiliate_${uuid}`;
  const cachedAffiliate = await Cache.get(affiliate_key);
  if (cachedAffiliate) return JSON.parse(cachedAffiliate);
  const affiliate = await Affiliates.findOne({
    raw: true,
    where: {
      uuid,
      status: findAffiliateStatusByKey('active').id,
    },
    attributes: ['id', 'uuid', 'id_product'],
  });
  if (!affiliate) return null;
  await Cache.set(affiliate_key, JSON.stringify(affiliate));
  return affiliate;
};

const findAffiliateSettings = async (id_product) => {
  const settings_key = `settings_${id_product}`;
  const cachedSettings = await Cache.get(settings_key);
  if (cachedSettings) return JSON.parse(cachedSettings);
  const settings = await Product_affiliate_settings.findOne({
    raw: true,
    where: {
      id_product,
    },
    attributes: ['cookies_validity'],
  });
  if (!settings) return null;
  await Cache.set(settings_key, JSON.stringify(settings));
  return settings;
};

const findPage = async (uuid) => {
  const page_key = `page_${uuid}`;
  const cachedPage = await Cache.get(page_key);
  if (cachedPage) return JSON.parse(cachedPage);
  const page = await ProductPages.findOne({
    raw: true,
    where: {
      uuid,
    },
  });
  if (!page) return null;
  await Cache.set(page_key, JSON.stringify(page));
  return page;
};

const calculateMaxAge = ({ cookies_validity }) => {
  if (cookies_validity === 0) {
    return dateHelper().add(5, 'y');
  }

  return dateHelper().add(cookies_validity, 'd');
};

const getRedirectLink = (redirectParam, offer, cartId) => {
  if (redirectParam === 'pv' && offer.sales_page_url)
    return `${offer.sales_page_url}`;

  if (redirectParam === 'cart' && cartId)
    return `${process.env.URL_SIXBASE_CHECKOUT}/carrinho/${cartId}/${offer.uuid}`;

  return `${process.env.URL_SIXBASE_CHECKOUT}/${offer.uuid}`;
};

const redirectController = async (req, res, next) => {
  const {
    cookies,
    params: { offer_id, affiliate_id, redirect = 'pv', cart_id = null },
  } = req;

  const reqUrl = new URL(req.url, `${req.protocol}://${req.headers.host}`);

  try {
    const offer = await findOffer(offer_id);
    if (!offer) return res.sendStatus(404);
    const affiliate = await findAffiliate(affiliate_id);
    if (!affiliate) return res.sendStatus(404);

    if (affiliate.id_product !== offer.id_product) {
      return res.sendStatus(404);
    }

    const affiliate_settings = await findAffiliateSettings(
      affiliate.id_product,
    );

    const redirectUrl = new URL(
      getRedirectLink(redirect, offer, cart_id),
    );

    if (reqUrl.searchParams.get('steps') === '3steps') {
      redirectUrl.pathname += '/1';
      reqUrl.searchParams.delete('steps');
    }

    reqUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.append(key, value);
    });

    redirectUrl.searchParams.set('b4f', affiliate_id);

    let { sixid } = cookies;
    if (!sixid) {
      sixid = uuidHelper.nanoid();

      const cookieOptions = getCookieOptions(req);

      res.cookie('sixid', sixid, {
        maxAge: TEN_YEARS,
        httpOnly: true,
        ...cookieOptions,
      });
    }

    await createCookie({
      id_offer: offer.id,
      id_product: offer.id_product,
      id_affiliate: affiliate.id,
      sixid,
      max_age: calculateMaxAge(affiliate_settings),
    });

    return res.redirect(redirectUrl.toString());
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

const redirectPageController = async (req, res, next) => {
  const {
    cookies,
    params: { page_uuid, affiliate_uuid },
  } = req;

  const reqUrl = new URL(req.url, `${req.protocol}://${req.headers.host}`);

  try {
    const page = await findPage(page_uuid);
    if (!page) return res.sendStatus(404);

    const affiliate = await findAffiliate(affiliate_uuid);
    if (!affiliate) return res.sendStatus(404);

    if (affiliate.id_product !== page.id_product) {
      return res.sendStatus(404);
    }

    const affiliate_settings = await findAffiliateSettings(
      affiliate.id_product,
    );

    const redirectUrl = new URL(page.url);

    if (reqUrl.searchParams.get('steps') === '3steps') {
      redirectUrl.pathname += '/1';
      reqUrl.searchParams.delete('steps');
    }

    reqUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.append(key, value);
    });

    redirectUrl.searchParams.set('b4f', affiliate_uuid);

    let { sixid } = cookies;
    if (!sixid) {
      sixid = uuidHelper.nanoid();

      const cookieOptions = getCookieOptions(req);

      res.cookie('sixid', sixid, {
        maxAge: TEN_YEARS,
        httpOnly: true,
        ...cookieOptions,
      });
    }

    await createCookie({
      id_offer: 0,
      id_product: page.id_product,
      id_affiliate: affiliate.id,
      sixid,
      max_age: calculateMaxAge(affiliate_settings),
    });

    return res.redirect(redirectUrl.toString());
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

const setAffiliateCookieController = async (req, res, next) => {
  const {
    cookies,
    params: { offer_id, affiliate_id },
  } = req;

  try {
    const offer = await findOffer(offer_id);
    if (!offer) return res.sendStatus(200);

    const affiliate = await findAffiliate(affiliate_id);
    if (!affiliate) return res.sendStatus(200);

    if (affiliate.id_product !== offer.id_product) return res.sendStatus(200);

    const affiliate_settings = await findAffiliateSettings(
      affiliate.id_product,
    );
    let { sixid } = cookies;
    if (!sixid) {
      sixid = uuidHelper.nanoid();
      
      const cookieOptions = getCookieOptions(req);

      res.cookie('sixid', sixid, {
        maxAge: TEN_YEARS,
        httpOnly: true,
        ...cookieOptions,
      });
    }

    await createCookie({
      id_offer: offer.id,
      id_affiliate: affiliate.id,
      id_product: offer.id_product,
      sixid,
      max_age: calculateMaxAge(affiliate_settings),
    });

    return res.sendStatus(200);
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
  redirectController,
  setAffiliateCookieController,
  redirectPageController,
};

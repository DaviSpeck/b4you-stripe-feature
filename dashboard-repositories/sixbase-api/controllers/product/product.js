const { Op } = require('sequelize');
const { DATABASE_DATE } = require('../../types/dateTypes');
const ApiError = require('../../error/ApiError');
const dateHelper = require('../../utils/helpers/date');
const uuid = require('../../utils/helpers/uuid');
const { findSingleOffer } = require('../../database/controllers/product_offer');
const { findOneAffiliate } = require('../../database/controllers/affiliates');
const { findAffiliateStatus } = require('../../status/affiliateStatus');
const {
  findOneCookie,
  createCookie,
} = require('../../database/controllers/cookies_jar');

const TEN_YEARS = 365 * 10 * 24 * 60 * 60 * 1000;
const LAST_CLICK = 2;

const calculateMaxAge = ({ cookies_validity }) => {
  if (cookies_validity === 0) {
    return dateHelper().add(5, 'y');
  }

  return dateHelper().add(cookies_validity, 'd');
};

const getRedirectLink = (redirectParam, offer) => {
  if (redirectParam === 'c')
    return `${process.env.URL_SIXBASE_CHECKOUT}/${offer.uuid}`;
  if (offer.sales_page_url) return `${offer.sales_page_url}`;

  return `${offer.offer_product.sales_page_url}`;
};

const redirectController = async (req, res, next) => {
  const {
    cookies,
    params: { redirect, offer_id, affiliate_id },
  } = req;

  const reqQuery = new URL(req.url, `${req.protocol}://${req.headers.host}/`);

  if (redirect !== 'pv' && redirect !== 'c') return res.sendStatus(404);
  try {
    const offer = await findSingleOffer({
      uuid: offer_id,
      active: true,
      allow_affiliate: true,
    });
    if (!offer) return res.sendStatus(404);
    const affiliate = await findOneAffiliate({
      uuid: affiliate_id,
      status: findAffiliateStatus('Ativo').id,
    });
    if (!affiliate) return res.sendStatus(404);
    if (affiliate.id_product !== offer.id_product) return res.sendStatus(404);

    let redirectLink = getRedirectLink(redirect, offer);
    if (reqQuery.search) redirectLink += reqQuery.search;

    let { sixid } = cookies;
    if (!sixid) {
      sixid = uuid.nanoid();
      res.cookie('sixid', sixid, {
        maxAge: TEN_YEARS,
        sameSite: 'none',
        secure: true,
        httpOnly: true,
        domain: '.b4you.com.br',
      });
    }

    const cookie = await findOneCookie({
      sixid,
      [Op.or]: {
        id_offer: offer.id,
        id_product: offer.id_product,
      },
      id_affiliate: affiliate.id,
      max_age: {
        [Op.gte]: dateHelper().format(DATABASE_DATE),
      },
    });

    if (
      !cookie ||
      offer.offer_product.affiliate_settings.click_attribution === LAST_CLICK
    ) {
      await createCookie({
        id_offer: offer.id,
        id_product: offer.id_product,
        id_affiliate: affiliate.id,
        sixid,
        max_age: calculateMaxAge(offer.offer_product.affiliate_settings),
      });
    }

    return res.redirect(redirectLink);
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

const setAffiliateCookieController = async (req, res, next) => {
  const {
    cookies,
    params: { offer_id, affiliate_id },
  } = req;

  try {
    const offer = await findSingleOffer({
      uuid: offer_id,
      active: true,
      allow_affiliate: true,
    });

    if (!offer) return res.sendStatus(200);

    const affiliate = await findOneAffiliate({
      uuid: affiliate_id,
      status: findAffiliateStatus('Ativo').id,
    });

    if (!affiliate) return res.sendStatus(200);

    if (affiliate.id_product !== offer.id_product) return res.sendStatus(200);

    let { sixid } = cookies;
    if (!sixid) {
      sixid = uuid.nanoid();
      res.cookie('sixid', sixid, {
        maxAge: TEN_YEARS,
        sameSite: 'none',
        secure: true,
        httpOnly: true,
      });
    }

    const cookie = await findOneCookie({
      sixid,
      id_offer: offer.id,
      id_affiliate: affiliate.id,
      id_product: offer.id_product,
      max_age: {
        [Op.gte]: dateHelper().format(DATABASE_DATE),
      },
    });

    if (
      !cookie ||
      offer.offer_product.affiliate_settings.click_attribution === LAST_CLICK
    ) {
      await createCookie({
        id_offer: offer.id,
        id_affiliate: affiliate.id,
        id_product: offer.id_product,
        sixid,
        max_age: calculateMaxAge(offer.offer_product.affiliate_settings),
      });
    }

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
};

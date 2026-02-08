const ApiError = require('../../error/ApiError');
const {
  findShortLinkByShortId,
} = require('../../database/controllers/short_links');
const { findSingleOffer } = require('../../database/controllers/product_offer');
const { findPage } = require('../../database/controllers/product_pages');
const { findOneAffiliate } = require('../../database/controllers/affiliates');
const Users = require('../../database/models/Users');
const { findOwnerType } = require('../../types/ownerTypes');

const redirectShortLinkController = async (req, res, next) => {
  const { short_id, extra } = req.params;
  try {
    if (!short_id || short_id.length < 4) return res.sendStatus(404);
    const forced3Steps = extra === '1';
    const is3Steps = forced3Steps || req.query.steps === '3steps';
    const shortLink = await findShortLinkByShortId({ short_id });
    if (!shortLink) return res.sendStatus(404);
    const {
      type,
      page_uuid,
      offer_uuid,
      owner_type,
      owner_uuid,
      redirect_url,
    } = shortLink;
    const URL_CHECKOUT = process.env.URL_SIXBASE_CHECKOUT;
    const URL_CHECKOUT_PV = process.env.URL_SIXBASE_CHECKOUT_PV;
    const URL_PV_PAGES = process.env.SIXBASE_URL_PRODUCT;
    const ownerType = findOwnerType(owner_type);
    let owner = null;
    if (ownerType.key === 'affiliate') {
      owner = await findOneAffiliate({ uuid: owner_uuid });
      if (!owner) return res.sendStatus(404);
    }
    if (ownerType.key === 'producer' || ownerType.key === 'coproducer') {
      owner = await Users.findOne({ where: { uuid: owner_uuid } });
      if (!owner) return res.sendStatus(404);
    }
    let finalUrl;
    if (type === 'PAGE') {
      const page = await findPage(page_uuid);
      if (!page) return res.sendStatus(404);
      if (ownerType.key === 'affiliate') {
        if (owner.id_product !== page.id_product) return res.sendStatus(404);
        finalUrl = `${URL_PV_PAGES}/pages/${page.uuid}/${owner.uuid}`;
      }
      if (ownerType.key === 'producer' || ownerType.key === 'coproducer') {
        finalUrl = page.url;
      }
      if (ownerType.key === 'global') {
        finalUrl = redirect_url;
      }
      if (req.url.includes('?')) {
        finalUrl += req.url.substring(req.url.indexOf('?'));
      }
    } else if (type === 'OFFER') {
      const offer = await findSingleOffer({
        uuid: offer_uuid,
        active: true,
      });
      if (!offer) return res.sendStatus(404);
      if (ownerType.key === 'affiliate') {
        if (owner.id_product !== offer.id_product) return res.sendStatus(404);
        finalUrl = `${URL_CHECKOUT_PV}/api/product/c/${offer.uuid}/${owner.uuid}`;
        if (is3Steps) {
          finalUrl = finalUrl.replace(/\/$/, '');
          finalUrl += '/1?steps=3steps';
        } else if (req.url.includes('?')) {
          finalUrl += req.url.substring(req.url.indexOf('?'));
        }
      } else if (
        ownerType.key === 'producer' ||
        ownerType.key === 'coproducer'
      ) {
        finalUrl = `${URL_CHECKOUT}/${offer.uuid}`;
        if (is3Steps) {
          finalUrl += '?steps=3steps';
        } else if (req.url.includes('?')) {
          finalUrl += req.url.substring(req.url.indexOf('?'));
        }
      } else if (ownerType.key === 'global') {
        finalUrl = redirect_url;
      }
    }
    return res.redirect(302, finalUrl);
  } catch (error) {
    return next(
      ApiError.internalServerError(`Erro no redirect ${short_id}`, error),
    );
  }
};
module.exports = { redirectShortLinkController };

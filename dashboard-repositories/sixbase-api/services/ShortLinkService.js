const { nanoid } = require('nanoid');
const { v4: uuidv4 } = require('uuid');
const Affiliates = require('../database/models/Affiliates');
const ProductOffer = require('../database/models/Product_offer');
const ProductPages = require('../database/models/ProductPages');
const ShortLink = require('../database/models/Short_links');
const logger = require('../utils/logger');
const { findOwnerType } = require('../types/ownerTypes');

/**
 * BASE: GET OR CREATE SHORTLINK
 */
async function getOrCreateShortLink({
    type,
    owner_type,
    owner_uuid,
    page_uuid,
    offer_uuid,
    redirect_url
}) {
    const where = Object.fromEntries(
        Object.entries({ type, owner_type, owner_uuid, page_uuid, offer_uuid })
            .filter(([, v]) => v !== undefined && v !== null)
    );

    try {
        const existing = await ShortLink.findOne({ where });
        if (existing) return `https://b4.app/${existing.short_id}`;

        /* eslint-disable no-await-in-loop */
        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                const short_id = nanoid(8);

                const [record] = await ShortLink.findOrCreate({
                    where,
                    defaults: {
                        uuid: uuidv4(),
                        short_id,
                        redirect_url,
                    },
                });

                logger.info(`[shortlink.created] uuid=${record.uuid} short_id=${record.short_id}`);
                return `https://b4.app/${record.short_id}`;

            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError' && attempt < 3) {
                    // eslint-disable-next-line no-continue
                    continue;
                }

                logger.error(`[shortlink.error] ${error.message}`);

                const retry = await ShortLink.findOne({ where });
                if (retry) return `https://b4.app/${retry.short_id}`;

                return redirect_url;
            }
        }
        /* eslint-enable no-await-in-loop */

    } catch (err) {
        logger.error(`[shortlink.unexpected] ${err.message}`);
        return redirect_url;
    }

    return redirect_url;
}

/**
 * PAGE → criar shortlinks para TODOS AFILIADOS DO PRODUTO
 */
async function createShortLinksForPage(page) {
    const affiliates = await Affiliates.findAll({
        attributes: ['uuid'],
        where: { id_product: page.id_product, deleted_at: null }
    });

    const owner_type = findOwnerType("affiliate").id;

    await Promise.all(
        affiliates.map((aff) =>
            getOrCreateShortLink({
                type: 'PAGE',
                owner_type,
                owner_uuid: aff.uuid,
                page_uuid: page.uuid,
                redirect_url: `${process.env.SIXBASE_URL_PRODUCT}/pages/${page.uuid}/${aff.uuid}`,
            })
        )
    );

    logger.info(`[shortlink.page.batch] page=${page.uuid} total_affiliates=${affiliates.length}`);
}

/**
 * OFFER → criar shortlinks para TODOS AFILIADOS DO PRODUTO
 */
async function createShortLinksForOffer(offer) {
    const affiliates = await Affiliates.findAll({
        attributes: ['uuid'],
        where: { id_product: offer.id_product, deleted_at: null }
    });

    const owner_type = findOwnerType("affiliate").id;

    await Promise.all(
        affiliates.map((aff) =>
            getOrCreateShortLink({
                type: 'OFFER',
                owner_type,
                owner_uuid: aff.uuid,
                offer_uuid: offer.uuid,
                redirect_url: `${process.env.URL_SIXBASE_CHECKOUT_PV}/api/product/c/${offer.uuid}/${aff.uuid}`,
            })
        )
    );

    logger.info(`[shortlink.offer.batch] offer=${offer.uuid} total_affiliates=${affiliates.length}`);
}

/**
 * AFFILIATE → criar shortlinks para TODAS PÁGINAS E TODAS OFERTAS
 */
async function createShortLinksForAffiliate(affiliate) {
    const pages = await ProductPages.findAll({
        where: { id_product: affiliate.id_product }
    });

    const offers = await ProductOffer.findAll({
        where: { id_product: affiliate.id_product }
    });

    const owner_type = findOwnerType("affiliate").id;

    await Promise.all([
        ...pages.map((page) =>
            getOrCreateShortLink({
                type: 'PAGE',
                owner_type,
                owner_uuid: affiliate.uuid,
                page_uuid: page.uuid,
                redirect_url: `${process.env.SIXBASE_URL_PRODUCT}/pages/${page.uuid}/${affiliate.uuid}`,
            })
        ),
        ...offers.map((offer) =>
            getOrCreateShortLink({
                type: 'OFFER',
                owner_type,
                owner_uuid: affiliate.uuid,
                offer_uuid: offer.uuid,
                redirect_url: `${process.env.URL_SIXBASE_CHECKOUT_PV}/api/product/c/${offer.uuid}/${affiliate.uuid}`,
            })
        ),
    ]);

    logger.info(
        `[shortlink.affiliate.batch] affiliate=${affiliate.uuid} pages=${pages.length} offers=${offers.length}`
    );
}

async function createManual({
    type,
    owner_type_id,
    owner_uuid,
    page_uuid,
    offer_uuid
}) {
    const where = {
        type,
        owner_type: owner_type_id,
        owner_uuid: owner_uuid || null,
        page_uuid: page_uuid || null,
        offer_uuid: offer_uuid || null
    };

    const existing = await ShortLink.findOne({ where });
    if (existing) {
        return `https://b4.app/${existing.short_id}`;
    }

    const short_id = nanoid(8);

    const record = await ShortLink.create({
        uuid: uuidv4(),
        short_id,
        type,
        owner_type: owner_type_id,
        owner_uuid,
        page_uuid,
        offer_uuid,
        redirect_url: ""
    });

    logger.info(
        `[shortlink.manual.created] uuid=${record.uuid} short_id=${record.short_id}`
    );

    return `https://b4.app/${record.short_id}`;
}

module.exports = {
    getOrCreateShortLink,
    createShortLinksForPage,
    createShortLinksForOffer,
    createShortLinksForAffiliate,
    createManual
};
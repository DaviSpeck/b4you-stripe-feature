const Offers_upsell_native = require('../../../../database/models/Offers_upsell-native');
const Product_offer = require('../../../../database/models/Product_offer');

const GetOffersByUpsellIdService = async (upsell_id) => {
    const relations = await Offers_upsell_native.findAll({
        where: { upsell_id },
        raw: true,
    });

    if (!relations.length) return [];

    return Product_offer.findAll({
        where: { id: relations.map(r => r.offer_id) },
        raw: true,
    });
};

module.exports = { GetOffersByUpsellIdService };
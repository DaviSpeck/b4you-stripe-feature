const ShortLink = require('../models/Short_links');

/**
 * Busca um shortlink existente pelo conjunto de campos únicos.
 * Nunca cria nada.
 */
async function findShortLink({ type, owner_type, owner_uuid, page_uuid, offer_uuid }) {
    const where = Object.fromEntries(
        Object.entries({ type, owner_type, owner_uuid, page_uuid, offer_uuid })
            .filter(([, v]) => v !== undefined && v !== null)
    );

    const record = await ShortLink.findOne({ where });
    if (!record) return null;

    return `https://b4.app/${record.short_id}`;
}

/**
 * Busca pelo short_id (para redirecionamento)
 */
async function findShortLinkByShortId({ short_id }) {
    return ShortLink.findOne({ where: { short_id } });
}

module.exports = {
    findShortLink,
    findShortLinkByShortId,
};
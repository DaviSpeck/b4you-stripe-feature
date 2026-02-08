const { nanoid } = require('nanoid');
const { v4: uuidv4 } = require('uuid');
const ShortLink = require('../database/models/Short_links');

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

            return `https://b4.app/${record.short_id}`;
        } catch (error) {
            // eslint-disable-next-line no-continue
            if (error.name === 'SequelizeUniqueConstraintError' && attempt < 3) continue;

            const retry = await ShortLink.findOne({ where });
            if (retry) return `https://b4.app/${retry.short_id}`;

            return redirect_url;
        }
    }
    /* eslint-enable no-await-in-loop */

    return redirect_url;
}

module.exports = {
    getOrCreateShortLink,
};
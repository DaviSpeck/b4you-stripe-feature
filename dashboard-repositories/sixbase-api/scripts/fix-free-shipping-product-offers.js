'use strict';

require('dotenv').config();

const db = require('../database/models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

const DRY_RUN = process.env.DRY_RUN === '1';

const PRODUCT_ID = Number(process.env.PRODUCT_ID);
const SOURCE_OFFER_ID = Number(process.env.SOURCE_OFFER_ID);

if (!PRODUCT_ID || !SOURCE_OFFER_ID) {
    console.error('Defina PRODUCT_ID e SOURCE_OFFER_ID no env');
    process.exit(1);
}

async function fixFreeShippingOffers() {
    await sequelize.authenticate();

    console.log('\n=== Fix Free Shipping Offers ===');
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`Source offer: ${SOURCE_OFFER_ID}`);
    console.log(`Dry run: ${DRY_RUN}\n`);

    // 1. Buscar oferta modelo
    const [sourceOffer] = await sequelize.query(
        `
    SELECT
      id,
      shipping_type,
      shipping_price,
      require_address
    FROM product_offer
    WHERE id = :sourceOfferId
      AND id_product = :productId
      AND deleted_at IS NULL
    LIMIT 1
    `,
        {
            type: QueryTypes.SELECT,
            replacements: {
                sourceOfferId: SOURCE_OFFER_ID,
                productId: PRODUCT_ID,
            },
        }
    );

    if (!sourceOffer) {
        throw new Error('Oferta modelo não encontrada ou não pertence ao produto.');
    }

    // 2. Validar que a oferta modelo é frete grátis
    if (
        sourceOffer.shipping_type !== 0 ||
        Number(sourceOffer.shipping_price) !== 0 ||
        sourceOffer.require_address !== 0
    ) {
        throw new Error(
            'A oferta modelo NÃO está configurada como frete grátis. Abortando.'
        );
    }

    console.log('✔ Oferta modelo confirmada como frete grátis\n');

    // 3. Buscar ofertas do produto (exceto modelo)
    const offers = await sequelize.query(
        `
    SELECT
      id,
      shipping_type,
      shipping_price,
      require_address
    FROM product_offer
    WHERE id_product = :productId
      AND id <> :sourceOfferId
      AND deleted_at IS NULL
    `,
        {
            type: QueryTypes.SELECT,
            replacements: {
                productId: PRODUCT_ID,
                sourceOfferId: SOURCE_OFFER_ID,
            },
        }
    );

    console.log(`Ofertas encontradas: ${offers.length}\n`);

    let updated = 0;
    let skipped = 0;

    for (const offer of offers) {
        const alreadyFreeShipping =
            offer.shipping_type === 0 &&
            Number(offer.shipping_price) === 0 &&
            offer.require_address === 0;

        if (alreadyFreeShipping) {
            skipped++;
            console.log(`→ Oferta ${offer.id} | SKIP (já frete grátis)`);
            continue;
        }

        console.log(`→ Oferta ${offer.id} | APPLY free shipping`);

        if (!DRY_RUN) {
            await sequelize.query(
                `
        UPDATE product_offer
        SET
          shipping_type = 0,
          shipping_price = '0.00',
          require_address = 0,
          updated_at = NOW()
        WHERE id = :offerId
        `,
                {
                    type: QueryTypes.UPDATE,
                    replacements: {
                        offerId: offer.id,
                    },
                }
            );
        }

        updated++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total offers processed: ${offers.length}`);
    console.log(`Updated to free shipping: ${updated}`);
    console.log(`Skipped (already free): ${skipped}`);
    console.log(`Dry run: ${DRY_RUN}`);
}

fixFreeShippingOffers()
    .catch(err => {
        console.error('Erro no script:', err.message || err);
    })
    .finally(async () => {
        try { await sequelize.close(); } catch (_) { }
    });

'use strict';

require('dotenv').config();

const db = require('../database/models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

const DRY_RUN = process.env.DRY_RUN === '1';
const PRODUCT_ID = Number(process.env.PRODUCT_ID);

if (!PRODUCT_ID) {
    console.error('Defina PRODUCT_ID no env');
    process.exit(1);
}

function normalizeMetadata(raw) {
    if (!raw) return null;

    let metadata = raw;

    // string → objeto
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch {
            return null;
        }
    }

    if (
        typeof metadata !== 'object' ||
        !Array.isArray(metadata.line_items) ||
        metadata.line_items.length === 0
    ) {
        return null;
    }

    return {
        line_items: metadata.line_items.map(item => ({
            grams: String(item.grams ?? '0'),
            price: String(item.price),
            title: String(item.title),
            quantity: Number(item.quantity ?? 1),
            variant_id: Number(item.variant_id),
            ...(item.shipping_data ? { shipping_data: item.shipping_data } : {}),
        })),
    };
}

async function normalizeOfferMetadata() {
    await sequelize.authenticate();

    console.log('\n=== Normalize Offer Metadata ===');
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`Dry run: ${DRY_RUN}\n`);

    const offers = await sequelize.query(
        `
    SELECT id, metadata
    FROM product_offer
    WHERE id_product = :productId
      AND deleted_at IS NULL
    `,
        {
            type: QueryTypes.SELECT,
            replacements: { productId: PRODUCT_ID },
        }
    );

    console.log(`Ofertas encontradas: ${offers.length}\n`);

    let normalized = 0;
    let skipped = 0;
    let invalid = 0;

    for (const offer of offers) {
        const normalizedMetadata = normalizeMetadata(offer.metadata);

        if (!normalizedMetadata) {
            invalid++;
            console.log(`→ Oferta ${offer.id} | SKIP (metadata inválido ou vazio)`);
            continue;
        }

        if (
            typeof offer.metadata === 'object' &&
            JSON.stringify(offer.metadata) === JSON.stringify(normalizedMetadata)
        ) {
            skipped++;
            console.log(`→ Oferta ${offer.id} | SKIP (já normalizada)`);
            continue;
        }

        console.log(`→ Oferta ${offer.id} | NORMALIZE metadata`);

        if (!DRY_RUN) {
            await sequelize.query(
                `
        UPDATE product_offer
        SET
          metadata = :metadata,
          updated_at = NOW()
        WHERE id = :offerId
        `,
                {
                    type: QueryTypes.UPDATE,
                    replacements: {
                        offerId: offer.id,
                        metadata: JSON.stringify(normalizedMetadata),
                    },
                }
            );
        }

        normalized++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total offers: ${offers.length}`);
    console.log(`Normalized: ${normalized}`);
    console.log(`Skipped (already OK): ${skipped}`);
    console.log(`Invalid / null metadata: ${invalid}`);
    console.log(`Dry run: ${DRY_RUN}`);
}

normalizeOfferMetadata()
    .catch(err => {
        console.error('Erro no script:', err.message || err);
    })
    .finally(async () => {
        try { await sequelize.close(); } catch (_) { }
    });
'use strict';

require('dotenv').config();

console.log('🔥 SCRIPT CARREGADO:', __filename);

const db = require('../database/models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

const DRY_RUN = process.env.DRY_RUN === '1';
const PRODUCT_ID = Number(process.env.PRODUCT_ID);
const SOURCE_OFFER_ID = Number(process.env.SOURCE_OFFER_ID);

console.log('🔥 ENV:', { DRY_RUN, PRODUCT_ID, SOURCE_OFFER_ID });

if (!PRODUCT_ID || !SOURCE_OFFER_ID) {
    console.error('❌ Defina PRODUCT_ID e SOURCE_OFFER_ID no env');
    process.exit(1);
}

async function run() {
    console.log('🚀 Iniciando replicação de bloqueio de cupom');

    await sequelize.authenticate();
    console.log('✅ Sequelize conectado');

    // 1️⃣ Validar oferta modelo
    const [sourceOffer] = await sequelize.query(
        `
    SELECT id, allow_coupon
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
        throw new Error(`Oferta modelo ${SOURCE_OFFER_ID} não encontrada`);
    }

    if (Number(sourceOffer.allow_coupon) !== 0) {
        throw new Error(
            '❌ A oferta modelo NÃO está com allow_coupon = 0. Abortando.'
        );
    }

    console.log('✔ Oferta modelo válida (cupom desabilitado)');

    // 2️⃣ Buscar ofertas do produto
    const offers = await sequelize.query(
        `
    SELECT id, allow_coupon
    FROM product_offer
    WHERE id_product = :productId
      AND deleted_at IS NULL
    `,
        {
            type: QueryTypes.SELECT,
            replacements: { productId: PRODUCT_ID },
        }
    );

    console.log(`📦 Ofertas encontradas: ${offers.length}`);

    let updated = 0;
    let skipped = 0;

    for (const offer of offers) {
        if (Number(offer.allow_coupon) === 0) {
            skipped++;
            console.log(`→ Oferta ${offer.id} | SKIP (já sem cupom)`);
            continue;
        }

        console.log(`→ Oferta ${offer.id} | DISABLE COUPON`);

        if (!DRY_RUN) {
            await sequelize.query(
                `
        UPDATE product_offer
        SET
          allow_coupon = 0,
          updated_at = NOW()
        WHERE id = :offerId
        `,
                {
                    type: QueryTypes.UPDATE,
                    replacements: { offerId: offer.id },
                }
            );
        }

        updated++;
    }

    console.log('\n=== SUMMARY ===');
    console.log({
        total: offers.length,
        updated,
        skipped,
        dryRun: DRY_RUN,
    });

    console.log('✅ Script finalizado');
}

run()
    .catch(err => {
        console.error('❌ ERRO:', err.message || err);
    })
    .finally(async () => {
        try {
            await sequelize.close();
            console.log('🔌 Sequelize fechado');
        } catch (_) { }
    });
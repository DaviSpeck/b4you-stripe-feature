'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const db = require('../database/models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

const PRODUCT_ID = Number(process.env.PRODUCT_ID);
const SOURCE_OFFER_ID = Number(process.env.SOURCE_OFFER_ID);

if (!PRODUCT_ID || !SOURCE_OFFER_ID) {
    console.error('Defina PRODUCT_ID e SOURCE_OFFER_ID no env');
    process.exit(1);
}

// ---------- Report helpers ----------
const REPORT_DIR = path.resolve(__dirname, 'reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);

const REPORT_FILE = path.join(
    REPORT_DIR,
    `replicate-order-bumps-${PRODUCT_ID}-${Date.now()}.txt`
);

const reportLines = [];
const logReport = (line) => {
    reportLines.push(line);
};

async function replicateOrderBumps() {
    await sequelize.authenticate();

    const startedAt = new Date();

    console.log(`\n=== Replicate Order Bumps ===`);
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`Source offer: ${SOURCE_OFFER_ID}`);
    console.log(`Dry run: ${DRY_RUN}\n`);

    logReport(`=== Replicate Order Bumps ===`);
    logReport(`Started at: ${startedAt.toISOString()}`);
    logReport(`Product ID: ${PRODUCT_ID}`);
    logReport(`Source Offer ID: ${SOURCE_OFFER_ID}`);
    logReport(`Dry run: ${DRY_RUN}`);
    logReport('');

    // 0. Validar oferta modelo
    const [sourceOfferCheck] = await sequelize.query(
        `
        SELECT id
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

    if (!sourceOfferCheck) {
        throw new Error(
            `Oferta modelo ${SOURCE_OFFER_ID} não pertence ao produto ${PRODUCT_ID}`
        );
    }

    // 1. Buscar order bumps da oferta modelo
    const sourceBumps = await sequelize.query(
        `
        SELECT *
        FROM order_bumps
        WHERE id_offer = :sourceOfferId
        `,
        {
            type: QueryTypes.SELECT,
            replacements: { sourceOfferId: SOURCE_OFFER_ID },
        }
    );

    if (sourceBumps.length === 0) {
        console.log('Nenhum order bump encontrado na oferta modelo.');
        logReport('Nenhum order bump encontrado na oferta modelo.');
        return;
    }

    logReport(`Order bumps na oferta modelo: ${sourceBumps.length}`);
    logReport('');

    // 2. Buscar ofertas destino
    const offers = await sequelize.query(
        `
        SELECT id
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

    console.log(`Ofertas destino encontradas: ${offers.length}\n`);
    logReport(`Ofertas destino encontradas: ${offers.length}`);
    logReport('');

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const offer of offers) {
        console.log(`→ Oferta ${offer.id}`);
        logReport(`Oferta ${offer.id}:`);

        let createdForOffer = 0;
        let skippedForOffer = 0;

        for (const bump of sourceBumps) {
            const [exists] = await sequelize.query(
                `
                SELECT id
                FROM order_bumps
                WHERE id_offer = :targetOfferId
                  AND order_bump_offer = :bumpOfferId
                  AND (
                    (order_bump_plan IS NULL AND :planId IS NULL)
                    OR order_bump_plan = :planId
                  )
                LIMIT 1
                `,
                {
                    type: QueryTypes.SELECT,
                    replacements: {
                        targetOfferId: offer.id,
                        bumpOfferId: bump.order_bump_offer,
                        planId: bump.order_bump_plan,
                    },
                }
            );

            if (exists) {
                skippedForOffer++;
                totalSkipped++;
                console.log(`  - SKIP bump offer=${bump.order_bump_offer}`);
                logReport(`  SKIP bump offer=${bump.order_bump_offer}`);
                continue;
            }

            if (DRY_RUN) {
                createdForOffer++;
                totalCreated++;
                console.log(`  [DRY] CREATE bump offer=${bump.order_bump_offer}`);
                logReport(`  [DRY] CREATE bump offer=${bump.order_bump_offer}`);
                continue;
            }

            await sequelize.query(
                `
                INSERT INTO order_bumps (
                  id_offer,
                  order_bump_offer,
                  order_bump_plan,
                  title,
                  product_name,
                  label,
                  price_before,
                  show_quantity,
                  max_quantity,
                  created_at,
                  updated_at
                ) VALUES (
                  :id_offer,
                  :order_bump_offer,
                  :order_bump_plan,
                  :title,
                  :product_name,
                  :label,
                  :price_before,
                  :show_quantity,
                  :max_quantity,
                  NOW(),
                  NOW()
                )
                `,
                {
                    type: QueryTypes.INSERT,
                    replacements: {
                        id_offer: offer.id,
                        order_bump_offer: bump.order_bump_offer,
                        order_bump_plan: bump.order_bump_plan,
                        title: bump.title,
                        product_name: bump.product_name,
                        label: bump.label,
                        price_before: bump.price_before,
                        show_quantity: bump.show_quantity,
                        max_quantity: bump.max_quantity,
                    },
                }
            );

            createdForOffer++;
            totalCreated++;
            console.log(`  ✔ CREATED bump offer=${bump.order_bump_offer}`);
            logReport(`  CREATED bump offer=${bump.order_bump_offer}`);
        }

        logReport(`  Summary → created=${createdForOffer}, skipped=${skippedForOffer}`);
        logReport('');
    }

    const finishedAt = new Date();

    logReport('=== Final Summary ===');
    logReport(`Total offers processed: ${offers.length}`);
    logReport(`Total bumps created: ${totalCreated}`);
    logReport(`Total bumps skipped: ${totalSkipped}`);
    logReport(`Started at: ${startedAt.toISOString()}`);
    logReport(`Finished at: ${finishedAt.toISOString()}`);

    fs.writeFileSync(REPORT_FILE, reportLines.join('\n'), 'utf-8');

    console.log('\nFinalizado com sucesso.');
    console.log(`📄 Relatório gerado em: ${REPORT_FILE}`);
}

replicateOrderBumps()
    .catch(err => {
        console.error('Erro no script:', err);
    })
    .finally(async () => {
        try { await sequelize.close(); } catch (_) { }
    });
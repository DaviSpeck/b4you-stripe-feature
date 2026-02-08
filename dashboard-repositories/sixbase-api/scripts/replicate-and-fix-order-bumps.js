console.log('🔥 SCRIPT CARREGADO:', __filename);

process.on('exit', code => {
    console.log('⚠️ process.exit code =', code);
});

process.on('unhandledRejection', err => {
    console.error('❌ unhandledRejection:', err);
});

process.on('uncaughtException', err => {
    console.error('❌ uncaughtException:', err);
});

'use strict';

require('dotenv').config();
console.log('🔥 dotenv carregado');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

console.log('🔥 requires básicos OK');

const db = require('../database/models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

console.log('🔥 sequelize importado');

const DRY_RUN = process.env.DRY_RUN === '1';

const PRODUCT_ID = Number(process.env.PRODUCT_ID);
const SOURCE_OFFER_ID = Number(process.env.SOURCE_OFFER_ID);

console.log('🔥 ENV:', {
    DRY_RUN,
    PRODUCT_ID,
    SOURCE_OFFER_ID,
});

if (!PRODUCT_ID || !SOURCE_OFFER_ID) {
    console.error('❌ Defina PRODUCT_ID e SOURCE_OFFER_ID no env');
    process.exit(1);
}

// ---------- Report helpers ----------
const REPORT_DIR = path.resolve(__dirname, 'reports');
console.log('🔥 REPORT_DIR =', REPORT_DIR);

if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR);
    console.log('🔥 reports/ criado');
}

const REPORT_FILE = path.join(
    REPORT_DIR,
    `order-bumps-${PRODUCT_ID}-${Date.now()}.txt`
);

console.log('🔥 REPORT_FILE =', REPORT_FILE);

const reportLines = [];
const logReport = (line = '') => reportLines.push(line);

async function run() {
    console.log('🚀 run() iniciado');

    await sequelize.authenticate();
    console.log('✅ sequelize.authenticate OK');

    const startedAt = new Date();

    console.log('\n=== Replicate & Fix Order Bumps ===');
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`Source offer: ${SOURCE_OFFER_ID}`);
    console.log(`Dry run: ${DRY_RUN}\n`);

    logReport('=== Replicate & Fix Order Bumps ===');
    logReport(`Started at: ${startedAt.toISOString()}`);
    logReport(`Product ID: ${PRODUCT_ID}`);
    logReport(`Source Offer ID: ${SOURCE_OFFER_ID}`);
    logReport(`Dry run: ${DRY_RUN}`);
    logReport('');

    // 0. Validar oferta modelo
    console.log('🔎 Validando oferta modelo');

    const [sourceOffer] = await sequelize.query(
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

    console.log('🔎 sourceOffer =', sourceOffer);

    if (!sourceOffer) {
        throw new Error(`Oferta modelo ${SOURCE_OFFER_ID} inválida.`);
    }

    // 1. Buscar order bump modelo válido
    console.log('🔎 Buscando order bump modelo válido');

    const [sourceBump] = await sequelize.query(
        `
    SELECT *
    FROM order_bumps
    WHERE id_offer = :sourceOfferId
      AND uuid IS NOT NULL
      AND cover IS NOT NULL
    ORDER BY id DESC
    LIMIT 1
    `,
        {
            type: QueryTypes.SELECT,
            replacements: { sourceOfferId: SOURCE_OFFER_ID },
        }
    );

    console.log('🔎 sourceBump =', sourceBump?.id);

    if (!sourceBump) {
        throw new Error('Nenhum order bump modelo válido encontrado.');
    }

    // 2. Buscar ofertas do produto
    console.log('🔎 Buscando ofertas do produto');

    const offers = await sequelize.query(
        `
    SELECT id
    FROM product_offer
    WHERE id_product = :productId
      AND deleted_at IS NULL
    `,
        {
            type: QueryTypes.SELECT,
            replacements: { productId: PRODUCT_ID },
        }
    );

    console.log(`📦 Total de ofertas encontradas: ${offers.length}`);

    let created = 0;
    let fixed = 0;
    let skipped = 0;

    for (const offer of offers) {
        console.log(`→ Oferta ${offer.id}`);

        const [existing] = await sequelize.query(
            `
      SELECT *
      FROM order_bumps
      WHERE id_offer = :offerId
        AND order_bump_offer = :bumpOfferId
        AND order_bump_plan IS NULL
      LIMIT 1
      `,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    offerId: offer.id,
                    bumpOfferId: sourceBump.order_bump_offer,
                },
            }
        );

        if (existing && existing.uuid && existing.cover) {
            skipped++;
            console.log('  SKIP (válido)');
            continue;
        }

        if (existing && (!existing.uuid || !existing.cover)) {
            fixed++;
            console.log(`  FIX bump id=${existing.id}`);

            if (!DRY_RUN) {
                await sequelize.query(
                    `
          UPDATE order_bumps
          SET
            uuid = :uuid,
            cover = :cover,
            cover_key = :cover_key,
            updated_at = NOW()
          WHERE id = :id
          `,
                    {
                        type: QueryTypes.UPDATE,
                        replacements: {
                            id: existing.id,
                            uuid: uuidv4(),
                            cover: sourceBump.cover,
                            cover_key: sourceBump.cover_key,
                        },
                    }
                );
            }

            continue;
        }

        created++;
        console.log('  CREATE');

        if (!DRY_RUN) {
            await sequelize.query(
                `
        INSERT INTO order_bumps (
          uuid,
          id_offer,
          order_bump_offer,
          order_bump_plan,
          title,
          product_name,
          label,
          price_before,
          show_quantity,
          max_quantity,
          cover,
          cover_key,
          created_at,
          updated_at
        ) VALUES (
          :uuid,
          :id_offer,
          :order_bump_offer,
          NULL,
          :title,
          :product_name,
          :label,
          :price_before,
          :show_quantity,
          :max_quantity,
          :cover,
          :cover_key,
          NOW(),
          NOW()
        )
        `,
                {
                    type: QueryTypes.INSERT,
                    replacements: {
                        uuid: uuidv4(),
                        id_offer: offer.id,
                        order_bump_offer: sourceBump.order_bump_offer,
                        title: sourceBump.title,
                        product_name: sourceBump.product_name,
                        label: sourceBump.label,
                        price_before: sourceBump.price_before,
                        show_quantity: sourceBump.show_quantity,
                        max_quantity: sourceBump.max_quantity,
                        cover: sourceBump.cover,
                        cover_key: sourceBump.cover_key,
                    },
                }
            );
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log({ created, fixed, skipped });

    fs.writeFileSync(REPORT_FILE, reportLines.join('\n'), 'utf-8');
    console.log('📄 Relatório gerado em:', REPORT_FILE);
}

run()
    .catch(err => console.error('❌ ERRO FINAL:', err))
    .finally(async () => {
        try {
            await sequelize.close();
            console.log('🔌 sequelize.close OK');
        } catch (_) { }
    });

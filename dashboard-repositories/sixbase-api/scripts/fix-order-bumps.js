'use strict';

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

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

async function fixOrderBumps() {
    await sequelize.authenticate();

    console.log(`\n=== Fix Order Bumps ===`);
    console.log(`Product: ${PRODUCT_ID}`);
    console.log(`Source offer: ${SOURCE_OFFER_ID}`);
    console.log(`Dry run: ${DRY_RUN}\n`);

    // 1. Buscar bump modelo (fonte da verdade)
    const [sourceBump] = await sequelize.query(
        `
    SELECT *
    FROM order_bumps
    WHERE id_offer = :sourceOfferId
    LIMIT 1
    `,
        {
            type: QueryTypes.SELECT,
            replacements: { sourceOfferId: SOURCE_OFFER_ID },
        }
    );

    if (!sourceBump || !sourceBump.cover) {
        throw new Error('Order bump modelo inválido ou sem cover.');
    }

    // 2. Buscar bumps quebrados do produto
    const brokenBumps = await sequelize.query(
        `
    SELECT ob.id, ob.id_offer
    FROM order_bumps ob
    JOIN product_offer po ON po.id = ob.id_offer
    WHERE po.id_product = :productId
      AND (ob.uuid IS NULL OR ob.cover IS NULL)
    `,
        {
            type: QueryTypes.SELECT,
            replacements: { productId: PRODUCT_ID },
        }
    );

    console.log(`Order bumps quebrados encontrados: ${brokenBumps.length}\n`);

    for (const bump of brokenBumps) {
        console.log(`→ Corrigindo order_bump id=${bump.id} (offer ${bump.id_offer})`);

        if (DRY_RUN) {
            console.log(`  [DRY] uuid=${uuidv4()}`);
            continue;
        }

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
                    id: bump.id,
                    uuid: uuidv4(),
                    cover: sourceBump.cover,
                    cover_key: sourceBump.cover_key,
                },
            }
        );

        console.log(`  ✔ Corrigido`);
    }

    console.log('\nCorreção finalizada.');
}

fixOrderBumps()
    .catch(err => console.error('Erro:', err))
    .finally(async () => {
        try { await sequelize.close(); } catch (_) { }
    });
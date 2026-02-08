

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { QueryTypes } = require('sequelize');

const db = require('../database/models');

const { sequelize } = db;

const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 10000);
const CONCURRENCY = Number(process.env.CONCURRENCY || 3);
const STATE_FILE = path.resolve(__dirname, 'creatorRevenueAggLastId.json');

/* ======================
 * Helpers de estado
 * ====================== */

function loadLastId() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            return data.lastId || 0;
        }
    } catch (err) {
        console.warn(
            'Não foi possível ler creatorRevenueAggLastId.json, começando do zero.',
            err?.message
        );
    }
    return 0;
}

function saveLastId(lastId) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastId }), 'utf-8');
}

/* ======================
 * SQL por chunk
 * ====================== */

async function processChunk(startId, endId) {
    console.log(`Processando users ${startId} → ${endId}`);

    if (DRY_RUN) {
        console.log('[DRY_RUN] Chunk ignorado.');
        return endId;
    }

    await sequelize.query(
        `
        INSERT INTO creator_revenue_agg (
            id_user,
            period,
            revenue,
            sales_count,
            updated_at
        )
        SELECT
            c.id_user,
            'all_time' AS period,
            SUM(c.amount) AS revenue,
            COUNT(DISTINCT c.id_sale_item) AS sales_count,
            NOW()
        FROM commissions c
        JOIN sales_items si ON si.id = c.id_sale_item
        JOIN form_user_profiles fup
            ON fup.id_user = c.id_user
           AND fup.form_type = 2
        WHERE
            c.id_role = 2
            AND si.id_status = 2
            AND c.id_user BETWEEN :startId AND :endId
        GROUP BY c.id_user
        HAVING revenue > 0
        ON DUPLICATE KEY UPDATE
            revenue = VALUES(revenue),
            sales_count = VALUES(sales_count),
            updated_at = VALUES(updated_at)
        `,
        { replacements: { startId, endId } }
    );

    return endId;
}

/* ======================
 * Descobrir range
 * ====================== */

async function getUserRange() {
    const [rows] = await sequelize.query(
        `
        SELECT
            MIN(id_user) AS min_id,
            MAX(id_user) AS max_id
        FROM commissions
        WHERE id_role = 2
        `,
        { type: QueryTypes.SELECT }
    );

    return {
        min: rows.min_id || 0,
        max: rows.max_id || 0,
    };
}

/* ======================
 * Processamento recursivo
 * ====================== */

async function processBatchRecursive(chunks, index, lastId) {
    if (index >= chunks.length) {
        return { processed: 0, lastId };
    }

    const slice = chunks.slice(index, index + CONCURRENCY);

    const results = await Promise.allSettled(
        slice.map(([start, end]) => processChunk(start, end))
    );

    const newLastId = results.reduce((acc, result) => {
        if (result.status === 'fulfilled' && result.value) {
            return Math.max(acc, result.value);
        }
        return acc;
    }, lastId);

    saveLastId(newLastId);

    console.log(
        `Checkpoint salvo em id_user=${newLastId} (chunks processados=${slice.length})`
    );

    const next = await processBatchRecursive(
        chunks,
        index + CONCURRENCY,
        newLastId
    );

    return {
        processed: slice.length + next.processed,
        lastId: next.lastId,
    };
}

/* ======================
 * Runner principal
 * ====================== */

async function updateCreatorRevenueAggAllTime() {
    await sequelize.authenticate();

    const initialLastId = loadLastId();
    const { min, max } = await getUserRange();

    console.log(
        `Iniciando updateCreatorRevenueAggAllTime ` +
        `(batchSize=${BATCH_SIZE}, concurrency=${CONCURRENCY}, dryRun=${DRY_RUN}, ` +
        `range=${min}→${max}, lastId=${initialLastId})`
    );

    const startFrom = Math.max(min, initialLastId + 1);

    const chunks = [];
    for (let i = startFrom; i <= max; i += BATCH_SIZE) {
        chunks.push([i, Math.min(i + BATCH_SIZE - 1, max)]);
    }

    const { processed } = await processBatchRecursive(
        chunks,
        0,
        initialLastId
    );

    console.log(`Finalizado! Chunks processados: ${processed}`);
}

/* ======================
 * Bootstrap
 * ====================== */

updateCreatorRevenueAggAllTime()
    .catch((err) => {
        console.error('Erro geral no script:', err);
    })
    .finally(async () => {
        try {
            await sequelize.close();
        } catch (err) {
            console.warn('Erro ao fechar conexão com o banco:', err?.message);
        }
    });
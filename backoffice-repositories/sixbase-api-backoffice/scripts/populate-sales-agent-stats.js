'use strict';

const { parseUserAgent } = require('../utils/parseUserAgent');
const { QueryTypes } = require('sequelize');
const db = require('../database/models');

const sequelize = db.sequelize;

async function populateAgentStats() {
    const batchSize = 5000;

    const [lastProcessed] = await sequelize.query(
        `SELECT MAX(id_sale) as last_id FROM sales_agent_stats`,
        { type: QueryTypes.SELECT }
    );

    let lastId = lastProcessed?.last_id || 0;
    let hasMore = true;

    while (hasMore) {
        const sales = await sequelize.query(
            `
      SELECT id, params
      FROM sales
      WHERE id > :lastId
      ORDER BY id
      LIMIT :limit
      `,
            {
                type: QueryTypes.SELECT,
                replacements: { limit: batchSize, lastId },
            }
        );

        if (sales.length === 0) {
            hasMore = false;
            break;
        }

        const bulkData = sales.map((sale) => {
            let device = 'Indefinido';
            let browser = 'Indefinido';
            let os = 'Indefinido';
            let origin = 'Indefinido';

            if (sale.params) {
                try {
                    const parsed = parseUserAgent(sale.params);
                    device = parsed.device || 'Indefinido';
                    browser = parsed.browser || 'Indefinido';
                    os = parsed.os || 'Indefinido';
                    origin = parsed.origin || 'Indefinido';
                } catch (e) {
                    console.warn(`Erro ao parsear params da sale ${sale.id}:`, e);
                }
            }

            return {
                id_sale: sale.id,
                device,
                browser,
                os,
                origin,
                created_at: new Date(),
                updated_at: new Date(),
            };
        });

        if (bulkData.length > 0) {
            await sequelize.getQueryInterface().bulkInsert('sales_agent_stats', bulkData, {});
            lastId = sales[sales.length - 1].id;
        }

        console.log(`Processados até id_sale ${lastId}...`);
    }
}

populateAgentStats()
    .then(() => {
        console.log('Finalizado com sucesso!');
        sequelize.close();
    })
    .catch((err) => {
        console.error('Erro ao executar script:', err);
        sequelize.close();
    });
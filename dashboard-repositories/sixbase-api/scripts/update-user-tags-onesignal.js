'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const db = require('../database/models');
const { sequelize } = db;
const { QueryTypes } = require('sequelize');

const CheckAffiliateUC = require('../useCases/dashboard/affiliates/CheckAffiliateHasRecentConfirmedCommissionUseCase');
const CheckProducerUC = require('../useCases/dashboard/producers/CheckProducerHasRecentConfirmedCommissionUseCase');

const { syncUserTags } = require('../useCases/dashboard/users/SyncUserTagsUseCase');
const { updateUserTagsByExternalId } = require('../services/OneSignalService');

const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 1000);
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const STATE_FILE = path.resolve(__dirname, 'lastId.json');

// ---- Helpers p/ salvar e recuperar progresso ----
function loadLastId() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            return data.lastId || 0;
        }
    } catch (err) {
        console.warn('Não foi possível ler lastId.json, começando do zero.');
    }
    return 0;
}

function saveLastId(lastId) {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastId }), 'utf-8');
}

// ---- Processamento ----
async function processUser(user, checkAffiliate, checkProducer) {
    const { id: id_user, uuid: uuid_user, email } = user;

    try {
        const [isAffiliate, isProducer] = await Promise.all([
            checkAffiliate.execute({ affiliateId: id_user, days: 90 }),
            checkProducer.execute({ producerId: id_user, days: 90 }),
        ]);

        const tags = {
            affiliate_status: isAffiliate ? 'active' : '',
            producer_status: isProducer ? 'active' : '',
            user_status: !isAffiliate && !isProducer ? 'inactive' : '',
        };

        if (DRY_RUN) {
            console.log(`[DRY] ${email ?? id_user} (id=${id_user}, uuid=${uuid_user}) -> ${JSON.stringify(tags)}`);
        } else {
            await syncUserTags(id_user, tags);

            if (uuid_user) {
                await updateUserTagsByExternalId(uuid_user, tags, 'web');
                await updateUserTagsByExternalId(uuid_user, tags, 'app');
            } else {
                console.warn(`Usuário id=${id_user} sem UUID — pulando update no OneSignal.`);
            }

            console.log(`OK  -> ${email ?? id_user} (id=${id_user}, uuid=${uuid_user}) ${JSON.stringify(tags)}`);
        }

        return id_user;
    } catch (err) {
        console.error(`FAIL -> user id=${id_user}:`, err?.message || err);
        return id_user;
    }
}

// ---- Loop principal ----
async function updateUserTagsOnesignal() {
    await sequelize.authenticate();

    const checkAffiliate = new CheckAffiliateUC();
    const checkProducer = new CheckProducerUC();

    let lastId = loadLastId();
    let processed = 0;

    console.log(`Iniciando updateUserTagsOnesignal (batchSize=${BATCH_SIZE}, concurrency=${CONCURRENCY}, dryRun=${DRY_RUN}, lastId=${lastId})`);

    while (true) {
        const users = await sequelize.query(
            `
                SELECT id, uuid, email
                FROM users
                WHERE id > :lastId
                ORDER BY id
                LIMIT :limit
            `,
            {
                type: QueryTypes.SELECT,
                replacements: { lastId, limit: BATCH_SIZE },
            }
        );

        if (users.length === 0) break;

        for (let i = 0; i < users.length; i += CONCURRENCY) {
            const slice = users.slice(i, i + CONCURRENCY);

            const results = await Promise.allSettled(
                slice.map(u => processUser(u, checkAffiliate, checkProducer))
            );

            results.forEach(r => {
                if (r.status === 'fulfilled' && r.value) {
                    lastId = Math.max(lastId, r.value);
                }
            });

            processed += slice.length;
            saveLastId(lastId);
        }

        console.log(`Processados até id_user ${lastId} (total=${processed}).`);
    }

    console.log(`Finalizado! Total processado: ${processed}.`);
}

updateUserTagsOnesignal()
    .catch(err => {
        console.error('Erro geral no script:', err);
    })
    .finally(async () => {
        try { await sequelize.close(); } catch (_) { }
    });
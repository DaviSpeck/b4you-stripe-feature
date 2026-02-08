/**
 * Teste REAL do Lambda Botmaker Events
 * -------------------------------------
 * Testa:
 *  - Execução completa (EventBridge)
 *  - Execução via SQS (event + id_user)
 *  - Simulação de todos os casos (--all)
 *  - Mock ou envio real para Botmaker
 */

import * as dotenv from 'dotenv';
dotenv.config();

import minimist from 'minimist';
import { createRequire } from 'module';
import { Sequelize } from 'sequelize';

import { handler } from './index.mjs';
import { routeSqsEvent } from './router/eventRouter.mjs';

import { Users } from './models/users.mjs';
import { Commissions } from './models/Commissions.mjs';
import { NotificationEvents } from './models/Notification_events.mjs';

const require = createRequire(import.meta.url);

/* ======================================================
 * Logger simplificado para teste local
 * ====================================================== */
const logger = require('./services/botmaker-events/src/core/logger');

logger.info = (...args) => console.log('[INFO]', ...args);
logger.warn = (...args) => console.log('[WARN]', ...args);
logger.error = (...args) => console.log('[ERROR]', ...args);

/* ======================================================
 * Mock explícito do dispatcher (SAFE MODE)
 * ====================================================== */
require('./services/botmaker-events/src/core/dispatcher').send = async (payload) => {
  console.log('\n📤 [MOCK][BOTMAKER] Payload que seria enviado:\n');
  console.log(JSON.stringify(payload, null, 2));
  return { mocked: true };
};

/* ======================================================
 * CLI ARGS
 * ====================================================== */
const args = minimist(process.argv.slice(2));

const SINGLE_EVENT = args.event || null;
const USER_ID = args.id ? Number(args.id) : null;
const RUN_ALL = Boolean(args.all);

console.log('===============================================');
console.log('🚀 INICIANDO SIMULAÇÃO DO LAMBDA BOTMAKER');
console.log('===============================================\n');

/* ======================================================
 * Validação de ENV obrigatórias
 * ====================================================== */
const requiredEnv = [
  'MYSQL_HOST',
  'MYSQL_USERNAME',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  'BOTMAKER_ACCESS_TOKEN',
  'BOTMAKER_WHATSAPP_CHANNEL_ID',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ ERRO: ENV obrigatória ausente → ${key}`);
    process.exit(1);
  }
}

/* ======================================================
 * DB + MODELS (MESMO PADRÃO DO LAMBDA)
 * ====================================================== */
function getDatabase() {
  return new Sequelize({
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    dialect: 'mysql',
    logging: false,
  });
}

async function initModels() {
  const sequelize = getDatabase();

  const models = {
    Users: Users.initModel(sequelize),
    Commissions: Commissions.initModel(sequelize),
    NotificationEvents: NotificationEvents.initModel(sequelize),
  };

  return { sequelize, models };
}

/* ======================================================
 * EXECUÇÃO
 * ====================================================== */
(async () => {
  const { sequelize, models } = await initModels();

  try {
    const { getBotmakerEventsModule } = require('./services/botmaker-events/bootstrap');
    const botmakerEvents = getBotmakerEventsModule();

    // ===================================================
    // 1️⃣ TESTE SQS ISOLADO
    // ===================================================
    if (SINGLE_EVENT) {
      console.log(`\n📨 Testando evento SQS → ${SINGLE_EVENT}`);

      const sqsMessage = {
        event: SINGLE_EVENT,
        id_user: USER_ID,
      };

      const result = await routeSqsEvent(
        sqsMessage,
        botmakerEvents,
        sequelize,
        models,
      );

      console.log('\n✅ Resultado SQS:');
      console.log(result);
      return;
    }

    // ===================================================
    // 2️⃣ TESTE DE TODOS OS EVENTOS (--all)
    // ===================================================
    if (RUN_ALL) {
      console.log('\n🔄 Executando TODOS os cenários:');
      console.log('- first_signup');
      console.log('- first_sale');
      console.log('- birthday');
      console.log('- user_inactive_30_days');

      const events = [
        'first_signup',
        'first_sale',
        'birthday',
        'user_inactive_30_days',
      ];

      for (const ev of events) {
        console.log('\n--------------------------------------------------');
        console.log(`▶️ Simulando evento: ${ev}`);

        const msg = { event: ev, id_user: USER_ID };

        await routeSqsEvent(
          msg,
          botmakerEvents,
          sequelize,
          models,
        );
      }

      console.log('\n🎉 Finalizado teste de todos os cenários!');
      return;
    }

    // ===================================================
    // 3️⃣ EXECUÇÃO PADRÃO (EVENTBRIDGE)
    // ===================================================
    console.log('\n▶️ Executando handler() como EventBridge...\n');

    const result = await handler({
      source: 'aws.events',
    });

    console.log('\n===============================================');
    console.log('✅ RESULTADO DA EXECUÇÃO COMPLETA');
    console.log('===============================================\n');

    console.log(JSON.stringify(result, null, 2));
    console.log('\n🎉 Teste concluído com sucesso!\n');

  } catch (err) {
    console.error('\n❌ ERRO DURANTE O TESTE');
    console.error(err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
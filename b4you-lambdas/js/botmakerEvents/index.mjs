import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { createRequire } from 'module';

import { Users } from './models/users.mjs';
import { Commissions } from './models/Commissions.mjs';
import { NotificationEvents } from './models/Notification_events.mjs';

import { findBirthdayUsers } from './useCases/findBirthdayUsers.mjs';
import {
  findUsersInactive30Days,
  getInactiveCutoffDate,
} from './useCases/findUsersInactive30Days.mjs';

import { routeSqsEvent } from './router/eventRouter.mjs';
import { emitConfiguredEvent } from './useCases/emitConfiguredEvent.mjs';
import { getBotmakerEventsModule } from './services/botmaker-events/bootstrap.js';

dotenv.config();

const require = createRequire(import.meta.url);
const logger = require('./services/botmaker-events/src/core/logger');

/**
 * =======================================================
 * Database
 * =======================================================
 */
function getDatabaseConnection() {
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USERNAME,
  } = process.env;

  return new Sequelize({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: Number(MYSQL_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: { decimalNumbers: true },
  });
}

/**
 * =======================================================
 * Models
 * =======================================================
 */
function initModels(sequelize) {
  return {
    Users: Users.initModel(sequelize),
    Commissions: Commissions.initModel(sequelize),
    NotificationEvents: NotificationEvents.initModel(sequelize),
  };
}

/**
 * =======================================================
 * Lambda handler
 * =======================================================
 */
export const handler = async (event) => {
  const sequelize = getDatabaseConnection();
  const botmakerEvents = getBotmakerEventsModule();
  const models = initModels(sequelize);

  const isSqs = event?.Records?.[0]?.eventSource === 'aws:sqs';
  const isSchedule = event?.source === 'aws.events';

  const targetUserId = process.env.BOTMAKER_TEST_USER_ID
    ? Number(process.env.BOTMAKER_TEST_USER_ID)
    : undefined;

  try {
    // =======================================================
    // 1️⃣ SQS — eventos transacionais
    // =======================================================
    if (isSqs) {
      logger.info(`📥 Processing ${event.Records.length} SQS messages…`);

      for (const record of event.Records) {
        try {
          const message = JSON.parse(record.body);

          await routeSqsEvent(
            message,
            botmakerEvents,
            sequelize,
            models
          );
        } catch (err) {
          logger.error('❌ Error processing SQS message', {
            message: err.message,
            body: record.body,
          });
        }
      }

      return { processedSqsMessages: event.Records.length };
    }

    // =======================================================
    // 2️⃣ EventBridge — jobs agendados
    // =======================================================
    if (isSchedule) {
      logger.info('⏰ EventBridge trigger received — running daily jobs…');

      /**
       * -----------------------------
       * Inativos 30 dias
       * -----------------------------
       */
      const cutoffDate = getInactiveCutoffDate();

      const inactivePayloads = await findUsersInactive30Days(
        sequelize,
        models,
        { userId: targetUserId }
      );

      logger.info('Inactive users lookup completed', {
        cutoffDate,
        total: inactivePayloads.length,
      });

      for (const payload of inactivePayloads) {
        await emitConfiguredEvent({
          eventKey: 'user_inactive_30_days',
          payload,
          botmakerEvents,
          models,
        });
      }

      /**
       * -----------------------------
       * Aniversário
       * -----------------------------
       */
      const birthdayPayloads = await findBirthdayUsers(
        sequelize,
        models,
        new Date(),
        { userId: targetUserId }
      );

      logger.info('Birthday lookup completed', {
        total: birthdayPayloads.length,
      });

      for (const payload of birthdayPayloads) {
        await emitConfiguredEvent({
          eventKey: 'birthday',
          payload,
          botmakerEvents,
          models,
        });
      }

      return {
        processedInactiveUsers: inactivePayloads.length,
        processedBirthdayUsers: birthdayPayloads.length,
        cutoffDate,
      };
    }

    // =======================================================
    // Fallback
    // =======================================================
    logger.warn('⚠️ Event received but trigger type not recognized', event);

    return {
      message: 'No valid trigger detected (expected SQS or EventBridge)',
      rawEvent: event,
    };

  } catch (error) {
    logger.error('❌ Error executing botmaker unified lambda', {
      message: error.message,
      stack: error.stack,
    });
    throw error;

  } finally {
    await sequelize.close();
  }
};
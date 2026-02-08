import moment from 'moment';
import { SalesMetricsDaily } from './database/models/SalesMetricsDaily.mjs';
import { Database } from './database/sequelize.mjs';
// import { SalesItemsRepository } from './repositories/sequelize/SalesItemsRepository.mjs';
// import { UsersRepository } from './repositories/sequelize/UsersRepository.mjs';
// import { AutoBlockWithdrawals } from './useCases/AutoBlockWithdrawals.mjs';
// import { WithdrawalsSettingsRepository } from './repositories/sequelize/WithdrawalsSettingsRepository.mjs';

export const handler = async (event) => {
  console.log(event);
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_USERNAME, MYSQL_PASSWORD } = process.env;

  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  try {
    const { Records } = event;
    const [message] = Records;

    // Validar se a mensagem existe
    if (!message || !message.body) {
      throw new Error('Invalid message format');
    }

    // accepted statuses are: pending, paid, refunded, chargeback, denied
    const {
      id_user,
      id_product,
      amount,
      paid_at,
      created_at,
      statusAfter,
      statusBefore = null,
    } = JSON.parse(message.body);

    // Ignorar mensagens de reembolso sem paid_at quando statusAfter é refunded e statusBefore é paid
    if (statusAfter === 'refunded' && statusBefore === 'paid' && (!paid_at || paid_at === null)) {
      console.log(
        'Ignoring refund message without paid_at: statusAfter=refunded, statusBefore=paid, paid_at=null'
      );
      return;
    }

    // Função para calcular a data baseada no status
    const calculateDate = (status, paidAt, createdAt) => {
      // Para status que não são pagos, usar created_at
      if (status === 'pending' || status === 'denied') {
        return moment(createdAt).subtract(3, 'h').startOf('day').add(3, 'h').toISOString();
      }
      // Para status pagos, usar paid_at
      return moment(paidAt).subtract(3, 'h').startOf('day').add(3, 'h').toISOString();
    };

    // Calcular data para statusAfter
    const dateAfter = calculateDate(statusAfter, paid_at, created_at);

    // Usar transação para garantir consistência
    await database.sequelize.transaction(async (transaction) => {
      // Atualizar métricas para statusAfter usando query raw para garantir UPSERT correto
      console.log(
        `Updating metrics for statusAfter: ${statusAfter}, date: ${dateAfter}, amount: ${amount}`
      );

      await database.sequelize.query(
        `INSERT INTO sales_metrics_daily (id_user, id_product, time, ${statusAfter}_count, ${statusAfter}_total) 
         VALUES (?, ?, ?, 1, ?) 
         ON DUPLICATE KEY UPDATE 
         ${statusAfter}_count = ${statusAfter}_count + 1,
         ${statusAfter}_total = ${statusAfter}_total + ?`,
        {
          replacements: [id_user, id_product, dateAfter, amount, amount],
          transaction,
          logging: console.log,
        }
      );

      console.log(`Successfully updated ${statusAfter} metrics`);

      // Atualizar métricas para statusBefore (se existir)
      if (statusBefore) {
        const dateBefore = calculateDate(statusBefore, paid_at, created_at);
        console.log(
          `Updating metrics for statusBefore: ${statusBefore}, date: ${dateBefore}, amount: ${amount}`
        );

        // Usar UPDATE com WHERE para garantir que só decrementa se o registro existir
        const [updatedRows] = await SalesMetricsDaily.update(
          {
            [`${statusBefore}_count`]: database.sequelize.literal(
              `GREATEST(${statusBefore}_count - 1, 0)`
            ),
            [`${statusBefore}_total`]: database.sequelize.literal(
              `GREATEST(${statusBefore}_total - ${amount}, 0)`
            ),
          },
          {
            where: {
              id_product,
              id_user,
              time: dateBefore,
            },
            transaction,
            logging: console.log,
          }
        );

        console.log(`Updated ${updatedRows} rows for statusBefore: ${statusBefore}`);

        // Log se nenhuma linha foi atualizada (registro não existe)
        if (updatedRows === 0) {
          console.warn(
            `No record found to decrement for statusBefore: ${statusBefore}, date: ${dateBefore}`
          );
        }
      }
    });

    console.log('Metrics updated successfully');

    // try {
    //   const autoBlockWithdrawals = new AutoBlockWithdrawals(
    //     UsersRepository,
    //     SalesItemsRepository,
    //     WithdrawalsSettingsRepository
    //   );
    //   await autoBlockWithdrawals.execute(parseInt(id_user));
    // } catch (autoBlockWithdrawalsError) {
    //   console.error(autoBlockWithdrawalsError);
    // }
  } catch (error) {
    console.error('Error processing message:', error);
    throw error;
  } finally {
    // Sempre fechar a conexão
    await database.closeConnection();
  }
};

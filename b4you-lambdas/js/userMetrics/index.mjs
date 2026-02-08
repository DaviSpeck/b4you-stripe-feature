import { Database } from './database/sequelize.mjs';
import { UsersRevenue } from './database/models/UsersRevenue.mjs';
import { UsersTotalCommission } from './database/models/UsersTotalCommission.mjs';

export const handler = async (event) => {
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USERNAME } = process.env;
  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  try {
    const { Records } = event;
    const [message] = Records;
    const { id_user, amount, paid_at, operation = 'increment' } = JSON.parse(message.body);

    if (operation === 'increment') {
      await database.sequelize.transaction(async (t) => {
        const oldTotalCommission = await UsersTotalCommission.findOne({
          raw: true,
          where: { id_user },
          transaction: t,
          lock: true,
        });
        if (!oldTotalCommission) {
          await UsersTotalCommission.create(
            { id_user, total: amount },
            { transaction: t, lock: true }
          );
        } else {
          await UsersTotalCommission.increment('total', {
            by: amount,
            where: { id: oldTotalCommission.id },
            transaction: t,
            lock: true,
          });
        }
        const oldRevenue = await UsersRevenue.findOne({
          raw: true,
          where: { id_user, paid_at },
          transaction: t,
          lock: true,
        });
        if (!oldRevenue) {
          await UsersRevenue.create(
            { id_user, paid_at, total: amount },
            { transaction: t, lock: true }
          );
        } else {
          await UsersRevenue.increment('total', {
            where: { id: oldRevenue.id },
            transaction: t,
            lock: true,
          });
        }

        return true;
      });
    } else {
      await database.sequelize.transaction(async (t) => {
        await UsersTotalCommission.decrement('total', {
          by: amount,
          where: { id_user },
          transaction: t,
          lock: true,
        });
        await UsersRevenue.decrement('total', {
          by: amount,
          where: { paid_at, id_user },
          transaction: t,
          lock: true,
        });
        return true;
      });
    }
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  }
};

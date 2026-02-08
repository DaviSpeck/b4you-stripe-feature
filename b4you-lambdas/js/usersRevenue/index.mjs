import { Database } from "./database/sequelize.mjs";
import { AwardShipments } from "./database/models/AwardShipments.mjs";
import { Commissions } from "./database/models/Commissions.mjs";
import { UsersRevenue } from "./database/models/UsersRevenue.mjs";
import { UsersTotalCommission } from "./database/models/UsersTotalCommission.mjs";
import { AWARD_THRESHOLDS } from "./mocks/AwardThresholds.mjs";
import { processAwardShipments } from "./useCases/awardShipments/awards.mjs";
// import { AwardAchieved } from "./services/mails/messages.mjs"; // Habilitar junto com e-mail
// import { sendMail } from "./services/sender.mjs" // Habilitar junto com e-mail

export const handler = async (event) => {
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USERNAME,
  } = process.env;
  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  try {
    const { Records } = event;
    const [message] = Records;
    const {
      id_user,
      amount,
      paid_at,
      operation = "increment",
    } = JSON.parse(message.body);
    console.log(event);

    if (paid_at === "Invalid date") {
      console.log("problema de data no evento -> ", event);

      return {
        statusCode: 200,
        body: JSON.stringify("Hello from Lambda!"),
      };
    }

    if (operation === "increment") {
      await database.sequelize.transaction(async (t) => {
        try {
          await UsersTotalCommission.create(
            { id_user, total: amount },
            { transaction: t, lock: true }
          );
        } catch (error) {
          console.log(error);
          await UsersTotalCommission.increment("total", {
            by: amount,
            where: { id_user },
            transaction: t,
            lock: true,
          });
        }

        try {
          await UsersRevenue.create(
            { id_user, paid_at, total: amount },
            { transaction: t, lock: true }
          );
        } catch (error) {
          console.log(error);
          await UsersRevenue.increment("total", {
            by: amount,
            where: { id_user, paid_at },
            transaction: t,
            lock: true,
          });
        }

        try {
          await processAwardShipments({
            database,
            AwardShipments,
            Commissions,
            AWARD_THRESHOLDS,
            id_user,
            paid_at,
            transaction: t,
          });
        } catch (awardError) {
          console.error(awardError);
        }

        return true;
      });
    } else {
      await database.sequelize.transaction(async (t) => {
        await UsersTotalCommission.decrement("total", {
          by: amount,
          where: { id_user },
          transaction: t,
          lock: true,
        });
        await UsersRevenue.decrement("total", {
          by: amount,
          where: { paid_at, id_user },
          transaction: t,
          lock: true,
        });
        return true;
      });
    }
    return {
      statusCode: 200,
      body: JSON.stringify("Hello from Lambda!"),
    };
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  }
};

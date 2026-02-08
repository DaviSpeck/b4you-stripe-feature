import { Database } from "./database/sequelize.mjs";
import {  WithdrawalController } from "./controllers/Withdrawals.mjs";
/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @returns
 */
export const handler = async (event) => {
  console.log(event);
  let database = null;
  let body = {};
  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
  } = process.env;
  if (!database) {
    database = await new Database({
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
  } else {
    database.refreshConnection();
  }

  const { Records } = event;
  const [message] = Records;
  const data = JSON.parse(message.body)
  try {
      console.log(`CALLBACK WITHDRAWAL -> ${data}`);
      body = await WithdrawalController(data, Database);
    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 200,
    };
  } finally {
    await database.closeConnection();
  }
};

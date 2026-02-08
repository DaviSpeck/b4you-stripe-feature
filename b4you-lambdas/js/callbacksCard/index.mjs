import { Database } from './database/sequelize.mjs';
import { PaymentService } from './services/PaymentService.mjs';
import { HttpClient } from './services/HTTPClient.mjs';
import ChargebackDispute from './useCases/Chargebacks.mjs';
import ChargebackLost from './useCases/ChargebackLost.mjs';
import ChargebackWin from './useCases/ChargebackWin.mjs';
import ChargebackReverse from './useCases/ChargebackReverse.mjs';
import Denied from './useCases/Denied.mjs';
import ChargebackPagarme from './useCases/ChargebackLostPagarme.mjs';

const makePaymentService = () => {
  const { PAY42_KEY, PAY42_URL } = process.env;
  return new PaymentService(new HttpClient({ baseURL: PAY42_URL }), PAY42_KEY);
};

const CHARGEBACK = 6;
const CHARGEBACK_DISPUTE = 7;
const CHARGEBACK_WIN = 1;
const DENIED = 2;
const CHARGEBACK_REVERSE = 8;

const successResponse = {
  statusCode: 200,
  body: JSON.stringify('Callback Success!'),
};
export const handler = async (event) => {
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_USERNAME, MYSQL_PASSWORD, ENV } = process.env;

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
    console.log('Event-> ', event);
    const { Records } = event;
    const [message] = Records;
    const { id, status, provider } = JSON.parse(message.body);
    if (provider && provider === 'PAGARME') {
      await database.sequelize.transaction(async (t) => {
        await ChargebackPagarme.execute({ provider_id: id, t });
        return true;
      });
    } else {
      console.log(`psp_id -> ${id} - status -> ${status}`);
      let paymentTransaction;
      if (ENV === 'sandbox') {
        paymentTransaction = {
          status,
        };
      } else {
        const paymentServiceInstance = makePaymentService();
        paymentTransaction = await paymentServiceInstance.getTransactionByID(id);
        if (!paymentTransaction) {
          console.log('invalid callback');
          return successResponse;
        }
      }

      if (
        ![DENIED, CHARGEBACK, CHARGEBACK_DISPUTE, CHARGEBACK_WIN].includes(
          paymentTransaction.status
        )
      ) {
        console.log('invalid status -> ', paymentTransaction);
        return successResponse;
      }

      console.log(paymentTransaction);
      await database.sequelize.transaction(async (t) => {
        if (status === CHARGEBACK_DISPUTE) {
          console.log(`USE CASE CHARGEBACK DISPUTE PSP ID ${id}`);
          await new ChargebackDispute({
            psp_id: id,
            t,
          }).execute();
        } else if (status === CHARGEBACK) {
          console.log(`USE CASE CHARGEBACK PSP ID ${id}`);
          await new ChargebackLost({
            psp_id: id,
            t,
          }).execute();
        } else if (status === CHARGEBACK_WIN) {
          console.log(`USE CASE CHARGEBACK WIN PSP ID ${id}`);
          await new ChargebackWin({
            psp_id: id,
            t,
          }).execute();
        } else if (status === DENIED) {
          console.log(`USE CASE DENIED PSP ID ${id}`);
          await new Denied({
            psp_id: id,
            t,
          }).execute();
        } else if (status === CHARGEBACK_REVERSE) {
          console.log(`USE CASE REVERSE PSP ID ${id}`);
          await new ChargebackReverse({
            psp_id: id,
            t,
          }).execute();
        }
        return true;
      });
    }
  } catch (error) {
    console.log(error);
    await database.closeConnection();
    throw error;
  } finally {
    await database.closeConnection();
    return successResponse;
  }
};

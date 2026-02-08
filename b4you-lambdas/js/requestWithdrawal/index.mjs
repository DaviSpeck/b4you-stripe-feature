import { Database } from './database/sequelize.mjs';
import { HttpClient } from './services/HTTPClient.mjs';
import { Pagarme } from './services/Pagarme.mjs';
import { SandboxPaymentProvider } from './services/SandboxPaymentProvider.mjs';
import { CreateWithdrawal } from './useCases/CreateWithdrawal.mjs';

const makePaymentProviders = (isSandbox, config) => {
  if (isSandbox) {
    console.log('[SANDBOX MODE] Using sandbox payment providers');
    const sandboxProvider = new SandboxPaymentProvider();
    return { pagarmeProviders: [sandboxProvider, sandboxProvider] };
  }

  console.log('[PRODUCTION MODE] Using real Pagarme providers');
  const { PAGARME_URL, PAGARME_PASSWORD_2, PAGARME_PASSWORD_3 } = config;

  const pagarmeDigital = new Pagarme(new HttpClient({ baseURL: PAGARME_URL }), PAGARME_PASSWORD_3);

  const pagarmeNewKey = new Pagarme(new HttpClient({ baseURL: PAGARME_URL }), PAGARME_PASSWORD_2);

  return { pagarmeProviders: [pagarmeDigital, pagarmeNewKey] };
};

export const handler = async (event) => {
  console.log('Event:', event);

  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_PORT,
    MYSQL_USERNAME,
    PAGARME_URL,
    PAGARME_PASSWORD_2,
    PAGARME_PASSWORD_3,
    SANDBOX_MODE,
  } = process.env;

  const isSandbox = SANDBOX_MODE === 'true' || SANDBOX_MODE === '1';

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
    const { id_user, amount } = JSON.parse(message.body);

    const { pagarmeProviders } = makePaymentProviders(isSandbox, {
      PAGARME_URL,
      PAGARME_PASSWORD_2,
      PAGARME_PASSWORD_3,
    });

    const data = await new CreateWithdrawal({
      Database: database,
      pagarmeProviders,
      isSandbox,
    }).execute({ amount, id_user });

    console.log('Result:', data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Withdrawal processed successfully',
        data,
        mode: isSandbox ? 'sandbox' : 'production',
      }),
    };
  } catch (error) {
    console.error('Error processing withdrawal:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing withdrawal',
        error: error.message,
      }),
    };
  } finally {
    await database.closeConnection();
  }
};

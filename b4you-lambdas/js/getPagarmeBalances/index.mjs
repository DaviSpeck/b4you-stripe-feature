import { Users } from './database/models/Users.mjs';
import { Database } from './database/sequelize.mjs';
import { Pagarme } from './services/Pagarme.mjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
const secret_name = "getPagarmeBalances_PRODUCTION";

const clientSecret = new SecretsManagerClient({
  region: 'sa-east-1',
  credentials: {
    accessKeyId: 'AKIAXFTJAD3BSYLH45TK',
    secretAccessKey: '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'
  }
})

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const handler = async () => {
  let response;
  try {
    response = await clientSecret.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: 'AWSCURRENT'
      })
    )
  } catch (error) {
    console.log('error while getting secret -> ', error)
    throw error
  }

  const secret = JSON.parse(response.SecretString);

  const database = await new Database({
    database: 'mango5',
    host: secret.MYSQL_HOST,
    password: secret.MYSQL_PASSWORD,
    username: 'admin',
    port: 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      decimalNumbers: true,
    },
  }).connect();

  const pagarme2 = new Pagarme(secret.PAGARME_PASSWORD_2);
  const pagarme3 = new Pagarme(secret.PAGARME_PASSWORD_3);
  const client = new DynamoDBClient({
    region: 'sa-east-1',
  });

  let total = 100;
  let offset = 0;

  try {
    while (total !== 0) {
      const [users] = await Users.sequelize.query(
        `SELECT u.id,
          u.pagarme_recipient_id,
          u.pagarme_recipient_id_cnpj,
          u.pagarme_recipient_id_3,
          u.pagarme_recipient_id_cnpj_3,
          (SELECT userBalance(u.id)) AS balance
            FROM users u
            WHERE
              u.verified_company_pagarme = 3
              or u.verified_pagarme = 3
              or u.verified_pagarme_3 = 3
              or u.verified_company_pagarme_3 = 3
          HAVING balance > 0 limit 100 offset :offset;`,
        {
          replacements: {
            offset,
          },
        }
      );

      if (users.length < 100) {
        total = 0;
      }

      offset += 100;
      for await (const user of users) {
        console.log(user);
        try {
          let data = {
            total_key_2: 0,
            total_key_3: 0,
          };

          if (user.pagarme_recipient_id) {
            const resp = await pagarme2.getBalance(user.pagarme_recipient_id);
            console.log(resp);
            data.total_key_2 += resp.available_amount;
            data.total_key_2 += resp.waiting_funds_amount;
          }
          if (user.pagarme_recipient_id_cnpj) {
            const resp = await pagarme2.getBalance(user.pagarme_recipient_id_cnpj);
            console.log(resp);
            data.total_key_2 += resp.available_amount;
            data.total_key_2 += resp.waiting_funds_amount;
          }
          if (user.pagarme_recipient_id_3) {
            const resp = await pagarme3.getBalance(user.pagarme_recipient_id_3);
            data.total_key_3 += resp.available_amount;
            data.total_key_3 += resp.waiting_funds_amount;
          }
          if (user.pagarme_recipient_id_cnpj_3) {
            const resp = await pagarme3.getBalance(user.pagarme_recipient_id_cnpj_3);
            data.total_key_3 += resp.available_amount;
            data.total_key_3 += resp.waiting_funds_amount;
          }

          console.log('data -> ', data)

          const params = {
            TableName: 'pagarme-balances',
            Item: {
              id_user: user.id.toString(),
              data: {
                M: {
                  total_key_2: { S: (data.total_key_2 ?? '0').toString() },
                  total_key_3: { S: (data.total_key_3 ?? '0').toString() },
                },
              },
            },
          };

          const command = new PutCommand(params);
          await client.send(command);
          await delay(800);
        } catch (error) {
          console.log('erro dentro do for -> ', error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await database.closeConnection();
  }
};

handler();

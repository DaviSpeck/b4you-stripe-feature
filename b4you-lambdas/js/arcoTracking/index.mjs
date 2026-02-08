import { Database } from './database/sequelize.mjs';
import { Sales } from './database/models/Sales.mjs';
import { Webhooks } from './database/models/Webhooks.mjs';
import { trackingEmail } from './email/messages.mjs';
import { MailService } from './services/MailService.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
const TYPE_ARCO = 3;

const defaultHeaders = {
  'Content-Type': 'application/json',
};

const capitalizeName = (name) => {
  if (!name) return '';
  name = name.toLowerCase().replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
  const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(`\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g'),
      prepos[i]
    );
  }

  return name;
};

/**
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @returns
 */
export const handler = async (event) => {
  console.log('new event on arco tracking', event);
  const headers = event.headers;
  const body = JSON.parse(event.body);
  console.log('parsed', body);

  const {
    MYSQL_DATABASE,
    MYSQL_HOST,
    MYSQL_PASSWORD,
    MYSQL_USERNAME,
    MYSQL_PORT,
    MAILJET_USERNAME,
    MAILJET_PASSWORD,
  } = process.env;
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
    const Mail = new MailService({
      userName: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: 'naoresponda@b4you.com.br',
      templateID: '3501751',
    });

    if (body.event === 'tracking:update') {
      const { result } = body;
      const hToken = headers['x-platform-token'];
      console.log('buscando webhook', hToken);
      const webhook = await Webhooks.findOne({
        where: {
          id_type: TYPE_ARCO,
          token: hToken,
        },
      });
      if (!webhook) {
        console.log('webhook nao encontrado');
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'Unauthorized (01)!' }),
          headers: defaultHeaders,
        };
      }
      console.log('Webhook encontrado ->', webhook);
      for await (const s of result) {
        console.log('buscando sale uuid->', s.token);
        const sale = await Sales.findOne({
          where: {
            uuid: s.token,
          },
        });
        if (sale) {
          console.log('venda encontrada, atualizando', sale);
          await Sales_items.update(
            { tracking_code: s.tracking_code, tracking_company: s.shipping_provider },
            {
              where: {
                id_sale: sale.id,
              },
            }
          );
          console.log('sale atualizada com sucesso');
          console.log('iniciando disparo de email', sale.email);
          let url = 'https://rastreamento.correios.com.br/';
          if (s.shipping_provider === 'jadlog')
            url = 'https://www.jadlog.com.br/siteInstitucional/tracking.jad/';
          if (s.shipping_provider === 'totalexpress')
            url = 'https://totalconecta.totalexpress.com.br/rastreamento/';
          if (s.shipping_provider === 'jtexpress')
            url = `https://www.jtexpress.com.br/trajectoryQuery?waybillNo=${s.tracking_code}&type=0&cpf=${sale.document_number}`;
          await Mail.sendMail({
            subject: 'Código de rastreio atualizado',
            toAddress: [
              {
                Email: sale.email,
                Name: capitalizeName(sale.full_name),
              },
            ],
            variables: trackingEmail(
              capitalizeName(sale.full_name),
              s.tracking_code,
              capitalizeName(s.shipping_provider),
              url
            ),
          });
          console.log('email enviado', sale.email);
        } else {
          console.log('venda nao encontrada, pulando para proxima venda');
          continue;
        }
      }
      console.log('FINALIZADO');
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'ok!' }),
      headers: defaultHeaders,
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
      headers: defaultHeaders,
    };
  } finally {
    await database.closeConnection();
  }
};

// handler({
//   headers: {
//     'x-platform-token': '',
//   },
//   body: JSON.stringify({
//     event: 'tracking:update',
//     integration_info: {
//       api_key: '',
//       partner_key: null,
//     },
//     result: [
//       {
//         token: '',
//         shipping_provider: '',
//         tracking_code: '',
//         was_received: ,
//       },
//     ],
//   }),
// });

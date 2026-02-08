import { findPlugins } from './database/controllers/Plugins.mjs';
import { Database } from './database/sequelize.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import { Sales } from './database/models/Sales.mjs';
import { trackingEmail } from './email/messages.mjs';
import { MailService } from './services/MailService.mjs';
import { Sequelize } from 'sequelize';
import { Invoices } from './database/models/Invoices.mjs';
import aws from './queues/aws.mjs';

const capitalizeName = name => {
  if (!name) return '';
  name = name.toLowerCase().replace(/(?:^|\s)\S/g, capitalize => capitalize.toUpperCase());

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
export const handler = async event => {
  console.log('new event on notazz tracking', event);

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
    const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
    const parsedBody = new URLSearchParams(decodedBody);
    const bodyObject = Object.fromEntries(parsedBody.entries());
    console.log(bodyObject);

    const Mail = new MailService({
      userName: MAILJET_USERNAME,
      password: MAILJET_PASSWORD,
      emailSender: 'naoresponda@b4you.com.br',
      templateID: '3501751',
    });

    const {
      token: token_webhook,
      id,
      //external_id: sale_uuid,
      rastreio: tracking_code,
      rastreio_notazz: tracking_url,
      clienteEmail,
      clienteNome,
    } = bodyObject;
    console.log('buscando plugin, token->', token_webhook);
    const plugin = await findPlugins({
      id_plugin: 15,
      settings: {
        '"webhook_token"': token_webhook,
      },
    });
    if (!plugin) {
      console.log('plugin nao encontrado');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized (01)!' }),
      };
    }
    console.log('Plugin encontrado ->', plugin);
    console.log('Buscando sale');
    const invoice = await Invoices.findOne({
      where: Sequelize.literal(`JSON_EXTRACT(integration_response, '$.id') = '${id}'`),
      logging: true,
    });

    if (!invoice) {
      console.log('invoice nao encontrada');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized (02)!' }),
      };
    }
    console.log('atualizando invoice', invoice, tracking_code, tracking_url);
    await Sales_items.update(
      { tracking_code, tracking_url, tracking_company: 'Notazz' },
      {
        where: {
          id_sale: invoice.id_sale,
        },
      }
    );
    console.log('sale atualizada com sucesso');
    console.log('buscando sale', invoice.id_sale);
    const sale = await Sales.findOne({
      where: {
        id: invoice.id_sale,
      },
    });
    console.log('busca da sale', sale);
    if (sale) {
      console.log('iniciando disparo de email', sale.email, clienteEmail);
      if (sale.email === clienteEmail) {
        console.log('Disparando email para cliente->', sale.email);
        await Mail.sendMail({
          subject: 'Código de rastreio atualizado',
          toAddress: [
            {
              Email: sale.email,
              Name: capitalizeName(clienteNome),
            },
          ],
          variables: trackingEmail(capitalizeName(clienteNome), tracking_code, tracking_url),
        });
      }
      console.log('processo finalizado');
      try {
        const saleItem = await Sales_items.findOne({
          where: {
            id_sale: invoice.id_sale,
            type: 1,
          },
          attributes: ['id_sale', 'id', 'type', 'id_product'],
        });
        if (saleItem) {
          console.log('sale item->', saleItem);
          console.log('tentando enviar webhook rastreio');
          await aws.add('webhookEvent', {
            id_product: saleItem.id_product,
            id_sale_item: saleItem.id,
            id_user: sale.id_user,
            id_event: 11, // tracking
          });
        }
      } catch (error) {
        console.log('erro ao enviar webhook rastreio', error);
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'ok!' }),
    };
  } catch (error) {
    console.log('error', error);
  } finally {
    await database.closeConnection();
  }
};

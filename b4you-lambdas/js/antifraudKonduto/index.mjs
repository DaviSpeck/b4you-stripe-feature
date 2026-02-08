// https://docs.konduto.com/reference/par%C3%A2metros-da-notifica%C3%A7%C3%A3o-2
import { Database } from './database/sequelize.mjs';
import { Charges } from './database/models/Charges.mjs';
import { findChargeStatusByKey } from './status/charges.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import crypto from 'crypto';
import axios from 'axios';
const headers = {
  'Content-Type': 'application/json',
};
const UPSELL_TYPE = 2
const PAID = 2

function validateSignature(toHash, signature, keys) {
  for (const key of keys) {
    const hash = crypto.createHmac('sha256', key).update(toHash).digest('hex');

    if (hash === signature) {
      return { valid: true, usedKey: key };
    }
  }
  return { valid: false };
}

const updateOrder = async (data, token) => {
  const { order_id } = data;

  if (order_id) {
    const charge = await Charges.findOne({
      nest: true,
      where: {
        provider_id: order_id,
        id_status: findChargeStatusByKey('paid').id,
      },
      attributes: ['id', 'id_status', 'provider_id', 'uuid', "id_sale"],
      include: [
        {
          association: 'sales_items',
          where: {
            id_status: PAID,
          },
          attributes: ['uuid'],
        },
      ],
    });
    if (!charge) {
      console.log(`Charge doesnt found in status paid ${order_id}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Unexpected error',
        }),
        headers,
      };
    }
    console.log('FOUNDED CHARGE', JSON.stringify(charge));

    const upsellOrders = await Sales_items.findAll({
      raw: true,
      where: {
        id_sale: charge.id_sale,
        id_status: PAID,
        type: UPSELL_TYPE
      },
      attributes: ["uuid"],
    })
    const body = {
      sales_items_uuids: [
        ...charge.sales_items.map(item => item.uuid),
        ...upsellOrders.map(item => item.uuid),
      ],
    };
    console.log('CHARGE UPSELL', JSON.stringify(upsellOrders));

    console.log('body', body);
    try {
      const endpoint = 'https://api-backoffice.b4you.com.br';
      console.log('trying do post backoffice');
      const responseBackoffice = await axios.post(
        `${endpoint}/api/konduto/refund`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('response backoffie', responseBackoffice);
    } catch (error) {
      console.log('error on api backoffice', error);
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' }),
    headers,
  };
};

/**
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @returns
 */
export const handler = async (event) => {
  console.log('event', event);
  let database = null;
  let response = {
    statusCode: 500,
    body: JSON.stringify({
      message: 'Unexpected error',
    }),
    headers,
  };
  try {
    const {
      MYSQL_DATABASE,
      MYSQL_HOST,
      MYSQL_PASSWORD,
      MYSQL_USERNAME,
      MYSQL_PORT,
      KONDUTO_API_KEY_DIGITAL,
      KONDUTO_API_KEY_PHYSICAL,
      BACKOFFICE_TOKEN,
    } = process.env;
    if (!database) {
      database = await new Database({
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
    } else {
      database.refreshConnection();
    }

    switch (event.routeKey) {
      case 'POST /':
        const body = JSON.parse(event.body);
        console.log('KONDUTO body->', body);
        const toHash = `${body.order_id}#${body.timestamp}#${body.status}`;
        const result = validateSignature(toHash, body.signature, [
          KONDUTO_API_KEY_DIGITAL,
          KONDUTO_API_KEY_PHYSICAL,
        ]);
        console.log('Result signature', result);
        if (result.valid && body.status === 'DECLINED') {
          console.log('ASSINATURA VÁLIDA, EXECUTANDO CASO DE USO');
          response = await updateOrder(body, BACKOFFICE_TOKEN);
          return response;
        } else {
          console.log('ASSINATURA INVALIDA');
        }
        return response;
    }
  } catch (error) {
    console.log(error);
  } finally {
    await database.closeConnection();
    return response;
  }
};

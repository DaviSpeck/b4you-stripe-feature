import { findPlugins } from './database/controllers/Plugins.mjs';
import { getProductsController } from './controllers/Products.mjs';
import {
  getSalesController,
  updateSaleController,
} from './controllers/SalesItems.mjs';
import { Database } from './database/sequelize.mjs';
import * as yup from 'yup';
const updateSaleDto = yup.object().shape({
  fulfillments: yup.array().of(
    yup.object().shape({
      order_id: yup.string().required(),
      tracking_company: yup.string().required(),
      tracking_numbers: yup.string().required(),
      tracking_url: yup.string().required(),
    }),
  ),
});

const extractQueryParameters = (query) => {
  if (!query)
    return {
      page: 0,
      limit: 10,
      product_id: null,
      order_id: null,
      updated_at_max: null,
      updated_at_min: null,
    };

  const {
    page = 0,
    limit = 10,
    product_id = null,
    order_id = null,
    updated_at_max = null,
    updated_at_min = null,
  } = query;

  return {
    page,
    limit,
    product_id,
    order_id,
    updated_at_max,
    updated_at_min,
  };
};

const getProducts = async (parameters, id_user) => {
  const { limit, page, product_id, updated_at_max, updated_at_min } =
    extractQueryParameters(parameters);
  const resp = await getProductsController({
    id_user,
    query: {
      page,
      limit,
      product_id,
      updated_at_min,
      updated_at_max,
    },
  });
  return resp;
};

const getSales = async (parameters, id_user) => {
  const { limit, page, order_id, updated_at_max, updated_at_min } =
    extractQueryParameters(parameters);
  const resp = await getSalesController({
    id_user,
    query: {
      page,
      limit,
      order_id,
      updated_at_min,
      updated_at_max,
    },
  });
  return resp;
};

/**
 *
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @returns
 */
export const handler = async (event) => {
  console.log(event);
  let statusCode = 500;
  let body = null;
  let id_user = null;
  let headers = {
    'Content-Type': 'application/json',
  };
  try {
    let database = null;
    const {
      MYSQL_DATABASE,
      MYSQL_HOST,
      MYSQL_PASSWORD,
      MYSQL_USERNAME,
      MYSQL_PORT = 3306,
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
    if (!event.headers.authorization)
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized!' }),
        headers,
      };
    const token = event.headers.authorization.split(' ')[1];
    if (!token)
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized!' }),
        headers,
      };
    const plugin = await findPlugins({
      settings: {
        '"api_key"': token,
      },
    });
    if (!plugin)
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized!' }),
        headers,
      };
    id_user = plugin.id_user;
    switch (event.routeKey) {
      case 'GET /products':
        body = await getProducts(event.queryStringParameters, id_user);
        statusCode = 200;
        break;
      case 'GET /sales':
        body = await getSales(event.queryStringParameters, id_user);
        statusCode = 200;
        break;
      case 'PUT /sales':
        if (!event.body) {
          statusCode = 400;
          body = {
            message: 'Invalid parameters',
          };
          return;
        }
        const validatedBody = await updateSaleDto.validate(
          JSON.parse(event.body),
        );
        body = await updateSaleController({
          ...validatedBody,
          id_user,
        });
        statusCode = 200;
        break;
    }
    await database.closeConnection();
  } catch (error) {
    console.log(error);
  }

  const response = {
    statusCode,
    body: JSON.stringify(body),
    headers,
  };
  return response;
};

// await handler({
//   routeKey: 'GET /products',
//   // queryStringParameters: {
//   //   product_id: 'b4-0000000093',
//   // },
//   headers: {
//     authorization: 'Bearer bd8ea646-2d6b-46e4-ba56-281eb74ac68b',
//   },
// });

// await handler({
//   routeKey: 'GET /sales',
//   // queryStringParameters: {
//   //   product_id: 'b4-0000000093',
//   // },
//   headers: {
//     authorization: 'Bearer bd8ea646-2d6b-46e4-ba56-281eb74ac68b',
//   },
// });
// await handler({
//   routeKey: 'PUT /sales',
//   body: JSON.stringify({
//     fulfillments: [
//       {
//         order_id: '',
//         tracking_numbers: '',
//         tracking_url: '',
//         tracking_company: '',
//       },
//     ],
//   }),
//   headers: {
//     authorization: 'Bearer ',
//   },
// });

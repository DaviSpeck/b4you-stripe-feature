import { Database } from './database/sequelize.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import { Users } from './database/models/Users.mjs';
import { Op } from 'sequelize';
import { date as dateHelper } from './date.mjs';
import { capitalizeName } from './formatters.mjs';
import SalesAdapter from './utils/salesMetrics.mjs';

const headers = {
  'Content-Type': 'application/json',
};

const extractQueryParameters = (query) => {
  if (!query.start_date || !query.end_date || !query.end_date)
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'Missing parameters! Must be provide start_date, end_date and email',
      }),
      headers,
      error: true,
    };

  const { email = null, start_date = null, end_date = null } = query;

  return {
    email,
    start_date,
    end_date,
  };
};

const findSales = async (id_user, start_date, end_date) => {
  const where = {
    [Op.or]: {
      paid_at: {
        [Op.between]: [
          dateHelper(start_date).startOf('day').add(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          dateHelper(end_date).endOf('day').add(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        ],
      },
      created_at: {
        [Op.between]: [
          dateHelper(start_date).startOf('day').add(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
          dateHelper(end_date).endOf('day').add(3, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        ],
      },
    },
    id_status: 2,
  };
  const salesItems = await Sales_items.findAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    attributes: ['price_product', 'id_status', 'paid_at'],
    include: [
      {
        association: 'commissions',
        where: { id_user },
        attributes: ['amount', 'id_role'],
      },
    ],
  });
  return salesItems.map((s) => s.toJSON());
};

const getSales = async (params) => {
  const returnData = {};
  const data = extractQueryParameters(params);
  if (data.error) return data;
  if (dateHelper(data.end_date).diff(data.start_date, 'd') > 90) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'The difference between the two dates is greater than 90 days.',
      }),
      headers,
    };
  }
  const user = await Users.findOne({
    where: { email: data.email },
    attributes: ['id', 'email', 'full_name'],
  });

  if (!user)
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'User email not found',
      }),
      headers,
    };
  returnData.user = {
    email: user.email,
    full_name: capitalizeName(user.full_name),
  };
  returnData.query = {
    data,
  };
  const sales = await findSales(user.id, data.start_date, data.end_date);
  returnData.data = new SalesAdapter(sales).adapt();
  return {
    statusCode: 200,
    body: JSON.stringify(returnData),
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
    const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT, TOKEN_PASS } =
      process.env;
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
    if (token !== TOKEN_PASS)
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized!' }),
        headers,
      };

    switch (event.routeKey) {
      case 'GET /':
        response = await getSales(event.queryStringParameters);
        break;
    }
  } catch (error) {
    console.log(error);
  } finally {
    await database.closeConnection();
    return response;
  }
};

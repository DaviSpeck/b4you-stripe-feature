import { Op, col, fn, where } from 'sequelize';
import { Blacklist } from './database/models/Blacklist.mjs';
import { Sales_blacklist } from './database/models/Sales_blacklist.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';
import { Database } from './database/sequelize.mjs';
import { date as DateHelper } from './date.mjs';
import { findSaleBlackStatusByKey } from './status/blackStatus.mjs';

const users = [1491];
const ID_USER_ATTRACIONE = 158777;
const AMOUNT_EXCEDED = 800;
const EMAIL_TYPE = 4;
const AUTOMATIC_TYPE = 7;
const STATUS_PAID = 2;
const REASON_NIGHT_SALE = 3;
const REASON_EXCEDED_AMOUNT = 4;
const REASON_ATTRACIONE = 5;
const REASON_NOTAVEL = 6;
const REASON_DIGITAL_PRODUCT = 7;
const REASON_BRAND_ELO = 8;

export const rule01 = async (salesItems) => {
  try {
    console.log('(INICIALIZANDO) - REGRA 01: compras com dados na blacklist');
    for await (const saleItem of salesItems) {
      const { address, document_number, email, whatsapp, params } = saleItem.sale;

      const searchValues = [
        params?.ip,
        document_number,
        email,
        whatsapp,
        JSON.stringify(address),
      ].filter(Boolean);

      let isInBlacklist = false;

      if (searchValues.length > 0) {
        isInBlacklist = await Blacklist.findOne({
          where: {
            [Op.or]: searchValues.map((value) => ({
              data: value,
            })),
            active: true,
          },
        });
      }

      if (isInBlacklist) {
        console.log('(REGRA 01) Encontrado na blacklist:', saleItem.toJSON());
        await Sales_blacklist.upsert(
          {
            id_blacklist: isInBlacklist.id,
            id_sale: saleItem.sale.id,
            id_status: findSaleBlackStatusByKey('pending').id,
          },
          {
            updateOnDuplicate: ['id_blacklist', 'id_sale', 'id_status'],
          }
        );
      }
    }
    console.log('(FINALIZADO) - REGRA 01: compras com dados na blacklist');
  } catch (error) {
    console.log('REGRA 01 error: ', error);
  }
};

export const rule02 = async (database) => {
  try {
    console.log('(INICIALIZANDO) - REGRA 02: vendas já reembolsadas/chargeback');
    const results = await database.sequelize.query(
      `
  SELECT DISTINCT
    sb.id,
    sb.id_status as 'status_sb',
    si.id_status as 'status_sale_item'
  FROM
    sales_blacklist sb
  JOIN sales_items si ON si.id_sale = sb.id_sale
  WHERE
    sb.id_status = 1
    AND (si.id_status = 4 or si.id_status = 6)
  ORDER BY sb.id
`,
      {
        type: database.sequelize.QueryTypes.SELECT,
      }
    );
    console.log('count', results.length);
    for await (const r of results) {
      console.log('updating to refunded sale', r.id);
      await Sales_blacklist.update({ id_status: 2 }, { where: { id: r.id } });
    }
    console.log('(FINALIZADO) - REGRA 02: vendas já reembolsadas/chargeback');
  } catch (error) {
    console.log('REGRA 02 error: ', error);
  }
};

export const rule03 = async (salesItems) => {
  try {
    console.log('(INICIALIZANDO) - REGRA 03: Compras acima de R$ 800,00');
    const resultado = Object.values(
      salesItems.reduce((acc, item) => {
        const idSale = item.id_sale;

        if (!acc[idSale]) {
          acc[idSale] = {
            id_sale: idSale,
            total_price: 0,
            email: item.sale?.email || null,
          };
        }

        acc[idSale].total_price += Number(item.price);
        return acc;
      }, {})
    );
    for await (const result of resultado) {
      if (result.total_price > AMOUNT_EXCEDED) {
        console.log('(REGRA03) Encontrado venda, inserindo na blacklist', result);
        const [bl] = await Blacklist.findOrCreate({
          where: {
            data: result.email,
          },
          defaults: {
            data: result.email,
            id_type: EMAIL_TYPE,
            active: false,
            id_sale: result.id_sale,
            id_reason: REASON_EXCEDED_AMOUNT,
          },
        });
        console.log('bl', bl);
        await Sales_blacklist.upsert(
          {
            id_blacklist: bl.id,
            id_sale: result.id_sale,
            id_status: findSaleBlackStatusByKey('pending').id,
          },
          {
            updateOnDuplicate: ['id_sale', 'id_status'],
          }
        );
      }
    }
    console.log('(FINALIZADO) - REGRA 03: Compras acima de R$ 800,00');
  } catch (error) {
    console.log('REGRA 03 error: ', error);
  }
};

export const rule04 = async () => {
  try {
    console.log('(INICIALIZANDO) - REGRA 04: vendas das 22hrs as 07hrs, produtores especificos');
    const salesItemsProducers = await Sales_items.findAll({
      limit: 1000,
      where: {
        payment_method: 'card',
        id_status: STATUS_PAID,
        paid_at: {
          [Op.gte]: DateHelper().subtract(24, 'h'),
        },
        [Op.or]: [
          where(fn('TIME', col('paid_at')), {
            [Op.between]: ['01:00:00', '09:59:59'],
          }),
        ],
      },
      attributes: [
        'id_sale',
        [fn('SUM', col('sales_items.price')), 'total_price'],
        [fn('COUNT', col('sales_items.id')), 'quantidade_itens'],
      ],
      include: [
        {
          association: 'sale',
          attributes: ['document_number', 'email', 'whatsapp', 'address', 'params', 'id'],
          where: {
            id_user: {
              [Op.in]: users,
            },
          },
        },
      ],
      group: ['sales_items.id_sale', 'sale.id'],
    });
    for await (const result of salesItemsProducers) {
      const data = await Sales_blacklist.findOne({
        where: {
          id_sale: result.id_sale,
        },
      });
      if (!data) {
        console.log('(REGRA 04) Encontrado venda, inserindo na blacklist', JSON.stringify(result));
        const [bl] = await Blacklist.findOrCreate({
          where: {
            data: result.sale.email,
            id_type: EMAIL_TYPE,
          },
          defaults: {
            data: result.sale.email,
            id_type: EMAIL_TYPE,
            active: false,
            id_sale: result.id_sale,
            id_reason: REASON_NIGHT_SALE,
          },
        });
        await Sales_blacklist.upsert(
          {
            id_blacklist: bl.id,
            id_sale: result.id_sale,
            id_status: findSaleBlackStatusByKey('pending').id,
          },
          {
            updateOnDuplicate: ['id_sale', 'id_status'],
          }
        );
      }
    }
    console.log('(FINALIZADO) - REGRA 04: vendas das 22hrs as 07hrs, produtores especificos');
  } catch (error) {
    console.log('REGRA 04 error: ', error);
  }
};

export const rule05 = async (salesItems) => {
  console.log('(INICIALIZANDO) - REGRA 05: vendas attracione');
  try {
    const filtered = salesItems.filter((item) => item.sale.id_user === ID_USER_ATTRACIONE);
    const filteredSales = filtered.reduce((acc, item) => {
      const idSale = item.id_sale;
      if (!acc[idSale]) {
        acc[idSale] = [];
      }
      acc[idSale].push(item);
      return acc;
    }, {});
    const finalResult = Object.entries(filteredSales).map(([id_sale, itens]) => ({
      id_sale: Number(id_sale),
      itens,
    }));
    for await (const result of finalResult) {
      console.log('(REGRA 05) Encontrado venda, inserindo na blacklist', JSON.stringify(result));
      const [bl] = await Blacklist.findOrCreate({
        where: {
          data: result.itens[0].sale.email,
          id_type: AUTOMATIC_TYPE,
        },
        defaults: {
          data: result.itens[0].sale.email,
          id_type: AUTOMATIC_TYPE,
          active: false,
          id_sale: result.id_sale,
          id_reason:
            result.itens[0].sale.id_user === ID_USER_ATTRACIONE
              ? REASON_ATTRACIONE
              : REASON_NOTAVEL,
        },
      });
      await Sales_blacklist.upsert(
        {
          id_blacklist: bl.id,
          id_sale: result.id_sale,
          id_status: findSaleBlackStatusByKey('pending').id,
        },
        {
          updateOnDuplicate: ['id_sale', 'id_status'],
        }
      );
    }
  } catch (error) {
    console.log('REGRA 05 error: ', error);
  }
  console.log('(FINALIZADO) - REGRA 05: vendas attracione/notavel');
};

export const rule06 = async (salesItems) => {
  console.log('(INICIALIZANDO) - REGRA 06: vendas produtos digitais');
  try {
    const infoProductsSales = salesItems.filter(
      (item) => item.product?.content_delivery !== 'physical'
    );
    for await (const result of infoProductsSales) {
      console.log('(REGRA 06) Encontrado venda, inserindo na blacklist', JSON.stringify(result));
      const [bl] = await Blacklist.findOrCreate({
        where: {
          data: result.sale.email,
          id_type: AUTOMATIC_TYPE,
        },
        defaults: {
          data: result.sale.email,
          id_type: AUTOMATIC_TYPE,
          active: false,
          id_sale: result.id_sale,
          id_reason: REASON_DIGITAL_PRODUCT,
        },
      });
      await Sales_blacklist.upsert(
        {
          id_blacklist: bl.id,
          id_sale: result.id_sale,
          id_status: findSaleBlackStatusByKey('pending').id,
        },
        {
          updateOnDuplicate: ['id_sale', 'id_status'],
        }
      );
    }
  } catch (error) {
    console.log('REGRA 06 error: ', error);
  }
  console.log('(FINALIZADO) - REGRA 06: vendas produtos digitais');
};

export const rule07 = async (salesItems) => {
  console.log('(INICIALIZANDO) - REGRA 07: vendas com bandeira do cartão elo');

  try {
    const onlyEloSales = salesItems.filter((item) =>
      item.charges.some((charge) => charge.card_brand === 'elo')
    );
    for await (const result of onlyEloSales) {
      console.log('(REGRA 07) Encontrado venda, inserindo na blacklist', JSON.stringify(result));
      const [bl] = await Blacklist.findOrCreate({
        where: {
          data: result.sale.email,
          id_type: AUTOMATIC_TYPE,
        },
        defaults: {
          data: result.sale.email,
          id_type: AUTOMATIC_TYPE,
          active: false,
          id_sale: result.id_sale,
          id_reason: REASON_BRAND_ELO,
        },
      });
      await Sales_blacklist.upsert(
        {
          id_blacklist: bl.id,
          id_sale: result.id_sale,
          id_status: findSaleBlackStatusByKey('pending').id,
        },
        {
          updateOnDuplicate: ['id_sale', 'id_status'],
        }
      );
    }
  } catch (error) {
    console.log('REGRA 07 error: ', error);
  }
  console.log('(FINALIZADO) - REGRA 07: vendas com bandeira do cartão elo');
};

export const handler = async () => {
  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

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
  console.log('INICIANDO!!!');
  const salesItems = await Sales_items.findAll({
    limit: 1000,
    where: {
      id_status: STATUS_PAID,
      paid_at: { [Op.gte]: DateHelper().subtract(30, 'minutes') },
      payment_method: 'card',
    },
    attributes: ['id_sale', 'id', 'paid_at', 'price'],
    include: [
      {
        association: 'sale',
        attributes: ['document_number', 'email', 'whatsapp', 'address', 'params', 'id', 'id_user'],
      },
      {
        association: 'product',
        paranoid: false,
        attributes: ['content_delivery'],
      },
      {
        association: 'charges',
        attributes: ['card_brand'],
      },
    ],
  });
  console.log('Tamanho sales items', salesItems.length);
  //  REGRA 01: compras com dados na blacklist
  await rule01(salesItems);

  // REGRA 02: atualizando vendas que foram para a blacklist, não foram analisadas ainda, e ja estão com status de reembolsadas ou chargeback
  await rule02(database);

  // REGRA 03: compras com valores acima de R$ 800,00, somando PP + OB + UPSELL
  await rule03(salesItems);

  //  REGRA 04: vendas das 22hrs as 07hrs, produtores especificos
  await rule04();

  //  REGRA 05: vendas attracione
  await rule05(salesItems);

  //  REGRA 06: vendas produtos digitais
  await rule06(salesItems);

  // REGRA 07: vendas de bandeira ELO
  await rule07(salesItems);

  await database.closeConnection();
  console.log('FINALIZADO!!!');
};

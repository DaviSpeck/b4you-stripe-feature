import { Database } from './database/sequelize.mjs';
import { BlingShippingV3 } from './useCases/BlingShippingV3.mjs';
import { Sales } from './database/models/Sales.mjs';
import { Sales_items } from './database/models/Sales_items.mjs';

const PRODUCTS_FELIPE_MORENO = [
  { id: 23377, name: 'Lipo de Papada Visara' },
  { id: 13754, name: 'Visara Antiacne' },
  { id: 13724, name: 'Alongador de Cílios Visara' },
  { id: 109396, name: 'Sérum Visara' },
  { id: 11386, name: 'Clareador Nutralfit' },
  { id: 26533, name: "Produtos Visara" },
  { id: 14789, name: "Loja Visara Cosméticos" },
  { id: 26774, name: "Produtos NutralFit" },
  { id: 13676, name: "Durasil" },
  { id: 21593, name: "Durazul" },
  { id: 20426, name: "Femilys Beauty" }
];

const BUSINESS_RULES = {
  DEFAULT: { startHour: 9, endHour: 18 },
  LOOGNE: { startHour: 7, endHour: 21, userId: 1491 },
  NOTAVEL: { startHour: 6, endHour: 23, userId: 299680 },
  FELIPEMORENO: { startHour: 7, endHour: 21, userId: 109396 },
  ADEUS: { startHour: 6, endHour: 23, userId: 163166 },
  WIGO: { startHour: 6, endHour: 23, userId: 53581 },
  KAULI: { startHour: 6, endHour: 23, userId: 456269 },
  GARRIDO: { startHour: 0, endHour: 0, userId: 94277 },
  SEJAZIVA: { startHour: 6, endHour: 23, userId: 123058 },
};

function getBrasiliaTime() {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

function isWithinBusinessHours({ startHour, endHour }) {
  const time = getBrasiliaTime();
  const day = time.getDay();
  const hour = time.getHours();

  console.log('Hora atual em Brasília:', time.toISOString());
  console.log('Day:', day, 'Hour:', hour);

  const isWeekday = day >= 0 && day <= 7;
  const isBusinessHour = hour >= startHour && hour < endHour;

  return isWeekday && isBusinessHour;
}

async function processShipping(saleId, isUpsell, rule, label, is_subscription, id_sale_item) {
  const isGarrido = label === 'GARRIDO';

  if (!isWithinBusinessHours(rule) && !is_subscription && !isGarrido) {
    console.log(`(${label}) Fora do horário comercial e não é assinatura. Execução ignorada.`);
    return;
  }

  console.log(
    `(${label}) Horário comercial ou é assinatura${isGarrido ? ' ou é GARRIDO (ignora horário)' : ''
    }, processando -> É assinatura? ${is_subscription}`
  );
  const response = await new BlingShippingV3(
    saleId,
    isUpsell,
    is_subscription,
    id_sale_item
  ).execute();
  console.log(response);
}

export const handler = async (event) => {
  console.log('Bling Shipping ->', event);

  const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME, MYSQL_PORT } = process.env;

  const database = await new Database({
    database: MYSQL_DATABASE,
    host: MYSQL_HOST,
    password: MYSQL_PASSWORD,
    username: MYSQL_USERNAME,
    port: MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    dialectOptions: { decimalNumbers: true },
  }).connect();

  let hasError = false;
  let messageId = null;

  try {
    const { Records } = event;
    const [message] = Records || [];

    if (!message?.body) {
      console.log('Mensagem inválida ou vazia');
      return;
    }

    messageId = message.messageId;
    const {
      sale_id,
      is_upsell = false,
      is_subscription = false,
      id_sale_item = [],
    } = JSON.parse(message.body);

    console.log('Sale_id ->', sale_id);

    const sale = await Sales.findOne({
      attributes: ['id', 'id_user'],
      where: { id: sale_id },
    });

    if (!sale) {
      console.log('Venda não encontrada');
      return;
    }

    if (sale.id_user === BUSINESS_RULES.LOOGNE.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.LOOGNE,
        'LOOGNE',
        is_subscription,
        id_sale_item
      );
    } else if (sale.id_user === BUSINESS_RULES.NOTAVEL.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.NOTAVEL,
        'NOTAVEL',
        is_subscription,
        id_sale_item
      );
    } else if (sale.id_user === BUSINESS_RULES.ADEUS.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.ADEUS,
        'ADEUS',
        is_subscription,
        id_sale_item
      );
    } else if (sale.id_user === BUSINESS_RULES.WIGO.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.WIGO,
        'WIGO',
        is_subscription,
        id_sale_item
      );
    } else if (sale.id_user === BUSINESS_RULES.KAULI.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.KAULI,
        'KAULI',
        is_subscription,
        id_sale_item
      );
    } else if (sale.id_user === BUSINESS_RULES.FELIPEMORENO.userId) {
      const saleItems = await Sales_items.findAll({
        raw: true,
        where: {
          id_sale: sale_id,
        },
        attributes: ['id_product'],
      });
      const hasAllowedProduct = saleItems.some((item) =>
        PRODUCTS_FELIPE_MORENO.some((p) => Number(p.id) === Number(item.id_product))
      );
      if (hasAllowedProduct) {
        console.log('(FELIPEMORENOPRO) PROCESSANDO, PRODUTO NA LISTA', saleItems);
        await processShipping(
          sale_id,
          is_upsell,
          BUSINESS_RULES.FELIPEMORENO,
          'FELIPEMORENO',
          is_subscription,
          id_sale_item
        );
      } else {
        console.log(
          '(FELIPEMORENOPRO) PRODUTO NÃO ESTÁ NA LISTA, CANCELANDO EXECUCAO E MARCANDO SALE',
          saleItems
        );
        await Sales.update(
          { id_order_bling: 999, tracking_code: 'não informado' },
          { where: { id: sale_id } }
        );
        return;
      }
    } else if (sale.id_user === BUSINESS_RULES.GARRIDO.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.GARRIDO,
        'GARRIDO',
        is_subscription,
        id_sale_item
      );
    } else if (sale.id_user === BUSINESS_RULES.SEJAZIVA.userId) {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.SEJAZIVA,
        'SEJAZIVA',
        is_subscription,
        id_sale_item
      );
    } else {
      await processShipping(
        sale_id,
        is_upsell,
        BUSINESS_RULES.DEFAULT,
        'NORMAL',
        is_subscription,
        id_sale_item
      );
    }
  } catch (error) {
    console.error('Erro no processamento:', error);
    hasError = true;
  } finally {
    await database.closeConnection();

    if (hasError && messageId) {
      const batchItemFailures = [
        {
          itemIdentifier: messageId,
        },
      ];
      console.log('batchItemFailure', batchItemFailures);
      return {
        batchItemFailures,
      };
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};

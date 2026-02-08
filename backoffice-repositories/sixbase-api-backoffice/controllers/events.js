const ApiError = require('../error/ApiError');
const Database = require('../database/models/index');
const {
  serializeEventList,
  serializeSingleProduct,
} = require('../presentation/events/SerializeEvents');

const listEventsByProduct = async ({
  input,
  product_uuid,
  start_date,
  end_date,
}) => {

  const [events] = await Database.sequelize.query(
    `
    WITH processed_events AS (
    SELECT
      MIN(si.id_status) AS id_status,
      e.event_type,
      p.uuid as product_uuid,
      e.name,
      e.session_id
    FROM
      events e
    LEFT JOIN sales_items si ON
      si.uuid = e.sale_item_id
    left join product_offer po on
      po.uuid = e.id_offer
    left join products p on
      p.id = po.id_product
    where
      true
      ${start_date ? `AND e.created_at >= $start_date` : ''}
      ${end_date ? `AND e.created_at <= CONCAT($end_date, ' 23:59:59')` : ''}
      ${input ? `AND p.name like CONCAT('%', $input ,'%')` : ''}
    GROUP BY
      e.session_id,
      e.event_type,
      p.uuid,
      e.name
            )
            SELECT
      p.name as product_name,
      e.product_uuid,
      SUM(CASE WHEN event_type = 'page_load' AND e.name = 'checkout' THEN 1 ELSE 0 END) AS page_load_checkout,
      SUM(CASE WHEN event_type = 'button_click' AND e.name = 'checkout' THEN 1 ELSE 0 END) AS button_click_checkout,
      SUM(CASE WHEN event_type = 'sale_process' AND id_status = 2 AND e.name = 'checkout' THEN 1 ELSE 0 END) AS sales_paid,
      SUM(CASE WHEN event_type = 'sale_process' AND id_status <> 2 AND e.name = 'checkout' THEN 1 ELSE 0 END) AS sales_unpaid,
      SUM(CASE WHEN event_type = 'page_load' AND e.name = 'upsell' THEN 1 ELSE 0 END) AS page_load_upsell,
      SUM(CASE WHEN event_type = 'button_click' AND e.name = 'upsell' THEN 1 ELSE 0 END) AS button_click_upsell,
      SUM(CASE WHEN event_type = 'sale_process' AND id_status = 2 AND e.name = 'upsell' THEN 1 ELSE 0 END) AS sales_paid_upsell,
      SUM(CASE WHEN event_type = 'sale_process' AND id_status <> 2 AND e.name = 'upsell' THEN 1 ELSE 0 END) AS sales_unpaid_upsell
    FROM
      processed_events e
    left join products p on
      p.uuid = e.product_uuid
      where  
        true 
        ${product_uuid ? `AND p.uuid = $product_uuid` : ''}
    GROUP BY p.uuid
      ;      
`,
    {
      bind: {
        start_date,
        end_date,
        input,
        product_uuid,
      },
    },
  );

  return events;
};

module.exports.findProducts = async (req, res, next) => {
  const {
    query: { input = null, start_date, end_date },
  } = req;
  try {
    const events = await listEventsByProduct({
      input,
      start_date,
      end_date,
    });

    const data = serializeEventList(events);

    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        rows: data.events,
        stats: data.stats,
      },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.productEvents = async (req, res, next) => {
  const { productUuid } = req.params;

  const {
    query: { start_date, end_date },
  } = req;
  try {
    const events = await listEventsByProduct({
      product_uuid: productUuid,
      start_date,
      end_date,
    });

    const serializedEvents = serializeSingleProduct(events);
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        events: serializedEvents,
      },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
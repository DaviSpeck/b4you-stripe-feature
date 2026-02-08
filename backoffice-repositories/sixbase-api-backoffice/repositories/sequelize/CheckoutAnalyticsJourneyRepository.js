const { QueryTypes } = require('sequelize');
const Database = require('../../database/models/index');
const {
  NON_PROD_ENV_VALUES,
  isProductionEnvironment,
} = require('../../utils/analyticsEnvironment');

const paymentMethodExpression = `
  COALESCE(
    (
      SELECT e2.payment_method
      FROM checkout_events e2
      WHERE e2.session_id = e.session_id
        AND e2.event_name = 'checkout_submit_clicked'
        AND e2.payment_method IS NOT NULL
      ORDER BY e2.event_timestamp DESC
      LIMIT 1
    ),
    (
      SELECT e2.payment_method
      FROM checkout_events e2
      WHERE e2.session_id = e.session_id
        AND e2.event_name IN ('checkout_payment_success', 'checkout_payment_error')
        AND e2.payment_method IS NOT NULL
      ORDER BY e2.event_timestamp DESC
      LIMIT 1
    ),
    (
      SELECT e2.payment_method
      FROM checkout_events e2
      WHERE e2.session_id = e.session_id
        AND e2.event_name = 'checkout_payment_method_selected'
        AND e2.payment_method IS NOT NULL
      ORDER BY e2.event_timestamp DESC
      LIMIT 1
    )
  )
`;

const SUCCESS_EVENT_NAMES = [
  'checkout_conversion_success',
];

const successEventCondition = `e.event_name IN (:success_events)`;

const checkoutTypeExpression = `
  (
    SELECT e2.checkout_type
    FROM checkout_events e2
    WHERE e2.session_id = e.session_id
      AND e2.checkout_type IS NOT NULL
    ORDER BY e2.event_timestamp ASC
    LIMIT 1
  )
`;

const checkoutModeExpression = `
  (
    SELECT e2.checkout_mode
    FROM checkout_events e2
    WHERE e2.session_id = e.session_id
      AND e2.checkout_mode IS NOT NULL
    ORDER BY e2.event_timestamp ASC
    LIMIT 1
  )
`;

const buildBaseQueryParts = (filters, alias) => {
  if (filters.product_id && typeof filters.product_id !== 'string') {
    throw new Error('product_id must be UUID string');
  }

  if (filters.producer_id && typeof filters.producer_id !== 'string') {
    throw new Error('producer_id must be UUID string');
  }

  const replacements = {
    start_ms: filters.start_ms,
    end_ms: filters.end_ms,
  };
  const joins = [];
  const conditions = [`${alias}.event_timestamp BETWEEN :start_ms AND :end_ms`];

  if (filters.offer_id) {
    conditions.push(`${alias}.offer_id = :offer_id`);
    replacements.offer_id = filters.offer_id;
  }

  if (filters.product_id) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM checkout_events eo
        WHERE eo.session_id = ${alias}.session_id
          AND eo.offer_id IS NOT NULL
          AND eo.offer_id IN (
            SELECT po.uuid
            FROM product_offer po
            WHERE po.id_product = (
              SELECT p.id FROM products p WHERE p.uuid = :product_id
            )
          )
      )
    `);
    replacements.product_id = filters.product_id;
  }

  if (filters.producer_id) {
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM checkout_events eo
        WHERE eo.session_id = ${alias}.session_id
          AND eo.offer_id IS NOT NULL
          AND eo.offer_id IN (
            SELECT po.uuid
            FROM product_offer po
            JOIN products p ON p.id = po.id_product
            JOIN users u ON u.id = p.id_user
            WHERE u.uuid = :producer_id
          )
      )
    `);
    replacements.producer_id = filters.producer_id;
  }


  if (filters.checkout_type) {
    conditions.push(`${alias}.checkout_type = :checkout_type`);
    replacements.checkout_type = filters.checkout_type;
  }

  if (filters.checkout_mode) {
    conditions.push(`${alias}.checkout_mode = :checkout_mode`);
    replacements.checkout_mode = filters.checkout_mode;
  }

  if (filters.payment_method) {
    conditions.push(`${alias}.payment_method = :payment_method`);
    replacements.payment_method = filters.payment_method;
  }

  if (filters.execution_environment) {
    conditions.push(`${alias}.execution_environment = :execution_environment`);
    replacements.execution_environment = filters.execution_environment;
  }

  if (filters.root_domain) {
    conditions.push(
      `(${alias}.root_domain = :root_domain OR ${alias}.full_hostname = :root_domain)`,
    );
    replacements.root_domain = filters.root_domain;
  }

  if (isProductionEnvironment) {
    conditions.push(
      `(${alias}.execution_environment IS NULL OR ` +
      `${alias}.execution_environment NOT IN (:non_prod_env_values))`,
    );
    conditions.push(
      `(${alias}.checkout_mode IS NULL OR ` +
      `${alias}.checkout_mode NOT IN (:non_prod_env_values))`,
    );
    conditions.push(
      `(${alias}.full_hostname IS NULL OR ` +
      `${alias}.full_hostname NOT IN (:non_prod_env_values))`,
    );
    conditions.push(
      `(${alias}.root_domain IS NULL OR ` +
      `${alias}.root_domain NOT IN (:non_prod_env_values))`,
    );
    replacements.non_prod_env_values = NON_PROD_ENV_VALUES;
  }

  return { conditions, joins, replacements };
};

const buildSessionFilter = (filters, replacements) => {
  const hasSuccess =
    typeof filters.has_success === 'boolean'
      ? filters.has_success
      : null;

  const hasError =
    typeof filters.has_error === 'boolean'
      ? filters.has_error
      : null;

  if (hasSuccess === null && hasError === null) {
    return '';
  }

  const {
    conditions: subConditions,
    joins: subJoins,
    replacements: subReplacements,
  } = buildBaseQueryParts(filters, 'se');
  const conditions = [];
  Object.assign(replacements, subReplacements);
  const joinSql = subJoins.join(' ');
  const baseWhere = subConditions.join(' AND ');

  if (hasSuccess !== null) {
    const operator = hasSuccess ? 'EXISTS' : 'NOT EXISTS';

    conditions.push(
      `${operator} (
        SELECT 1
        FROM checkout_events se
        WHERE se.session_id = e.session_id
          AND se.event_timestamp BETWEEN :start_ms AND :end_ms
          AND se.event_name IN (:success_events)
      )`
    );

    replacements.success_events = SUCCESS_EVENT_NAMES;
  }

  if (hasError !== null) {
    const operator = hasError ? 'EXISTS' : 'NOT EXISTS';

    conditions.push(
      `${operator} (
        SELECT 1
        FROM checkout_events se
        WHERE se.session_id = e.session_id
          AND se.event_timestamp BETWEEN :start_ms AND :end_ms
          AND se.event_name IN (
            'checkout_identification_error',
            'checkout_address_error',
            'checkout_payment_data_error',
            'checkout_payment_error'
          )
      )`
    );
  }

  return conditions.join(' AND ');
};

const buildBaseFilters = (filters) => {
  const { conditions, joins, replacements } = buildBaseQueryParts(filters, 'e');
  const sessionFilter = buildSessionFilter(filters, replacements);

  if (sessionFilter) {
    conditions.push(sessionFilter);
  }

  return {
    joins: joins.join(' '),
    whereSql: `WHERE ${conditions.join(' AND ')}`,
    replacements,
  };
};

const normalizeStepEvents = (events = []) =>
  events.map((event) =>
    typeof event === 'string' ? { event_name: event } : event,
  );

const buildEventConditions = (events = [], prefix, replacements) => {
  const normalizedEvents = normalizeStepEvents(events);
  const conditions = normalizedEvents.map((event, index) => {
    const nameKey = `${prefix}_name_${index}`;
    replacements[nameKey] = event.event_name;

    if (event.step) {
      const stepKey = `${prefix}_step_${index}`;
      replacements[stepKey] = event.step;
      return `(e.event_name = :${nameKey} AND e.step = :${stepKey})`;
    }

    return `e.event_name = :${nameKey}`;
  });

  return conditions.length ? conditions.join(' OR ') : 'FALSE';
};

class CheckoutAnalyticsJourneyRepository {
  async fetchSummary(filters, { successEvents, errorEvents }) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const [row] = await Database.sequelize.query(
      `
        SELECT
          COUNT(DISTINCT e.session_id) AS total_sessions,
          COUNT(*) AS total_events,
          COUNT(
            DISTINCT CASE
              WHEN ${successEventCondition} THEN e.session_id
            END
          ) AS success_sessions,
          COUNT(
            DISTINCT CASE
              WHEN e.event_name = 'checkout_conversion_success'
                THEN e.session_id
            END
          ) AS conversion_success_sessions,
          COUNT(
            DISTINCT CASE
              WHEN e.event_name = 'checkout_payment_success' THEN e.session_id
            END
          ) AS payment_success_sessions,
          COUNT(
            DISTINCT CASE
              WHEN e.event_name IN (:error_events) THEN e.session_id
            END
          ) AS error_sessions
        FROM checkout_events e
        ${joins}
        ${whereSql}
      `,
      {
        replacements: {
          ...replacements,
          success_events: successEvents,
          error_events: errorEvents,
        },
        type: QueryTypes.SELECT,
      },
    );

    return row || {};
  }

  async fetchFunnel(filters, eventNames) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    return Database.sequelize.query(
      `
        SELECT
          e.event_name,
          COUNT(DISTINCT e.session_id) AS sessions
        FROM checkout_events e
        ${joins}
        ${whereSql}
          AND e.event_name IN (:event_names)
        GROUP BY e.event_name
      `,
      {
        replacements: {
          ...replacements,
          event_names: eventNames,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  async fetchSteps(filters, stepDefinitions) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const stepReplacements = { ...replacements };
    const selectParts = stepDefinitions.flatMap((definition) => {
      const startedCondition = buildEventConditions(
        definition.started,
        `${definition.step}_started`,
        stepReplacements,
      );
      const completedCondition = buildEventConditions(
        definition.completed,
        `${definition.step}_completed`,
        stepReplacements,
      );
      const errorCondition = buildEventConditions(
        definition.errors,
        `${definition.step}_errors`,
        stepReplacements,
      );

      return [
        `COUNT(DISTINCT CASE WHEN ${startedCondition} THEN e.session_id END) AS ${definition.step}_started`,
        `COUNT(DISTINCT CASE WHEN ${completedCondition} THEN e.session_id END) AS ${definition.step}_completed`,
        `COUNT(DISTINCT CASE WHEN ${errorCondition} THEN e.session_id END) AS ${definition.step}_errors`,
      ];
    });

    const [row] = await Database.sequelize.query(
      `
        SELECT
          ${selectParts.join(',\n')}
        FROM checkout_events e
        ${joins}
        ${whereSql}
      `,
      {
        replacements: stepReplacements,
        type: QueryTypes.SELECT,
      },
    );

    return row || {};
  }

  async fetchPaymentMethods(filters) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    return Database.sequelize.query(
      `
        SELECT
          session_payment.payment_method,
          COUNT(*) AS sessions,
          SUM(session_payment.has_success) AS success_sessions
        FROM (
          SELECT
            e.session_id,
            ${paymentMethodExpression} AS payment_method,
            MAX(
              CASE WHEN ${successEventCondition} THEN 1 ELSE 0 END
            ) AS has_success
          FROM checkout_events e
          ${joins}
          ${whereSql}
          GROUP BY e.session_id
        ) AS session_payment
        WHERE session_payment.payment_method IS NOT NULL
        GROUP BY session_payment.payment_method
      `,
      {
        replacements: {
          ...replacements,
          success_events: SUCCESS_EVENT_NAMES,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  async fetchDistribution(filters) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const [checkoutTypes, checkoutModes] = await Promise.all([
      Database.sequelize.query(
        `
          SELECT
            session_types.checkout_type,
            COUNT(*) AS sessions
          FROM (
            SELECT
              e.session_id,
              ${checkoutTypeExpression} AS checkout_type
            FROM checkout_events e
            ${joins}
            ${whereSql}
            GROUP BY e.session_id
          ) AS session_types
          WHERE session_types.checkout_type IS NOT NULL
          GROUP BY session_types.checkout_type
        `,
        {
          replacements,
          type: QueryTypes.SELECT,
        },
      ),
      Database.sequelize.query(
        `
          SELECT
            session_modes.checkout_mode,
            COUNT(*) AS sessions
          FROM (
            SELECT
              e.session_id,
              ${checkoutModeExpression} AS checkout_mode
            FROM checkout_events e
            ${joins}
            ${whereSql}
            GROUP BY e.session_id
          ) AS session_modes
          WHERE session_modes.checkout_mode IS NOT NULL
          GROUP BY session_modes.checkout_mode
        `,
        {
          replacements,
          type: QueryTypes.SELECT,
        },
      ),
    ]);

    return { checkoutTypes, checkoutModes };
  }

  async fetchBreakdowns(filters) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const [checkoutTypes, checkoutModes, paymentMethods] = await Promise.all([
      Database.sequelize.query(
        `
          SELECT
            session_types.checkout_type,
            COUNT(*) AS sessions,
            SUM(session_types.has_success) AS success_sessions
          FROM (
            SELECT
              e.session_id,
              ${checkoutTypeExpression} AS checkout_type,
              MAX(
                CASE WHEN ${successEventCondition} THEN 1 ELSE 0 END
              ) AS has_success
            FROM checkout_events e
            ${joins}
            ${whereSql}
            GROUP BY e.session_id
          ) AS session_types
          WHERE session_types.checkout_type IS NOT NULL
          GROUP BY session_types.checkout_type
        `,
        {
          replacements: {
            ...replacements,
            success_events: SUCCESS_EVENT_NAMES,
          },
          type: QueryTypes.SELECT,
        },
      ),
      Database.sequelize.query(
        `
          SELECT
            session_modes.checkout_mode,
            COUNT(*) AS sessions,
            SUM(session_modes.has_success) AS success_sessions
          FROM (
            SELECT
              e.session_id,
              ${checkoutModeExpression} AS checkout_mode,
              MAX(
                CASE WHEN ${successEventCondition} THEN 1 ELSE 0 END
              ) AS has_success
            FROM checkout_events e
            ${joins}
            ${whereSql}
            GROUP BY e.session_id
          ) AS session_modes
          WHERE session_modes.checkout_mode IS NOT NULL
          GROUP BY session_modes.checkout_mode
        `,
        {
          replacements: {
            ...replacements,
            success_events: SUCCESS_EVENT_NAMES,
          },
          type: QueryTypes.SELECT,
        },
      ),
      this.fetchPaymentMethods(filters),
    ]);

    return { checkoutTypes, checkoutModes, paymentMethods };
  }

  async fetchOfferAggregates(filters) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const items = await Database.sequelize.query(
      `
        SELECT
          e.offer_id,
          COUNT(DISTINCT e.session_id) AS sessions,
          COUNT(
            DISTINCT CASE
              WHEN ${successEventCondition} THEN e.session_id
            END
          ) AS success_sessions
        FROM checkout_events e
        ${joins}
        ${whereSql}
        GROUP BY e.offer_id
        ORDER BY sessions DESC
      `,
      {
        replacements: {
          ...replacements,
          success_events: SUCCESS_EVENT_NAMES,
        },
        type: QueryTypes.SELECT,
      },
    );

    return { items };
  }

  async fetchSessions(filters, { limit, offset }) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const [sessions, [{ total }]] = await Promise.all([
      Database.sequelize.query(
        `
          SELECT
            e.session_id,
            MAX(e.event_timestamp) AS last_event_timestamp
          FROM checkout_events e
          ${joins}
          ${whereSql}
          GROUP BY e.session_id
          ORDER BY last_event_timestamp DESC
          LIMIT :limit OFFSET :offset
        `,
        {
          replacements: {
            ...replacements,
            limit,
            offset,
          },
          type: QueryTypes.SELECT,
        },
      ),
      Database.sequelize.query(
        `
          SELECT
            COUNT(DISTINCT e.session_id) AS total
          FROM checkout_events e
          ${joins}
          ${whereSql}
        `,
        {
          replacements,
          type: QueryTypes.SELECT,
        },
      ),
    ]);

    return { sessions, total: Number(total || 0) };
  }

  async fetchSessionDetails(filters, sessionIds) {
    if (!sessionIds.length) {
      return [];
    }

    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    return Database.sequelize.query(
      `
        SELECT
          e.session_id,
          (
            SELECT e2.offer_id
            FROM checkout_events e2
            WHERE e2.session_id = e.session_id
              AND e2.offer_id IS NOT NULL
            ORDER BY e2.event_timestamp ASC
            LIMIT 1
          ) AS offer_id,
          ${checkoutTypeExpression} AS checkout_type,
          ${checkoutModeExpression} AS checkout_mode,
          ${paymentMethodExpression} AS payment_method
        FROM checkout_events e
        ${joins}
        ${whereSql}
          AND e.session_id IN (:session_ids)
        GROUP BY e.session_id
      `,
      {
        replacements: {
          ...replacements,
          session_ids: sessionIds,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  async fetchSessionEvents(filters, sessionIds) {
    if (!sessionIds.length) {
      return [];
    }

    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    return Database.sequelize.query(
      `
        SELECT
          e.session_id,
          e.event_name,
          e.event_description,
          e.event_timestamp
        FROM checkout_events e
        ${joins}
        ${whereSql}
          AND e.session_id IN (:session_ids)
        ORDER BY e.session_id, e.event_timestamp ASC
      `,
      {
        replacements: {
          ...replacements,
          session_ids: sessionIds,
        },
        type: QueryTypes.SELECT,
      },
    );
  }

  async fetchDomainAggregates(filters, { limit, offset }) {
    const { joins, whereSql, replacements } = buildBaseFilters(filters);

    const [items, [{ total }]] = await Promise.all([
      Database.sequelize.query(
        `
          SELECT
            COALESCE(e.full_hostname, 'unknown') AS full_hostname,
            COUNT(DISTINCT e.session_id) AS sessions,
            COUNT(
              DISTINCT CASE
                WHEN ${successEventCondition} THEN e.session_id
              END
            ) AS success_sessions
          FROM checkout_events e
          ${joins}
          ${whereSql}
          GROUP BY COALESCE(e.full_hostname, 'unknown')
          ORDER BY sessions DESC
          LIMIT :limit OFFSET :offset
        `,
        {
          replacements: {
            ...replacements,
            success_events: SUCCESS_EVENT_NAMES,
            limit,
            offset,
          },
          type: QueryTypes.SELECT,
        },
      ),
      Database.sequelize.query(
        `
          SELECT
            COUNT(DISTINCT COALESCE(e.full_hostname, 'unknown')) AS total
          FROM checkout_events e
          ${joins}
          ${whereSql}
        `,
        {
          replacements,
          type: QueryTypes.SELECT,
        },
      ),
    ]);

    return { items, total: Number(total || 0) };
  }
}

module.exports = CheckoutAnalyticsJourneyRepository;

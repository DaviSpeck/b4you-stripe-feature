module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'checkout_events',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        event_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        session_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        offer_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        product_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        producer_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        checkout_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        checkout_mode: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        step: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        payment_method: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        event_timestamp: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        execution_environment: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        full_hostname: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        root_domain: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        received_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        ip_address: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        user_agent: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',

        indexes: [
          // 🔹 Time-based queries (base de tudo)
          {
            name: 'idx_checkout_events_event_timestamp',
            fields: ['event_timestamp'],
          },

          // 🔹 Debug e análise por oferta
          {
            name: 'idx_checkout_events_offer_id',
            fields: ['offer_id'],
          },

          // 🔹 BI por produtor (ranking, métricas, séries temporais)
          {
            name: 'idx_checkout_events_producer_time',
            fields: ['producer_id', 'event_timestamp'],
          },

          // 🔹 BI por produto (cross-offer, funil por produto)
          {
            name: 'idx_checkout_events_product_time',
            fields: ['product_id', 'event_timestamp'],
          },

          // 🔹 Funis e contagem de eventos
          {
            name: 'idx_checkout_events_event_time',
            fields: ['event_name', 'event_timestamp'],
          },

          // 🔹 Análise por domínio (embedded vs transparent, parceiros)
          {
            name: 'idx_checkout_events_domain_time',
            fields: ['root_domain', 'event_timestamp'],
          },
        ],
      },
    ),

  down: async (queryInterface) =>
    queryInterface.dropTable('checkout_events'),
};
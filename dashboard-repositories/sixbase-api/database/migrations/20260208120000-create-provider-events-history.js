module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('provider_events_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      event_action: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      occurred_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sale_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('provider_events_history', ['provider', 'event_id'], {
      unique: true,
      name: 'provider_events_history_provider_event_id_uq',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('provider_events_history');
  },
};

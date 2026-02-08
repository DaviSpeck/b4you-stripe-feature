module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex(
        'checkout_events',
        ['session_id', 'event_timestamp'],
        {
          name: 'idx_checkout_events_session_time',
          transaction,
        },
      );

      await queryInterface.addIndex(
        'checkout_events',
        ['offer_id', 'event_timestamp'],
        {
          name: 'idx_checkout_events_offer_time',
          transaction,
        },
      );

      await queryInterface.addIndex(
        'checkout_events',
        ['execution_environment', 'event_timestamp'],
        {
          name: 'idx_checkout_events_environment_time',
          transaction,
        },
      );

      await queryInterface.addIndex(
        'checkout_events',
        ['checkout_mode', 'event_timestamp'],
        {
          name: 'idx_checkout_events_checkout_mode_time',
          transaction,
        },
      );

      await queryInterface.addIndex(
        'checkout_events',
        ['full_hostname', 'event_timestamp'],
        {
          name: 'idx_checkout_events_full_hostname_time',
          transaction,
        },
      );
    }),

  down: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex(
        'checkout_events',
        'idx_checkout_events_session_time',
        {
          transaction,
        },
      );

      await queryInterface.removeIndex(
        'checkout_events',
        'idx_checkout_events_offer_time',
        {
          transaction,
        },
      );

      await queryInterface.removeIndex(
        'checkout_events',
        'idx_checkout_events_environment_time',
        {
          transaction,
        },
      );

      await queryInterface.removeIndex(
        'checkout_events',
        'idx_checkout_events_checkout_mode_time',
        {
          transaction,
        },
      );

      await queryInterface.removeIndex(
        'checkout_events',
        'idx_checkout_events_full_hostname_time',
        {
          transaction,
        },
      );
    }),
};

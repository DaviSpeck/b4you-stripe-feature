module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('webhooks_iopay', 'recipient_id', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('webhooks_iopay', 'kyc_status', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('webhooks_iopay', 'type', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('webhooks_iopay', 'recipient_id'),
    ]);
    await Promise.all([
      queryInterface.removeColumn('webhooks_iopay', 'kyc_status'),
    ]);
    await Promise.all([queryInterface.removeColumn('webhooks_iopay', 'type')]);
  },
};

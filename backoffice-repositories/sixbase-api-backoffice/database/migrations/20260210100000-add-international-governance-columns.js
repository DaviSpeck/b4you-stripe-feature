module.exports = {
  up: async (queryInterface, Sequelize) => {
    const usersTable = await queryInterface.describeTable('users');

    if (!usersTable.international_status) {
      await queryInterface.addColumn('users', 'international_status', {
        type: Sequelize.ENUM('enabled', 'blocked'),
        allowNull: false,
        defaultValue: 'blocked',
      });
    }

    if (!usersTable.international_stripe_enabled) {
      await queryInterface.addColumn('users', 'international_stripe_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    if (!usersTable.international_rules) {
      await queryInterface.addColumn('users', 'international_rules', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      });
    }

    if (!usersTable.international_status_updated_at) {
      await queryInterface.addColumn('users', 'international_status_updated_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!usersTable.international_status_updated_by) {
      await queryInterface.addColumn('users', 'international_status_updated_by', {
        type: Sequelize.BIGINT,
        allowNull: true,
      });
    }

    const productsTable = await queryInterface.describeTable('products');

    if (!productsTable.operation_scope) {
      await queryInterface.addColumn('products', 'operation_scope', {
        type: Sequelize.ENUM('national', 'international'),
        allowNull: false,
        defaultValue: 'national',
      });
    }

    if (!productsTable.currency_code) {
      await queryInterface.addColumn('products', 'currency_code', {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'BRL',
      });
    }

    if (!productsTable.acquirer_key) {
      await queryInterface.addColumn('products', 'acquirer_key', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pagarme',
      });
    }

    if (!productsTable.conversion_context) {
      await queryInterface.addColumn('products', 'conversion_context', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const productsTable = await queryInterface.describeTable('products');
    if (productsTable.conversion_context) {
      await queryInterface.removeColumn('products', 'conversion_context');
    }
    if (productsTable.acquirer_key) {
      await queryInterface.removeColumn('products', 'acquirer_key');
    }
    if (productsTable.currency_code) {
      await queryInterface.removeColumn('products', 'currency_code');
    }
    if (productsTable.operation_scope) {
      await queryInterface.removeColumn('products', 'operation_scope');
    }

    const usersTable = await queryInterface.describeTable('users');
    if (usersTable.international_status_updated_by) {
      await queryInterface.removeColumn('users', 'international_status_updated_by');
    }
    if (usersTable.international_status_updated_at) {
      await queryInterface.removeColumn('users', 'international_status_updated_at');
    }
    if (usersTable.international_rules) {
      await queryInterface.removeColumn('users', 'international_rules');
    }
    if (usersTable.international_stripe_enabled) {
      await queryInterface.removeColumn('users', 'international_stripe_enabled');
    }
    if (usersTable.international_status) {
      await queryInterface.removeColumn('users', 'international_status');
    }
  },
};

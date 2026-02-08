'use strict';

async function addIndexIfNotExists(queryInterface, tableName, indexName, fields, options = {}) {
  const indexExists = await queryInterface.sequelize.query(
    `
      SHOW INDEX
      FROM ${tableName}
      WHERE Key_name = :indexName;
    `,
    {
      type: queryInterface.sequelize.QueryTypes.SELECT,
      replacements: { indexName },
    }
  );

  if (indexExists.length === 0) {
    return queryInterface.addIndex(tableName, fields, { name: indexName, ...options });
  }

  console.log(`Index "${indexName}" já existe — ignorando criação.`);
  return Promise.resolve();
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await addIndexIfNotExists(
      queryInterface,
      'users',
      'idx_users_status_contact',
      ['id_manager_status_contact'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'users',
      'idx_users_next_contact_date',
      ['next_contact_date'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'users',
      'idx_users_manager_status',
      ['id_manager', 'id_manager_status_contact'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'commissions',
      'idx_commissions_user_date_role_amount',
      ['id_user', 'created_at', 'id_role', 'amount'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'sales_items',
      'idx_sales_items_product_status_sale',
      ['id_product', 'id_status', 'id_sale'],
      { concurrently: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'idx_users_status_contact');
    await queryInterface.removeIndex('users', 'idx_users_next_contact_date');
    await queryInterface.removeIndex('users', 'idx_users_manager_status');
    await queryInterface.removeIndex(
      'commissions',
      'idx_commissions_user_date_role_amount'
    );
    await queryInterface.removeIndex(
      'sales_items',
      'idx_sales_items_product_status_sale'
    );
  },
};
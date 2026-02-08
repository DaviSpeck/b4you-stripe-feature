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
      'commissions',
      'idx_commissions_created_at_id_role',
      ['created_at', 'id_role'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'commissions',
      'idx_commissions_user_role_date',
      ['id_user', 'id_role', 'created_at'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'commissions',
      'idx_commissions_sale_item_role',
      ['id_sale_item', 'id_role'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'sales_items',
      'idx_sales_items_status_sale',
      ['id_status', 'id_sale'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'sales_items',
      'idx_sales_items_product_status',
      ['id_product', 'id_status'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'users',
      'idx_users_manager_created',
      ['id_manager', 'created_at'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'users',
      'idx_users_created_at',
      ['created_at'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'sales',
      'idx_sales_user_created',
      ['id_user', 'created_at'],
      { concurrently: true }
    );

    await addIndexIfNotExists(
      queryInterface,
      'products',
      'idx_products_user',
      ['id_user'],
      { concurrently: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('commissions', 'idx_commissions_created_at_id_role');
    await queryInterface.removeIndex('commissions', 'idx_commissions_user_role_date');
    await queryInterface.removeIndex('commissions', 'idx_commissions_sale_item_role');
    await queryInterface.removeIndex('sales_items', 'idx_sales_items_status_sale');
    await queryInterface.removeIndex('sales_items', 'idx_sales_items_product_status');
    await queryInterface.removeIndex('users', 'idx_users_manager_created');
    await queryInterface.removeIndex('users', 'idx_users_created_at');
    await queryInterface.removeIndex('sales', 'idx_sales_user_created');
    await queryInterface.removeIndex('products', 'idx_products_user');
  },
};
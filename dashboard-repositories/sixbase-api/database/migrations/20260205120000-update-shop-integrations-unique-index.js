/**
 * Migration: Update shop_integrations unique index
 *
 * Problem: The unique index on shop_domain prevents users from recreating
 * a shop with the same domain after soft-deleting it.
 *
 * Solution: Remove the absolute unique index and rely on application-level
 * validation that only checks active (non-deleted) records.
 */
module.exports = {
  up: async (queryInterface) => {
    // Remove the absolute unique index on shop_domain
    await queryInterface.removeIndex(
      'shop_integrations',
      'uniq_shop_integrations_domain',
    );

    // Add a non-unique index for query performance
    await queryInterface.addIndex('shop_integrations', ['shop_domain'], {
      name: 'idx_shop_integrations_domain',
    });
  },

  down: async (queryInterface) => {
    // Remove the non-unique index
    await queryInterface.removeIndex(
      'shop_integrations',
      'idx_shop_integrations_domain',
    );

    // Restore the unique index (note: this may fail if duplicates exist)
    await queryInterface.addIndex('shop_integrations', ['shop_domain'], {
      unique: true,
      name: 'uniq_shop_integrations_domain',
    });
  },
};

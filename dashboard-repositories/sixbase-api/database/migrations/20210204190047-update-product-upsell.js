'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('products', 'id_upsale', 'id_upsell'),
      queryInterface.renameColumn('products', 'price_upsale', 'price_upsell'),
      queryInterface.renameColumn(
        'products',
        'label_accept_upsale',
        'label_accept_upsell'
      ),
      queryInterface.renameColumn(
        'products',
        'label_reject_upsale',
        'label_reject_upsell'
      ),
      queryInterface.renameColumn(
        'products',
        'hex_button_upsale',
        'hex_button_upsell'
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // DO NOTHING
  },
};

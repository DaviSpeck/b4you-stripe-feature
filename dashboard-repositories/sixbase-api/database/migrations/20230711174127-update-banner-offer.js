module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'banner_image', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_offer', 'banner_image_key', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_offer', 'banner_image_secondary', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_offer', 'banner_image_secondary_key', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_offer', 'banner_image_mobile', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_offer', 'banner_image_mobile_key', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn(
        'product_offer',
        'banner_image_mobile_secondary',
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn(
        'product_offer',
        'banner_image_mobile_secondary_key',
        {
          type: Sequelize.STRING,
        },
      ),
      queryInterface.addColumn('product_offer', 'sidebar_image', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('product_offer', 'sidebar_image_key', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'banner_image'),
      queryInterface.removeColumn('product_offer', 'banner_image_key'),
      queryInterface.removeColumn('product_offer', 'banner_image_secondary'),
      queryInterface.removeColumn(
        'product_offer',
        'banner_image_secondary_key',
      ),
      queryInterface.removeColumn('product_offer', 'banner_image_mobile'),
      queryInterface.removeColumn('product_offer', 'banner_image_mobile_key'),
      queryInterface.removeColumn(
        'product_offer',
        'banner_image_mobile_secondary',
      ),
      queryInterface.removeColumn(
        'product_offer',
        'banner_image_mobile_secondary_key',
      ),
      queryInterface.removeColumn('product_offer', 'sidebar_image'),
      queryInterface.removeColumn('product_offer', 'sidebar_image_key'),
    ]);
  },
};

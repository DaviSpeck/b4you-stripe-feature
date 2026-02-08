/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await Promise.all([
        queryInterface.addColumn(
          'products',
          'list_on_market',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          { transaction: t },
        ),
      ]);
      const [products] = await queryInterface.sequelize.query(
        'SELECT list_on_market, id_product FROM product_affiliate_settings',
        { transaction: t },
      );
      for await (const { list_on_market, id_product } of products) {
        await queryInterface.sequelize.query(
          `UPDATE products set list_on_market = ${list_on_market} WHERE id = '${id_product}'`,
          { transaction: t },
        );
      }
      await Promise.all([
        queryInterface.removeColumn(
          'product_affiliate_settings',
          'list_on_market',
          { transaction: t },
        ),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      const [products] = await queryInterface.sequelize.query(
        'SELECT list_on_market, id FROM products',
        { transaction: t },
      );
      await Promise.all([
        queryInterface.addColumn(
          'product_affiliate_settings',
          'list_on_market',
          {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          { transaction: t },
        ),
      ]);
      for await (const { list_on_market, id } of products) {
        await queryInterface.sequelize.query(
          `UPDATE product_affiliate_settings set list_on_market = ${list_on_market} WHERE id_product = '${id}'`,
          { transaction: t },
        );
      }
      await Promise.all([
        queryInterface.removeColumn('products', 'list_on_market', {
          transaction: t,
        }),
      ]);
    });
  },
};

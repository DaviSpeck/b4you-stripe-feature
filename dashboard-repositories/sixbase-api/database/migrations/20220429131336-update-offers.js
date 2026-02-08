module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.addColumn(
          'product_offer',
          'discount_pix',
          { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'product_offer',
          'discount_billet',
          { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'product_offer',
          'discount_card',
          { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
          { transaction: t },
        ),
      ]),
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.removeColumn('product_offer', 'discount_pix', {
          transaction: t,
        }),
        queryInterface.removeColumn('product_offer', 'discount_billet', {
          transaction: t,
        }),
        queryInterface.removeColumn('product_offer', 'discount_card', {
          transaction: t,
        }),
      ]),
    );
  },
};

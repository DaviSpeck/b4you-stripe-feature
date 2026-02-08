module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.addColumn(
          'transactions',
          'discount_percentage',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0 },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'transactions',
          'discount_amount',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0 },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'transactions',
          'original_price',
          { type: Sequelize.DECIMAL(14, 2), defaultValue: 0 },
          { transaction: t },
        ),
      ]),
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.removeColumn('transactions', 'discount_percentage', {
          transaction: t,
        }),
        queryInterface.removeColumn('transactions', 'discount_amount', {
          transaction: t,
        }),
        queryInterface.removeColumn('transactions', 'original_price', {
          transaction: t,
        }),
      ]),
    );
  },
};

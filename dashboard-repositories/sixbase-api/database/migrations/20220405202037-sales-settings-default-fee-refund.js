module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.addColumn(
          'sales_settings_default',
          'fee_fixed_refund_card',
          { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_settings_default',
          'fee_fixed_refund_billet',
          { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'sales_settings_default',
          'fee_fixed_refund_pix',
          { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
          { transaction: t },
        ),
      ]),
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.removeColumn(
          'sales_settings_default',
          'fee_fixed_refund_card',
          { transaction: t },
        ),
        queryInterface.removeColumn(
          'sales_settings_default',
          'fee_fixed_refund_billet',
          { transaction: t },
        ),
        queryInterface.removeColumn(
          'sales_settings_default',
          'fee_fixed_refund_pix',
          { transaction: t },
        ),
      ]),
    );
  },
};

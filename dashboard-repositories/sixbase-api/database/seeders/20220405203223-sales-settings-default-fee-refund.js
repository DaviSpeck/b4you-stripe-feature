module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate(
      'sales_settings_default',
      {
        fee_fixed_refund_card: 0,
        fee_fixed_refund_billet: 5,
        fee_fixed_refund_pix: 2,
      },
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkUpdate(
      'sales_settings_default',
      {
        fee_fixed_refund_card: 0,
        fee_fixed_refund_billet: 0,
        fee_fixed_refund_pix: 0,
      },
      {},
    );
  },
};

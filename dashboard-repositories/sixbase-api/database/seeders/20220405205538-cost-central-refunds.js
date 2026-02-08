module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'cost_central',
      [
        {
          method: 'REFUND_PIX',
          psp_variable_cost: 0,
          psp_fixed_cost: 0.5,
        },
        {
          method: 'REFUND_BILLET',
          psp_variable_cost: 0,
          psp_fixed_cost: 2,
        },
        {
          method: 'REFUND_CARD',
          psp_variable_cost: 0,
          psp_fixed_cost: 0,
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'cost_central',
      {
        method: ['REFUND_PIX', 'REFUND_BILLET', 'REFUND_CARD'],
      },
      {},
    );
  },
};

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'cost_central',
      [
        {
          method: 'WITHDRAWAL_PIX',
          psp_variable_cost: 0,
          psp_fixed_cost: 0.5,
        },
        {
          method: 'WITHDRAWAL_TED',
          psp_variable_cost: 0,
          psp_fixed_cost: 2,
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'cost_central',
      {
        method: ['WITHDRAWAL_PIX', 'WITHDRAWAL_TED'],
      },
      {},
    );
  },
};

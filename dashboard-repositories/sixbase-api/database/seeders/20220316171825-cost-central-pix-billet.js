module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'cost_central',
      [
        {
          method: 'BILLET',
          psp_variable_cost: 0,
          psp_fixed_cost: 1.49,
        },
        {
          method: 'PIX',
          psp_variable_cost: 1,
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
        method: ['PIX', 'BILLET'],
      },
      {},
    );
  },
};

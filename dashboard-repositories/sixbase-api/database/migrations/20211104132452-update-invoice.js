module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn('invoices', 'id_sale', 'id_sale_item'),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.renameColumn('invoices', 'id_sale_item', 'id_sale'),
    ]);
  },
};

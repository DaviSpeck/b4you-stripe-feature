module.exports = {
  up: async (queryInterface) => {
    await Promise.all([queryInterface.renameColumn('users', 'tin', 'cnpj')]);
  },

  down: async (queryInterface) => {
    await Promise.all([queryInterface.renameColumn('users', 'tin', 'cnpj')]);
  },
};

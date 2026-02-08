/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('users', 'pagarme_cpf_id', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('users', 'pagarme_cnpj_id', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('users', 'pagarme_cpf_id'),
      queryInterface.removeColumn('users', 'pagarme_cnpj_id'),
    ]);
  },
};

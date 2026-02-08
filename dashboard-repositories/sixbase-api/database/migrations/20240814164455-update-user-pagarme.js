/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('users', 'pagarme_recipient_id', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('users', 'pagarme_recipient_id_cnpj', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('users', 'pagarme_recipient_id'),
      queryInterface.removeColumn('users', 'pagarme_recipient_id_cnpj'),
    ]);
  },
};

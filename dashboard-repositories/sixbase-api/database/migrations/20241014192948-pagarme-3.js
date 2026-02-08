/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('users', 'pagarme_recipient_id_3', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('users', 'pagarme_recipient_id_cnpj_3', {
        type: Sequelize.STRING,
      }),

      queryInterface.addColumn('users', 'verified_company_pagarme_3', {
        type: Sequelize.SMALLINT,
      }),

      queryInterface.addColumn('users', 'verified_pagarme_3', {
        type: Sequelize.SMALLINT,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.addColumn([
        queryInterface.removeColumn('users', 'pagarme_recipient_id_3'),
        queryInterface.removeColumn('users', 'pagarme_recipient_id_cnpj_3'),
        queryInterface.removeColumn('users', 'verified_company_pagarme_3'),
        queryInterface.removeColumn('users', 'verified_pagarme_3'),
      ]),
    ]);
  },
};

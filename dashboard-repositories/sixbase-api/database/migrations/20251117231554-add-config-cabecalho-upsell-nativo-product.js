module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('upsell_native_product', 'header', {
      type: Sequelize.STRING,
      defaultValue: 'Seu pagamento foi efetuado com sucesso!',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('upsell_native_product', 'header');
  },
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawals_settings', 'auto_block_enabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Define se o bloqueio automático de saldo está habilitado para o usuário',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('withdrawals_settings', 'auto_block_enabled');
  },
};
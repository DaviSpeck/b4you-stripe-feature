'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'id_manager_status_contact', {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 1,
      comment: 'ID de status do contato do gerente (1 = padrão)',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'id_manager_status_contact');
  },
};

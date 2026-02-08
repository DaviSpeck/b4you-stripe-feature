'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users_backoffice', 'commission_percent', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.01,
      comment: 'Percentual de comissão do gerente (ex: 0.01 = 0.01%)',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users_backoffice', 'commission_percent');
  },
};

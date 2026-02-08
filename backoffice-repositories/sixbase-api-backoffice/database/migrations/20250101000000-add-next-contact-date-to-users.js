'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'next_contact_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data do próximo contato agendado pelo gerente',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'next_contact_date');
  },
};


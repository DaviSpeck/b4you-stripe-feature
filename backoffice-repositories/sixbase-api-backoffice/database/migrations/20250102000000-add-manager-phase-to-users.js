'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'manager_phase', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment:
        'Fase do cliente no gerenciamento do manager (1=Novos Clientes, 2=Negociação, 3=Implementação, 4=Pronto para Vender)',
    });

    await queryInterface.addColumn('users', 'manager_phase_updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data da última atualização da fase do manager',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'manager_phase_updated_at');
    await queryInterface.removeColumn('users', 'manager_phase');
  },
};

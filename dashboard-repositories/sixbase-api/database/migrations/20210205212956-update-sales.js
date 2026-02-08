'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('transactions', 'release_date', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
      queryInterface.changeColumn('transactions', 'id_sale', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {},
};

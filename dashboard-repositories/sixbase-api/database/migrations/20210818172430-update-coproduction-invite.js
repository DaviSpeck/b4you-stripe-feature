module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('coproduction_invites', 'status', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.changeColumn('coproduction_invites', 'expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.changeColumn('coproductions', 'expires_at', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('coproduction_invites', 'status', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      }),
      queryInterface.changeColumn('coproduction_invites', 'expires_at', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.changeColumn('coproductions', 'expires_at', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },
};

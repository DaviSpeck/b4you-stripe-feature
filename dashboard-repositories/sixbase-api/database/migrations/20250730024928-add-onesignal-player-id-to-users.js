

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'onesignal_player_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'OneSignal player ID para envio de push'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'onesignal_player_id');
  }
};
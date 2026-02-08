

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('onesignal_notifications', 'url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL de redirecionamento ao clicar na notificação'
    });
    await queryInterface.addColumn('onesignal_notifications', 'image_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'URL da imagem exibida na notificação'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('onesignal_notifications', 'image_url');
    await queryInterface.removeColumn('onesignal_notifications', 'url');
  }
};
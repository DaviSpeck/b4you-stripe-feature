

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('onesignal_notifications', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_user: { type: Sequelize.BIGINT, allowNull: false },
      title: { type: Sequelize.STRING(80), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      channel: { type: Sequelize.STRING, allowNull: false, defaultValue: 'push' },
      audience: { type: Sequelize.JSON, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('onesignal_notifications'),
};

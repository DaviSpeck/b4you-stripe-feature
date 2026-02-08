

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('onesignal_user_tags', {
      id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
      id_user: { type: Sequelize.BIGINT, allowNull: false },
      tag_key: { type: Sequelize.STRING(64), allowNull: false },
      tag_value: { type: Sequelize.STRING(64), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('onesignal_user_tags', ['id_user'], {
      name: 'idx_onesignal_user_tags_user',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('onesignal_user_tags', 'idx_onesignal_user_tags_user');
    await queryInterface.dropTable('onesignal_user_tags');
  },
};
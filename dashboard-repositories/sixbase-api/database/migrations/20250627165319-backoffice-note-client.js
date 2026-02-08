module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('backoffice_notes_student', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user_backoffice: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
      note: {
        type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) =>
    queryInterface.dropTable('backoffice_notes_student'),
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lessons_attachments', 'file_key', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.renameColumn(
        'lessons_attachments',
        'name',
        'original_name',
      ),
      queryInterface.renameColumn('lessons_attachments', 'link', 'file'),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('lessons_Attachments', 'file_key'),
      queryInterface.renameColumn(
        'lessons_attachments',
        'original_name',
        'name',
      ),
      queryInterface.renameColumn('lessons_attachments', 'file', 'link'),
    ]);
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lessons_attachments', 'file_size', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.addColumn('lessons_attachments', 'file_extension', {
        type: Sequelize.STRING(10),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('lessons_attachments', 'file_size'),
      queryInterface.removeColumn('lessons_attachments', 'file_extension'),
    ]);
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lessons_attachments', 'id_user', {
      type: Sequelize.BIGINT,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('lessons_attachments', 'id_user');
  },
};

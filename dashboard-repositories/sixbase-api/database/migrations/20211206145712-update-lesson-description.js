module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('lessons', 'description', {
        type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('lessons', 'description', {
        type: Sequelize.TEXT,
      }),
    ]);
  },
};

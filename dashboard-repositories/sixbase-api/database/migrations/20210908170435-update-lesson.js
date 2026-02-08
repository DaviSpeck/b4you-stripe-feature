module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('lessons', 'video_uploaded'),
      queryInterface.removeColumn('lessons', 'video_status'),
      queryInterface.removeColumn('lessons', 'link'),
      queryInterface.removeColumn('lessons', 'uri'),
      queryInterface.removeColumn('lessons', 'upload_link'),
      queryInterface.removeColumn('lessons', 'filename'),
      queryInterface.addColumn('lessons', 'id_gallery', {
        type: Sequelize.BIGINT,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lessons', 'video_uploaded', {
        type: Sequelize.BOOLEAN,
      }),
      queryInterface.addColumn('lessons', 'video_status', {
        type: Sequelize.SMALLINT,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.addColumn('lessons', 'link', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('lessons', 'uri', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('lessons', 'upload_link', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('lessons', 'filename', {
        type: Sequelize.STRING,
      }),
      queryInterface.removeColumn('lessons', 'id_gallery'),
    ]);
  },
};

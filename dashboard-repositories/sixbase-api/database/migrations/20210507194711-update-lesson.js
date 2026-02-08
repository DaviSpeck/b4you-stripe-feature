module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('lessons', 'uri', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('lessons', 'link', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('lessons', 'upload_link', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('lessons', 'id_user', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
      queryInterface.addColumn('lessons', 'uuid', {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDv4,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      await queryInterface.removeColumn('lessons', 'uri'),
      await queryInterface.removeColumn('lessons', 'link'),
      await queryInterface.removeColumn('lessons', 'upload_link'),
      await queryInterface.removeColumn('lessons', 'uuid'),
      await queryInterface.removeColumn('lessons', 'id_user'),
    ]);
  },
};

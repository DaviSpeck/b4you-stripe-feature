module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('modules_anchors', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_module: {
        type: Sequelize.BIGINT,
      },
      id_anchor: {
        type: Sequelize.BIGINT,
      },
      order: {
        type: Sequelize.INTEGER,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('modules_anchors'),
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('plugins', 'plugin', 'id_plugin');
    await queryInterface.changeColumn('plugins', 'id_plugin', {
      type: Sequelize.INTEGER,
    });
    await queryInterface.renameColumn('plugins', 'id_product', 'id_user');
    await queryInterface.addColumn('plugins', 'uuid', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDv4,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.renameColumn('plugins', 'id_plugin', 'plugin');
  },
};

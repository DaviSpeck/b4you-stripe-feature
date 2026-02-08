module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn('plugins_products', 'id_list');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('plugins_products', 'id_List', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },
};

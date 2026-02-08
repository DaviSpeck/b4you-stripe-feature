module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('membership_page_layouts', 'layout_data', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array completo de blocos com ordem preservada',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('membership_page_layouts', 'layout_data');
  },
};

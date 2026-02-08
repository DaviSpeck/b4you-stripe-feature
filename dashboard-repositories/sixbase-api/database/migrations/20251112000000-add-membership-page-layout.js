

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'membership_page_layout', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'JSON structure for membership page builder layout',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'membership_page_layout');
  },
};


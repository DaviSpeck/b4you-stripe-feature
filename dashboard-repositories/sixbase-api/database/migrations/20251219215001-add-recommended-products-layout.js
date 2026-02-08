module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'membership_page_layouts',
      'recommended_products_layout',
      {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'horizontal',
        comment:
          'Layout dos produtos recomendados: horizontal (carousel) ou vertical (grid)',
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'membership_page_layouts',
      'recommended_products_layout',
    );
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'membership_page_layouts',
      'recommended_products_enabled',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se produtos recomendados estão habilitados',
      },
    );

    await queryInterface.addColumn(
      'membership_page_layouts',
      'recommended_products',
      {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array de produtos recomendados [{id_product, order}]',
      },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      'membership_page_layouts',
      'recommended_products_enabled',
    );
    await queryInterface.removeColumn(
      'membership_page_layouts',
      'recommended_products',
    );
  },
};

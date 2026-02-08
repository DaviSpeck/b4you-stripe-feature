module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('charges', 'id_sale_item', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('charges', 'id_sale_item');
  },
};

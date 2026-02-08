module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'id_sale_item', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('transactions', 'id_sale_item');
  },
};

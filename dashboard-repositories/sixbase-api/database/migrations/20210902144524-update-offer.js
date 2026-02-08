module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_offer', 'id_classroom', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('product_offer', 'id_classroom');
  },
};

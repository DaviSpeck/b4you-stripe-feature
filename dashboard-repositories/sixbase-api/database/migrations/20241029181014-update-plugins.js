/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('plugins', 'id_product', {
      type: Sequelize.BIGINT,
      defaultValue: null,
      allowNull: true,
    });
    await queryInterface.addColumn('plugins', 'start_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true,
    });
    await queryInterface.addColumn('plugins', 'is_affiliate', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('plugins', 'id_product');
    await queryInterface.removeColumn('plugins', 'start_date');
    await queryInterface.removeColumn('plugins', 'is_affiliate');
  },
};

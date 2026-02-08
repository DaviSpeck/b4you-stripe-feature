/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'score_konduto', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: true,
    });
    await queryInterface.addColumn('sales', 'id_konduto', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'score_konduto');
    await queryInterface.removeColumn('sales', 'id_konduto');
  },
};

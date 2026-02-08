
const tableName = 'coupons_sales';
const fieldName = 'amount';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(tableName, fieldName, {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(tableName, fieldName);
  },
};

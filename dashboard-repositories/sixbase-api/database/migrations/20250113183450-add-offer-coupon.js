

const tableName = 'product_offer';
const fieldName = 'allow_coupon';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(tableName, fieldName, {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(tableName, fieldName);
  },
};

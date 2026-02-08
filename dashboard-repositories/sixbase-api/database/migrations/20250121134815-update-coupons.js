
const tableName = 'coupons';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn(tableName, 'enable_for_affiliates', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(tableName, 'id_user_created', {
        type: Sequelize.BIGINT,
        allowNull: false,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn(tableName, 'enable_for_affiliates'),
      queryInterface.removeColumn(tableName, 'id_user_created'),
    ]);
  },
};

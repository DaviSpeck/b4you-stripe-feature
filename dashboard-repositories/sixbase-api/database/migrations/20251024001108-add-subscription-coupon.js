/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('coupons', 'apply_on_every_charge', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('subscriptions', 'id_coupon', {
        type: Sequelize.BIGINT,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('coupons', 'apply_on_every_charge'),
      queryInterface.removeColumn('subscriptions', 'id_coupon'),
    ]);
  },
};

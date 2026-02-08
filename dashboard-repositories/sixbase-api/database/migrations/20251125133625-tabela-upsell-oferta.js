/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('offers_upsell_native', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      upsell_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      offer_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('offers_upsell_native');
  },
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('affiliate_clicks', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_affiliate: {
        type: Sequelize.BIGINT,
      },
      id_producer: {
        type: Sequelize.BIGINT,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      id_offer: {
        type: Sequelize.BIGINT,
      },
      click_amount: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('affiliate_clicks');
  },
};

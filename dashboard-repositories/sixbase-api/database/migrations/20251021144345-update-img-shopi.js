/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_offer', 'offer_image_json', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_offer', 'offer_image_json');
  },
};

// rodar apos migration, apagar offer_image varchar antigo, e renomear offer_image_json para offer_image
// UPDATE product_offer
// SET offer_image_json = offer_image
// WHERE offer_image REGEXP '^\\[.*\\]$';

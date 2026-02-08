

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_offer', 'thankyou_page_card', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Adição do campo thankyou_page_card para armazenar o link da página de redirecionamento para vendas no cartão'
    });

    await queryInterface.addColumn('product_offer', 'thankyou_page_pix', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Adição do campo thankyou_page_pix para armazenar o link da página de redirecionamento para vendas no pix'
    });

    await queryInterface.addColumn('product_offer', 'thankyou_page_billet', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Adição do campo thankyou_page_billet para armazenar o link da página de redirecionamento para vendas no boleto'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('product_offer', 'thankyou_page_card');
    await queryInterface.removeColumn('product_offer', 'thankyou_page_pix');
    await queryInterface.removeColumn('product_offer', 'thankyou_page_billet');
  }
};

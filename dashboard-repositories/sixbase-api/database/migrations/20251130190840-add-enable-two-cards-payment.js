/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('product_offer', 'enable_two_cards_payment', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('product_offer', 'enable_two_cards_payment');
    }
};

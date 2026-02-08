

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('order_bumps', 'order_bump_plan', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Adição do campo order_bump_plans para armazenar os planos do order bump'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('order_bumps', 'oneorder_bump_plan');
  }
};

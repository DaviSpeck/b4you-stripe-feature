module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'withdrawal_type', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('transactions', 'withdrawal_type');
  },
};

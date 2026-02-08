module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('card_verification', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_status: {
        type: Sequelize.INTEGER,
      },
      id_student: {
        type: Sequelize.BIGINT,
      },
      transaction_id: {
        type: Sequelize.UUID,
        unique: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
      },
      refund_id: {
        type: Sequelize.UUID,
        unique: true,
      },
      psp_id: {
        type: Sequelize.BIGINT,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      refunded_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('card_verification');
  },
};

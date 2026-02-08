module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fee_interest_card', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      is_default: {
        type: Sequelize.BOOLEAN,
      },
      producer_fees: {
        type: Sequelize.JSON,
      },
      student_fees: {
        type: Sequelize.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fee_interest_card');
  },
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(
      'DROP PROCEDURE IF EXISTS procedure_update_total_commission',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS insert_transactions',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS update_transactions',
    );

    await queryInterface.sequelize.query(
      'DROP PROCEDURE IF EXISTS procedure_update_users_revenue',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS insert_users_revenue',
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS update_users_revenue',
    );

    await queryInterface.sequelize.query('TRUNCATE TABLE users_revenue');
    await queryInterface.sequelize.query(
      'TRUNCATE TABLE users_total_commission',
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

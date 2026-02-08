const tableName = 'coupons_use';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      document_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      id_coupon: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          key: 'id',
          model: 'coupons',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable(tableName);
  },
};

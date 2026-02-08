module.exports = {
  /** @type {import('sequelize-cli').Migration} */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('referral_commissions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      id_status: {
        type: Sequelize.TINYINT.UNSIGNED,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sales_items',
          key: 'id',
        },
      },
      amount: {
        type: Sequelize.DECIMAL(11, 2),
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      release_date: {
        type: Sequelize.DATEONLY,
      },
    });
  },

  down: async (queryInterface) =>
    queryInterface.dropTable('referral_commissions'),
};

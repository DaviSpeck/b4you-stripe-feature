

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('creator_revenue_agg', {
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      period: {
        type: Sequelize.ENUM('weekly', 'monthly', 'all_time'),
        allowNull: false,
        primaryKey: true,
      },
      revenue: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
      },
      sales_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'creator_revenue_agg',
      ['period', 'revenue'],
      { name: 'idx_creator_revenue_period_revenue' },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('creator_revenue_agg');
  },
};
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leaderboard_winners', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      scope: {
        type: Sequelize.ENUM('weekly', 'monthly'),
        allowNull: false,
      },
      period_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      period_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      revenue: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      'leaderboard_winners',
      ['scope', 'period_year', 'period_value'],
      { name: 'idx_leaderboard_winners_unique', unique: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'leaderboard_winners',
      'idx_leaderboard_winners_unique',
    );
    await queryInterface.dropTable('leaderboard_winners');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_leaderboard_winners_scope";',
    );
  },
};

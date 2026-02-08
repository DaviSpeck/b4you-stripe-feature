const Sequelize = require('sequelize');

module.exports = class LeaderboardWinners extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    primaryKey: true,
                    autoIncrement: true,
                    type: Sequelize.BIGINT,
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
                created_at: Sequelize.DATE,
            },
            {
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: false,
                sequelize,
                modelName: 'leaderboard_winners',
            },
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.users, {
            as: 'user',
            foreignKey: 'user_id',
            targetKey: 'id',
        });
    }
};


import { DataTypes, Model } from 'sequelize';

export class LeaderboardWinners extends Model {
    static initModel(sequelize) {
        return LeaderboardWinners.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                },
                scope: {
                    type: DataTypes.ENUM('weekly', 'monthly'),
                    allowNull: false,
                },
                period_year: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                period_value: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                revenue: {
                    type: DataTypes.DECIMAL(14, 2),
                    allowNull: false,
                },
                created_at: DataTypes.DATE,
            },
            {
                sequelize,
                tableName: 'leaderboard_winners',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: false,
            },
        );
    }
}
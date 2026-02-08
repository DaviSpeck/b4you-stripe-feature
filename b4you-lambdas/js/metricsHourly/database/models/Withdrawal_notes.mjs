import * as Sequelize from 'sequelize';

export class Withdrawal_notes extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                id_type: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                id_user: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                id_user_backoffice: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users_backoffice',
                        key: 'id',
                    },
                },
                text: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'withdrawal_notes',
                tableName: 'withdrawal_notes',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            },
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.users, {
            sourceKey: 'id_user',
            foreignKey: 'id',
            as: 'user',
        });
        this.belongsTo(models.users_backoffice, {
            sourceKey: 'id_user_backoffice',
            foreignKey: 'id',
            as: 'user_backoffice',
        });
    }
}
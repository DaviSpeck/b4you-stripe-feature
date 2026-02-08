import * as Sequelize from 'sequelize';

export class UsersBackoffice extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },
                full_name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                is_admin: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                },
                active: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true,
                },
                created_at: {
                    type: Sequelize.DATE,
                },
            },
            {
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: false,
                sequelize,
                modelName: 'users_backoffice',
            },
        );

        return this;
    }

    static associate(models) {
        this.hasMany(models.withdrawal_notes, {
            sourceKey: 'id',
            foreignKey: 'id_user_backoffice',
            as: 'withdrawal_notes',
        });
    }
}
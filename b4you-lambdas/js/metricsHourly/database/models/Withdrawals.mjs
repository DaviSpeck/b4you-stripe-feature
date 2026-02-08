import { uuid } from '../../utils/helpers/uuid.mjs';
import * as Sequelize from 'sequelize';

export class Withdrawals extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                    field: 'id',
                },
                id_user: {
                    type: Sequelize.BIGINT,
                    allowNull: true,
                },
                id_user_requested: {
                    type: Sequelize.BIGINT,
                    allowNull: true,
                },
                bank_address: {
                    type: Sequelize.JSON,
                },
                updated_at: {
                    type: Sequelize.DATE,
                },
                created_at: {
                    type: Sequelize.DATE,
                },
                uuid: {
                    type: Sequelize.UUID,
                    unique: true,
                },
                id_invoice: {
                    type: Sequelize.BIGINT,
                },
            },
            {
                hooks: {
                    beforeCreate: (withdrawals) => {
                        withdrawals.uuid = uuid.v4();
                    },
                },
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                sequelize,
                modelName: 'withdrawals',
            },
        );

        return this;
    }

    static associate(models) {
        this.hasOne(models.users, {
            sourceKey: 'id_user',
            foreignKey: 'id',
            as: 'user',
        });
    }
}
import * as Sequelize from 'sequelize';

export class Integration_notifications extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
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
                id_type: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '1=webhook, 2=bling, 3=notazz, 4=refund, 5=shopify',
                },
                id_sale: {
                    type: Sequelize.BIGINT,
                    allowNull: true,
                },
                id_sale_item: {
                    type: Sequelize.BIGINT,
                    allowNull: true,
                },
                id_product: {
                    type: Sequelize.BIGINT,
                    allowNull: true,
                },
                params: {
                    type: Sequelize.JSON,
                    allowNull: true,
                },
                read: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                done: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                read_at: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                created_at: {
                    type: Sequelize.DATE,
                },
                updated_at: {
                    type: Sequelize.DATE,
                },
            },
            {
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                sequelize,
                modelName: 'integration_notifications',
            }
        );

        return this;
    }
}

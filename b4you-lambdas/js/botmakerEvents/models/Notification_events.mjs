import { DataTypes, Model } from "sequelize";

export class NotificationEvents extends Model {
    static initModel(sequelize) {
        return NotificationEvents.init(
            {
                id: {
                    type: DataTypes.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },

                event_key: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },

                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },

                template_key: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },

                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },

                is_active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                },

                trigger_type: {
                    type: DataTypes.INTEGER, // 1 = SQS | 2 = EventBridge
                    allowNull: false,
                },

                delay_seconds: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },

                created_at: {
                    type: DataTypes.DATE,
                },

                updated_at: {
                    type: DataTypes.DATE,
                },
            },
            {
                sequelize,
                modelName: "notification_events",
                tableName: "notification_events",
                freezeTableName: true,
                timestamps: true,
                createdAt: "created_at",
                updatedAt: "updated_at",
            }
        );
    }
}
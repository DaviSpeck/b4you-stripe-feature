const Sequelize = require('sequelize');

class NotificationEvents extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: {
                    type: Sequelize.BIGINT,
                    autoIncrement: true,
                    primaryKey: true,
                },

                event_key: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },

                title: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },

                template_key: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },

                description: {
                    type: Sequelize.STRING,
                },

                is_active: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true,
                },

                trigger_type: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },

                delay_seconds: {
                    type: Sequelize.INTEGER,
                },

                created_at: {
                    type: Sequelize.DATE,
                },

                updated_at: {
                    type: Sequelize.DATE,
                },
            },
            {
                sequelize,
                modelName: 'notification_events',
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                paranoid: false,
            },
        );

        return this;
    }

    static associate(models) {
        // se no futuro quiser versionar ou auditar
    }
}

module.exports = NotificationEvents;
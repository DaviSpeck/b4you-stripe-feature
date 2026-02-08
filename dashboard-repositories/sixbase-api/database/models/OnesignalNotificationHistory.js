const Sequelize = require('sequelize');

class OnesignalNotificationHistory extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
                id_onesignal_notification_schedule: Sequelize.BIGINT,
                sent_at: Sequelize.DATE,
                status: Sequelize.STRING,
                onesignal_notification_id: Sequelize.STRING,
                recipients: Sequelize.INTEGER,

                queued_at: Sequelize.DATE,
                send_after: Sequelize.DATE,
                completed_at: Sequelize.DATE,
                successful: Sequelize.INTEGER,
                failed: Sequelize.INTEGER,
                errored: Sequelize.INTEGER,
                remaining: Sequelize.INTEGER,
                platform_delivery_stats: Sequelize.JSON,

                response_data: Sequelize.JSON,
                created_at: Sequelize.DATE,
                updated_at: Sequelize.DATE,
                deleted_at: Sequelize.DATE,
            },
            {
                sequelize,
                modelName: 'onesignal_notification_history',
                freezeTableName: true,
                timestamps: true,
                underscored: true,
                paranoid: true,
            }
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.onesignal_notification_schedules, {
            foreignKey: 'id_onesignal_notification_schedule',
            as: 'schedule',
        });
    }
}

module.exports = OnesignalNotificationHistory;
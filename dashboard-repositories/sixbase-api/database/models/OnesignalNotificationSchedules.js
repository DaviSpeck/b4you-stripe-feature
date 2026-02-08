const Sequelize = require('sequelize');

class OnesignalNotificationSchedules extends Sequelize.Model {
    static init(sequelize) {
        super.init(
            {
                id: { type: Sequelize.BIGINT, autoIncrement: true, primaryKey: true },
                id_onesignal_notification: Sequelize.BIGINT,
                schedule_type: Sequelize.STRING,
                send_at: Sequelize.DATE,
                offset_in_minutes: Sequelize.INTEGER,
                onesignal_schedule_id: Sequelize.STRING,
                created_at: Sequelize.DATE,
                updated_at: Sequelize.DATE,
                deleted_at: Sequelize.DATE,
            },
            {
                sequelize,
                modelName: 'onesignal_notification_schedules',
                freezeTableName: true,
                timestamps: true,
                underscored: true,
                paranoid: true,
            },
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.onesignal_notifications, {
            foreignKey: 'id_onesignal_notification',
            as: 'notification',
        });
        this.hasMany(models.onesignal_notification_history, {
            foreignKey: 'id_onesignal_notification_schedule',
            as: 'history',
        });
    }
}

module.exports = OnesignalNotificationSchedules;
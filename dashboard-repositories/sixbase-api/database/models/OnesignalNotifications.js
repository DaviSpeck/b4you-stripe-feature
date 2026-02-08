const Sequelize = require('sequelize');

class OnesignalNotifications extends Sequelize.Model {
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
                },
                title: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                channel: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                audience: {
                    type: Sequelize.JSON,
                    allowNull: true,
                },
                url: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    comment: 'URL de redirecionamento ao clicar na notificação',
                },
                image_url: {
                    type: Sequelize.STRING,
                    allowNull: true,
                    comment: 'URL da imagem exibida na notificação',
                },
                created_at: {
                    type: Sequelize.DATE,
                },
                updated_at: {
                    type: Sequelize.DATE,
                },
                deleted_at: {
                    type: Sequelize.DATE,
                },
            },
            {
                sequelize,
                modelName: 'onesignal_notifications',
                freezeTableName: true,
                timestamps: true,
                underscored: true,
                paranoid: true,
            }
        );
        return this;
    }

    static associate(models) {
        this.hasMany(models.onesignal_notification_schedules, {
            foreignKey: 'id_onesignal_notification',
            as: 'schedules',
        });
    }
}

module.exports = OnesignalNotifications;

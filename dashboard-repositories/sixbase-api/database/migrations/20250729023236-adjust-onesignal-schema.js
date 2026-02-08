/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('onesignal_notifications', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.changeColumn('onesignal_notifications', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
    });

    const [existingUserIdx] = await queryInterface.sequelize.query(`
      SHOW INDEX FROM onesignal_notifications WHERE Key_name = 'idx_onesignal_notifications_user';
    `);
    if (existingUserIdx.length === 0) {
      await queryInterface.addIndex('onesignal_notifications', ['id_user'], {
        name: 'idx_onesignal_notifications_user',
      });
    }

    const [existingScheduleIdx] = await queryInterface.sequelize.query(`
      SHOW INDEX FROM onesignal_notification_schedules WHERE Key_name = 'idx_onesignal_schedules_send_at';
    `);
    if (existingScheduleIdx.length === 0) {
      await queryInterface.addIndex('onesignal_notification_schedules', ['send_at'], {
        name: 'idx_onesignal_schedules_send_at',
      });
    }

    const [existingHistoryIdx] = await queryInterface.sequelize.query(`
      SHOW INDEX FROM onesignal_notification_history WHERE Key_name = 'idx_onesignal_history_sent_at';
    `);
    if (existingHistoryIdx.length === 0) {
      await queryInterface.addIndex('onesignal_notification_history', ['sent_at'], {
        name: 'idx_onesignal_history_sent_at',
      });
    }

    const [existingDeliveriesIdx] = await queryInterface.sequelize.query(`
      SHOW INDEX FROM onesignal_notification_deliveries WHERE Key_name = 'idx_onesignal_deliveries_delivered_at';
    `);
    if (existingDeliveriesIdx.length === 0) {
      await queryInterface.addIndex('onesignal_notification_deliveries', ['delivered_at'], {
        name: 'idx_onesignal_deliveries_delivered_at',
      });
    }

    await queryInterface.changeColumn('onesignal_notification_schedules', 'schedule_type', {
      type: Sequelize.ENUM('immediate', 'scheduled', 'relative'),
      allowNull: false,
    });

    const tables = [
      'onesignal_notification_schedules',
      'onesignal_notification_history',
      'onesignal_notification_deliveries',
    ];
    await Promise.all(
      tables.map(table =>
        Promise.all([
          queryInterface.changeColumn(table, 'created_at', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          }),
          queryInterface.changeColumn(table, 'updated_at', {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          }),
        ]),
      ),
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('onesignal_notifications', 'idx_onesignal_notifications_user');
    await queryInterface.removeIndex('onesignal_notification_schedules', 'idx_onesignal_schedules_send_at');
    await queryInterface.removeIndex('onesignal_notification_history', 'idx_onesignal_history_sent_at');
    await queryInterface.removeIndex('onesignal_notification_deliveries', 'idx_onesignal_deliveries_delivered_at');

    await queryInterface.changeColumn('onesignal_notifications', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('onesignal_notifications', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await Promise.all(
      ['onesignal_notification_schedules', 'onesignal_notification_history', 'onesignal_notification_deliveries'].map(
        table =>
          Promise.all([
            queryInterface.changeColumn(table, 'created_at', { type: Sequelize.DATE, allowNull: false }),
            queryInterface.changeColumn(table, 'updated_at', { type: Sequelize.DATE, allowNull: true, defaultValue: null }),
          ]),
      ),
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS `enum_onesignal_notification_schedules_schedule_type`;'
    );
  },
};
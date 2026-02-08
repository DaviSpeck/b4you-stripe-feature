const { getConfig } = require('./config');
const logger = require('./logger');

module.exports = {
  scheduleForMorning() {
    const config = getConfig();
    const targetHour = Number(config.scheduler.defaultHour || 9);

    if (Number.isNaN(targetHour) || targetHour < 0 || targetHour > 23) {
      logger.error('Invalid scheduler.defaultHour provided', {
        defaultHour: config.scheduler.defaultHour,
      });
      throw new Error('Invalid scheduler.defaultHour');
    }

    return new Promise((resolve) => {
      const now = new Date();
      const target = new Date();

      target.setHours(targetHour, 0, 0, 0);

      if (now > target) {
        target.setDate(target.getDate() + 1);
      }

      const msUntilRun = target - now;

      logger.info('Event scheduled for morning execution', {
        now: now.toISOString(),
        target: target.toISOString(),
        delayMs: msUntilRun,
      });

      if (process.env.SERVERLESS === 'true') {
        logger.info('SERVERLESS mode detected — no setTimeout will be executed');

        resolve({
          scheduled: true,
          simulated: true,
          targetTime: target.toISOString(),
          delayMs: msUntilRun,
        });

        return;
      }

      setTimeout(() => {
        logger.info('Scheduled morning event executing now', {
          executedAt: new Date().toISOString(),
        });

        resolve({
          scheduled: true,
          executedAt: new Date().toISOString(),
          targetTime: target.toISOString(),
          delayMs: msUntilRun,
        });
      }, msUntilRun);
    });
  },
};

const eventBus = require('./core/eventBus');
const { setConfig, getConfig } = require('./core/config');
const { defaultEvents } = require('./events');

function registerEvents(eventMap = defaultEvents) {
  Object.entries(eventMap).forEach(([eventName, handler]) => {
    eventBus.register(eventName, handler);
  });
}

function createBotmakerEventsModule(options = {}) {
  const { events, config } = options;

  if (config) {
    setConfig(config);
  }

  registerEvents({ ...defaultEvents, ...events });
  return eventBus;
}

module.exports = {
  createBotmakerEventsModule,
  defaultEvents,
  eventBus,
  getConfig,
  registerEvents,
  setConfig,
};

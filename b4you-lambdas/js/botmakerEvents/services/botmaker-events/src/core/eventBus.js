const logger = require('./logger');

class EventBus {
  constructor() {
    this.handlers = {};
  }

  /**
   * Registra um handler para um evento
   */
  register(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new Error(`Handler for event "${eventName}" must be a function`);
    }

    this.handlers[eventName] = this.handlers[eventName] || [];
    this.handlers[eventName].push(handler);

    logger.info(`[EventBus] Handler registered for event "${eventName}"`);
  }

  /**
   * Emite um evento e executa todos os handlers
   */
  async emit(eventName, payload) {
    const eventHandlers = this.handlers[eventName];

    if (!eventHandlers || eventHandlers.length === 0) {
      logger.error(`[EventBus] No handlers registered for event "${eventName}"`);
      return [];
    }

    logger.info(`[EventBus] Emitting event "${eventName}"`, {
      handlers: eventHandlers.length,
      payloadPreview: JSON.stringify(payload)?.slice(0, 150),
    });

    const executions = eventHandlers.map(async (handler) => {
      try {
        const result = await handler(payload);
        return { success: true, handler: handler.name, result };
      } catch (err) {
        logger.error(`[EventBus] Error executing handler for "${eventName}"`, {
          handler: handler.name,
          message: err.message,
          stack: err.stack,
        });
        return { success: false, handler: handler.name, error: err };
      }
    });

    const results = await Promise.allSettled(executions);

    logger.info(`[EventBus] Completed event "${eventName}"`, { results });

    return results;
  }
}

module.exports = new EventBus();

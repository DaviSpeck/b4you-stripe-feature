function safeJSON(obj, maxLength = 2000) {
  try {
    const str = JSON.stringify(obj);

    if (str.length > maxLength) {
      return `${str.slice(0, maxLength)}...[TRUNCATED]`;
    }

    return str;
  } catch {
    return String(obj);
  }
}

function baseLog(level, message, payload) {
  const entry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    payload: payload ? safeJSON(payload) : undefined,
  };

  if (level === 'error' || level === 'fatal') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

module.exports = {
  info(message, payload) {
    baseLog('info', message, payload);
  },

  warn(message, payload) {
    baseLog('warn', message, payload);
  },

  error(message, payload) {
    baseLog('error', message, payload);
  },

  fatal(message, payload) {
    baseLog('fatal', message, payload);
  },

  debug(message, payload) {
    if (process.env.DEBUG_EVENTS === 'true') {
      baseLog('debug', message, payload);
    }
  },
};

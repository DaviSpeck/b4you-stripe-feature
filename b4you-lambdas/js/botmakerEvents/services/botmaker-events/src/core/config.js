require('dotenv').config();

const baseConfig = {
  botmaker: {
    accessToken: process.env.BOTMAKER_ACCESS_TOKEN,
    whatsappChannelId: process.env.BOTMAKER_WHATSAPP_CHANNEL_ID,
  },
  timezone: process.env.APP_TIMEZONE || 'America/Sao_Paulo',
  scheduler: {
    defaultHour: 9,
  },
};

let currentConfig = { ...baseConfig };

function deepMerge(target, source) {
  return Object.entries(source || {}).reduce(
    (merged, [key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        merged[key] = deepMerge(merged[key] || {}, value);
      } else {
        merged[key] = value;
      }
      return merged;
    },
    { ...target }
  );
}

function setConfig(overrides = {}) {
  currentConfig = deepMerge(baseConfig, overrides);
  return currentConfig;
}

function getConfig() {
  return currentConfig;
}

module.exports = { baseConfig, getConfig, setConfig };

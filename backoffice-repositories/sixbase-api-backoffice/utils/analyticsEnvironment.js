const NON_PROD_ENV_VALUES = [
  'sandbox',
  'development',
  'dev',
  'local',
  'localhost',
  'staging',
  'test',
  'testing',
  'qa',
  'homolog',
  'homologation',
];

const normalizeEnvValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

const isProductionEnvironment =
  normalizeEnvValue(process.env.NODE_ENV) === 'production' &&
  normalizeEnvValue(process.env.ENVIRONMENT) === 'production';

const isNonProdEnvironmentValue = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = normalizeEnvValue(value);
  return NON_PROD_ENV_VALUES.includes(normalized);
};

module.exports = {
  NON_PROD_ENV_VALUES,
  isNonProdEnvironmentValue,
  isProductionEnvironment,
};

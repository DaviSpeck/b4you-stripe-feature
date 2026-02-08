require('dotenv').config();

const isScript = process.env.DB_SCRIPT_MODE === 'true';

module.exports = {
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  dialect: process.env.DATABASE_DIALECT,
  logging: false,
  seederStorage: 'sequelize',
  dialectOptions: {
    decimalNumbers: true,
  },
  /**
   * Pool ajustado por contexto:
   * - Script de migração: poucas conexões, vida curta
   * - API: pool normal
   */
  pool: isScript
    ? {
      max: 2,
      min: 0,
      acquire: 60000,
      idle: 10000,
      evict: 10000,
    }
    : {
      max: 15,
      min: 5,
      acquire: 30000,
      idle: 15000,
      evict: 15000,
    },
  redis: {
    password: process.env.PASSWORD_REDIS,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  secure: 'SECURE',
};
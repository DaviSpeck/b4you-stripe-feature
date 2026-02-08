require('dotenv').config();

const reconnectOptions = {
  retry_on_reconnect: {
    transactions: true,
  },
  max_retries: 999,
  maxAttempts: 5,
  delay: 3000,
  onRetry(count) {
    // eslint-disable-next-line
    console.log(`connection lost, trying to reconnect (${count})`);
  },
};
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
  reconnect: reconnectOptions || true,
  pool: {
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

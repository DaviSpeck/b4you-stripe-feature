const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
const config = require('../../config/database');
const logger = require('../../utils/logger');

const readModels = (dirname, basename) => {
  const models = [];
  fs.readdirSync(dirname).forEach((file) => {
    if (
      file.indexOf('.') !== 0 &&
      file !== path.basename(basename) &&
      file.slice(-3) === '.js'
    ) {
      // eslint-disable-next-line
      const model = require(path.resolve(dirname, file));
      models.push(model);
    }
  });

  return models;
};

const models = readModels(__dirname, __filename);

class Database {
  constructor() {
    let dbConfig = config;
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      const {
        host,
        username,
        password,
        database,
        pool,
        dialect,
        dialectOptions,
      } = dbConfig;
      dbConfig = {
        pool,
        dialect,
        dialectOptions,
        replication: {
          write: {
            host,
            username,
            password,
            database,
            dialectOptions,
          },
          read: [
            {
              host: process.env.MYSQL_HOST_REPLICA,
              username,
              password,
              database,
              dialectOptions,
            },
          ],
        },
      };
    }
    this.sequelize = new Sequelize(dbConfig);
    this.init();
    this.testConnection();
  }

  init() {
    models
      .map((model) => model.init(this.sequelize))
      .map(
        (model) => model.associate && model.associate(this.sequelize.models),
      );
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      logger.info('Sequelize Connection has been established successfully.');
    } catch (error) {
      logger.error('Unable to connect to the database:', error);
    }
  }

  async close() {
    await this.sequelize.close();
  }
}

module.exports = new Database();

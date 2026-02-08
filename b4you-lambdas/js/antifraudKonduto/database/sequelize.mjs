import { Sequelize } from 'sequelize';
import { models } from './models/index.mjs';

export class Database {
  constructor(config) {
    this.sequelize = new Sequelize({
      ...config,
      pool: {
        max: 2,
        min: 0,
        idle: 0,
        acquire: 3000,
        evict: 3000,
      },
    });

    models
      .map((model) => model.init(this.sequelize))
      .map((model) => model.associate && model.associate(this.sequelize.models));
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('Sequelize Connection has been established successfully.');
      return this;
    } catch (error) {
      console.log('Unable to connect to the database:', error);
      throw error;
    }
  }

  async refreshConnection() {
    this.sequelize.connectionManager.initPools();

    if (this.sequelize.connectionManager.hasOwnProperty('getConnection')) {
      delete this.sequelize.connectionManager.getConnection;
    }
  }

  async closeConnection() {
    await this.sequelize.connectionManager.close();
  }
}

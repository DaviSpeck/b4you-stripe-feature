import { Sequelize } from 'sequelize';
import { models } from './models/index.mjs';

export class Database {
  constructor(config) {
    this.sequelize = new Sequelize({
      ...config,
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

  async closeConnection() {
    await this.sequelize.close();
  }
}

import { Sequelize } from "sequelize";

export class Database {
  constructor(config) {
    this.sequelize = new Sequelize({
      ...config,
    });
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log("Sequelize Connection has been established successfully.");
      return this;
    } catch (error) {
      console.log("Unable to connect to the database:", error);
      throw error;
    }
  }

  async closeConnection() {
    await this.sequelize.close();
  }
}

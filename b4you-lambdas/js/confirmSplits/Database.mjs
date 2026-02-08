import mysql2 from 'mysql2/promise';
import {
  queryUserSaleSettings,
  queryTransactions,
  queryBalance,
  queryCreateBalanceHistory,
  queryIncrementBalance,
  queryUpdateTransaction,
  queryUpdateCommission,
  queryCommissions,
} from './query.mjs';

const { MYSQL_DATABASE, MYSQL_HOST, MYSQL_PASSWORD, MYSQL_USERNAME } = process.env;

export class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    this.connection = await mysql2.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USERNAME,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
    });
  }

  async execute(query) {
    const [result] = await this.connection.query(query);
    return result;
  }

  async findTransactions(ids) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(queryTransactions(ids));
    return result;
  }

  async findCommissions(id_sale_item) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(queryCommissions(id_sale_item));
    return result;
  }

  async updateCommission(id, data) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(queryUpdateCommission(id, data));
    return result;
  }

  async findUserSaleSettings(id_user) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(queryUserSaleSettings(id_user));
    return result;
  }

  async findBalance(id_user) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(queryBalance(id_user));
    return result;
  }

  async createBalanceHistory(data) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(queryCreateBalanceHistory(data));
    return result;
  }

  async incrementBalance(id, amount) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(queryIncrementBalance(id, amount));
    return result;
  }

  async updateTransaction(id, data) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(queryUpdateTransaction(id, data));
    return result;
  }

  async closeConnection() {
    await this.connection.end();
  }
}

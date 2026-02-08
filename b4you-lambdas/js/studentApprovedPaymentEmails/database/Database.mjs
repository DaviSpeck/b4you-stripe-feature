import mysql2 from 'mysql2/promise';
import {
  queryCreateResetStudent,
  queryCreateStudentSession,
  queryFindIdUser,
  queryFindProductPlugins,
  queryFindUser,
  queryFindUserPlugins,
  queryfindResetStudent,
  queryFindAstronWebhook,
  queryFindProductOfferNameBySaleUuid,
} from './query.mjs';

export class Database {
  constructor() {
    this.connection = null;
  }
  async connect({ host, user, password, database }) {
    this.connection = await mysql2.createConnection({
      host,
      user,
      password,
      database,
    });
    console.log('conectou');
  }

  async execute(query) {
    const [result] = await this.connection.query(query);
    return result;
  }

  async closeConnection() {
    await this.connection.end();
  }

  async createStudentSession(id_student) {
    const { query, uuid } = queryCreateStudentSession(id_student);
    await this.execute(query);
    return { uuid };
  }

  async findResetStudent(id_student) {
    const [result] = await this.execute(queryfindResetStudent(id_student));
    return result;
  }

  async createResetStudent(id_student) {
    const { query, uuid } = queryCreateResetStudent(id_student);
    await this.execute(query);
    return { uuid };
  }

  async findUserPlugins(id_user) {
    const result = await this.execute(queryFindUserPlugins(id_user));
    console.log('query user plugins', result);
    return result.map((r) => r.id);
  }

  async findPluginsProduct(id_product, ids_plugins) {
    const result = await this.execute(queryFindProductPlugins(id_product, ids_plugins));
    console.log('query plugins product', result);
    return result;
  }

  async findIdUser(id_product) {
    const [result] = await this.execute(queryFindIdUser(id_product));
    console.log('query id user', result);
    return result;
  }

  async findUser(id_user) {
    const [result] = await this.execute(queryFindUser(id_user));
    return result;
  }

  async findAstronWebhook(id_user) {
    const [result] = await this.execute(queryFindAstronWebhook(id_user));
    console.log('query id webhook', result);
    return result;
  }

  async findOfferName(uuid) {
    const [result] = await this.execute(queryFindProductOfferNameBySaleUuid(uuid));
    console.log('offer name', result);
    return result;
  }

  async findUserNotificationsSettings(id_user) {
    const [result] = await this.execute(
      `select n.mail_approved_payment from notifications_settings n where n.id_user = ${id_user}`
    );
    console.log('notifications', result)
    return result;
  }
}

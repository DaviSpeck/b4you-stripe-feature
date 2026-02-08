import mysql2 from 'mysql2/promise';

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

  async findSaleItem(uuid) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(
      `select id, uuid, src, created_at, id_product, id_affiliate from sales_items where uuid='${uuid}'`
    );
    return result;
  }

  async findProduct(id) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(`select id_user, name from products p where p.id = ${id}`);
    return result;
  }

  async findCommissions(id_sale_item) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(
      `select id_user, amount, id_sale_item from commissions where id_sale_item = ${id_sale_item}`
    );
    return result;
  }

  async findUser(id_user) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(
      `select u.full_name, u.id, u.email, u.uuid from users u where u.id = ${id_user}`
    );
    return result;
  }

  async findAffiliate(id_affiliate) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(
      `select u.full_name, u.id, u.email, u.uuid from users u join affiliates a on a.id_user = u.id where a.id = ${id_affiliate}`
    );
    return result;
  }

  async findCoproducers(id_product) {
    if (!this.connection) throw new Error('sem conexão');
    const result = await this.execute(
      `select u.full_name, u.id, u.email, u.uuid from users u join coproductions c on c.id_user = u.id join products p on c.id_product = p.id where p.id = ${id_product} and c.status = 2; `
    );
    return result;
  }

  async findUserNotificationsSettings(id_user) {
    if (!this.connection) throw new Error('sem conexão');
    const [result] = await this.execute(
      `select n.mail_approved_payment from notifications_settings n where n.id_user = ${id_user}`
    );
    return result;
  }

  async closeConnection() {
    await this.connection.end();
  }
}

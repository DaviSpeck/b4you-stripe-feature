import { v4 } from 'uuid';
import { date } from '../utils/date.mjs';

const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';

export const queryCreateStudentSession = (id_student) => {
  const uuid = v4();
  const created_at = date().format(DATABASE_DATE);
  return {
    query: `INSERT INTO student_sessions (uuid, id_student, created_at) VALUES('${uuid}', ${id_student}, '${created_at}')`,
    uuid,
  };
};

export const queryfindResetStudent = (id_student) =>
  `SELECT * FROM reset_student where id_student = ${id_student}`;

export const queryCreateResetStudent = (id_student) => {
  const uuid = v4();
  const created_at = date().format(DATABASE_DATE);
  return {
    query: `INSERT INTO reset_student (id_student, uuid, created_at) VALUES(${id_student}, '${uuid}', '${created_at}');`,
    uuid,
  };
};

export const queryFindUserPlugins = (id_user) => {
  return `SELECT id from plugins where id_user = ${id_user} and active = 1 and id_plugin = 14`;
};

const generateIn = (ids) => {
  let str = '(';
  for (const [i, value] of ids.entries()) {
    str += i === ids.length - 1 ? value : `${value},`;
  }
  return str + ')';
};

export const queryFindProductPlugins = (id_product, ids_plugins) => {
  return `SELECT id from plugins_products where id_product = ${id_product} and id_plugin in ${generateIn(
    ids_plugins
  )}`;
};

export const queryFindIdUser = (id_product) => {
  return `select id_user, nickname, support_email, email_subject, email_template from products where id = ${id_product}`;
};

export const queryFindUser = (id_user) => {
  return `select full_name, email from users where id = ${id_user}`;
};

export const queryFindAstronWebhook = (id_user) => {
  return `select id from webhooks where id_user = ${id_user} AND url like '%astronmembers%'`;
};

export const queryFindProductOfferNameBySaleUuid = (uuid) => {
  return `SELECT po.name
  FROM sales_items si
  JOIN product_offer po ON si.id_offer = po.id
  WHERE si.uuid = '${uuid}'`;
};

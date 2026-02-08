import { date } from './date.mjs';
import { DATABASE_DATE } from './utils.mjs';

export const queryTransactions = (ids) =>
  `select id, id_user, user_net_amount from transactions where id in (${ids.join(',')}); `;

export const queryUserSaleSettings = (id_user) =>
  `select * from sales_settings where id_user = ${id_user}`;

export const queryBalance = (id_user) => `select * from balances where id_user = ${id_user}`;

export const queryCreateBalanceHistory = ({
  id_user,
  old_amount,
  amount,
  new_amount,
  operation,
  id_transaction,
}) =>
  `insert into balance_history (id_user, id_transaction, operation, old_amount, amount, new_amount, created_at) VALUES (${id_user}, ${id_transaction}, '${operation}', ${old_amount}, ${amount}, ${new_amount}, '${date().format(
    DATABASE_DATE
  )}')`;

export const queryIncrementBalance = (id, amount) =>
  `update balances set amount = amount + ${amount} where id = ${id}`;

export const queryUpdateTransaction = (id, data) => {
  const keys = Object.keys(data);
  return `update transactions set ${keys.map(
    (key) => `${key}=${typeof data[key] === 'string' ? `'${data[key]}'` : data[key]}`
  )} where id = ${id}`;
};

export const queryUpdateCommission = (id, data) => {
  const keys = Object.keys(data);
  return `update commissions set ${keys.map(
    (key) => `${key}=${typeof data[key] === 'string' ? `'${data[key]}'` : data[key]}`
  )} where id = ${id}`;
};

export const queryCommissions = (id_sale_item) =>
  `select id, id_user, amount, id_product from commissions where id_sale_item = ${id_sale_item}`;

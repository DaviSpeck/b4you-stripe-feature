export const querySaleItem = (uuid) => `select * from sales_items where uuid='${uuid}'`;

export const queryProduct = (id) => `select * from products p where p.id = ${id}`;

export const queryTransactions = (sale_item_uuid) =>
  `select id, id_user, id_role, user_net_amount from transactions t inner join sales_items_transactions st inner join sales_items s on t.id = st.id_transaction and s.id = st.id_sale_item where t.id_type = 3 and s.uuid = '${sale_item_uuid}' `;

export const queryUser = (id_user) =>
  `select u.first_name, u.last_name, u.id, u.email, u.uuid from users u where u.id = ${id_user}`;

export const queryAffiliate = (id_affiliate) =>
  `select u.first_name, u.last_name, u.id, u.email, u.uuid from users u join affiliates a on a.id_user = u.id where a.id = ${id_affiliate}`;

export const queryCoproducers = (id_product) =>
  `select u.first_name, u.last_name, u.id, u.email, u.uuid from users u join coproductions c on c.id_user = u.id join products p on c.id_product = p.id where p.id = ${id_product} and c.status = 2; `;

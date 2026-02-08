const integrationNotificationTypes = [
  {
    id: 1,
    name: 'Webhook',
    key: 'webhook',
  },
  {
    id: 2,
    name: 'Bling',
    key: 'bling',
  },
  {
    id: 3,
    name: 'Notazz',
    key: 'notazz',
  },
  {
    id: 4,
    name: 'Reembolso',
    key: 'refund',
  },
  {
    id: 5,
    name: 'Shopify',
    key: 'shopify',
  },
];

const findIntegrationNotificationType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = integrationNotificationTypes.find(
    (s) => s[parameter] === type,
  );
  return selectedType;
};

const findIntegrationNotificationTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return integrationNotificationTypes.find((s) => s.key === key);
};

const findIntegrationNotificationTypeById = (id) => {
  if (!id) throw new Error('id must be provided');
  if (typeof id !== 'number') throw new Error('id must be a number');
  return integrationNotificationTypes.find((s) => s.id === id);
};

module.exports = {
  integrationNotificationTypes,
  findIntegrationNotificationType,
  findIntegrationNotificationTypeByKey,
  findIntegrationNotificationTypeById,
};

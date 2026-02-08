const webhookTypes = [
  {
    id: 1,
    label: 'Webhooks',
    key: 'webhook',
  },
  {
    id: 2,
    label: 'Zarpon',
    key: 'zarpon',
  },
  {
    id: 3,
    label: 'Arco',
    key: 'arco',
  },
  {
    id: 4,
    label: 'Spedy',
    key: 'spedy',
  },
];

const findZarponType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return webhookTypes.find((s) => s[parameter] === type);
};

const findZarponTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return webhookTypes.find((s) => s.key === key);
};

const findWebhookType = (type) => {
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return webhookTypes.find((s) => s[parameter] === type);
};

const findWebhookTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be a string');
  return webhookTypes.find((s) => s.key === key);
};

module.exports = {
  webhookTypes,
  findZarponType,
  findZarponTypeByKey,
  findWebhookTypeByKey,
  findWebhookType,
};

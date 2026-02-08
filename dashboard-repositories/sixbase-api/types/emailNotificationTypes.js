const emailNotificationTypes = [
  {
    id: 1,
    name: 'Plano Cancelado',
  },
  {
    id: 2,
    name: 'Estorno de Produto',
  },
];

const findEmailNotificationType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = emailNotificationTypes.find(
    (s) => s[parameter] === type,
  );
  return selectedType;
};

module.exports = {
  emailNotificationTypes,
  findEmailNotificationType,
};

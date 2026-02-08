const embedTypes = [
  {
    id: 1,
    name: 'Vimeo',
    key: 'vimeo',
  },
  {
    id: 2,
    name: 'Youtube',
    key: 'youtube',
  },
  {
    id: 3,
    name: 'Panda',
    key: 'panda',
  },
  {
    id: 4,
    name: 'Membership',
    key: 'owner',
  },
  {
    id: 5,
    name: 'Panda_Owner',
    key: 'owner_panda',
  },
];

const findEmbedType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = embedTypes.find((s) => s[parameter] === type);
  return selectedType;
};

const findEmbedTypeByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = embedTypes.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  embedTypes,
  findEmbedType,
  findEmbedTypeByKey,
};

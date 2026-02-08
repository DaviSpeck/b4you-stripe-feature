const imageTypes = [
  {
    id: 1,
    label: 'Conteúdo do Mercado',
    key: 'market-content',
  },
  {
    id: 2,
    label: 'Imagem de Conteúdo',
    key: 'content',
  },
  {
    id: 3,
    label: 'Capa do Mercado',
    key: 'market-cover',
  },
];

const findImageType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'type' : 'id';
  return imageTypes.find((s) => s[parameter] === type);
};

const findImageTypeByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = imageTypes.find((s) => s[parameter] === type);
  return selectedType;
};
module.exports = {
  imageTypes,
  findImageType,
  findImageTypeByKey,
};

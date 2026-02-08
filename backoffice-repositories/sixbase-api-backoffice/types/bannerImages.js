const bannerTypes = [
  {
    id: 1,
    name: 'Desktop',
    type: 'desktop',
  },
  {
    id: 2,
    name: 'Mobile',
    type: 'mobile',
  },
];

const findBannerType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return bannerTypes.find((s) => s[parameter] === type);
};

const findBannerTypeByType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string') throw new Error('type must be string');
  return bannerTypes.find((s) => s.type === type);
};

module.exports = {
  bannerTypes,
  findBannerType,
  findBannerTypeByType,
};

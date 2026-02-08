const pixelsTypes = [
  {
    id: 1,
    name: 'Facebook',
    type: 'facebook',
  },
  {
    id: 2,
    name: 'Google Ads',
    type: 'google-ads',
  },
  {
    id: 3,
    name: 'Taboola',
    type: 'taboola',
  },
  {
    id: 4,
    name: 'Outbrain',
    type: 'outbrain',
  },
  {
    id: 5,
    name: 'Google Analytics',
    type: 'google-analytics',
  },
  {
    id: 6,
    name: 'TikTok',
    type: 'tiktok',
  },
  {
    id: 7,
    name: 'Kwai',
    type: 'kwai',
  },
  {
    id: 8,
    name: 'Pinterest',
    type: 'pinterest',
  },
];

const findPixelType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  return pixelsTypes.find((s) => s[parameter] === type);
};

const findPixelTypeByType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string') throw new Error('type must be string');
  return pixelsTypes.find((s) => s.type === type);
};

module.exports = {
  pixelsTypes,
  findPixelType,
  findPixelTypeByType,
};

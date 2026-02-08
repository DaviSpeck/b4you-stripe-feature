module.exports = (data) => {
  if (!data) throw new Error('data is not defined');
  if (Array.isArray(data))
    return data.map((d) => (typeof d.toJSON === 'function' ? d.toJSON() : d));
  return typeof data.toJSON === 'function' ? data.toJSON() : data;
};

export const convertIdToNano = (id) => {
  return `b4-${id.toString().padStart(10, '0')}`;
};

export const convertNanoToId = (nano) => {
  return nano.split('b4-').pop();
};

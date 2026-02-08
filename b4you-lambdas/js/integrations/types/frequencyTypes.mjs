export const getFrequency = (quantity, frequency) => {
  if (quantity === 2) return 'two-months';
  if (quantity === 3) return 'quarter';
  if (quantity === 6) return 'semester';
  return frequency;
};

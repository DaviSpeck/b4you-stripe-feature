const questionStatus = [
  {
    id: 1,
    label: 'Aguardando',
    color: '',
  },
  {
    id: 2,
    label: 'Respondido',
    color: 'warning light',
  },
];

const findQuestionStatus = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  return questionStatus.find((s) => s[parameter] === type);
};

module.exports = {
  questionStatus,
  findQuestionStatus,
};

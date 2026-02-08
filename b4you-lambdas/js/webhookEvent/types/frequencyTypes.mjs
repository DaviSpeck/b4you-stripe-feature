const frequency_types = ['month', 'two-months', 'quarter', 'semester', 'year'];

const frontEndFrequencies = [
  {
    key: 'month',
    label: 'Mensal',
    translate: 'mês',
  },
  {
    key: 'two-months',
    label: 'Bimestral',
    translate: 'bimestre',
  },
  {
    key: 'quarter',
    label: 'Trimestral',
    translate: 'trimestre',
  },
  {
    key: 'semester',
    label: 'Semestral',
    translate: 'semestre',
  },
  {
    key: 'year',
    label: 'Anual',
    translate: 'ano',
  },
];

const translateFrequency = (frequency) => {
  const [MONTH, , QUARTER] = frequency_types;
  switch (frequency) {
    case MONTH:
      return 'mensal';
    case QUARTER:
      return 'trimestral';
    default:
      return 'anual';
  }
};

export const translateToDatabase = (frequency) => {
  const [MONTH, TWOMONTHS, , SEMESTER] = frequency_types;
  switch (frequency) {
    case TWOMONTHS:
      return {
        frequency_quantity: 2,
        payment_frequency: MONTH,
        frequency_label: 'bimestral',
      };
    case SEMESTER:
      return {
        frequency_quantity: 6,
        payment_frequency: MONTH,
        frequency_label: 'semestral',
      };
    default:
      return {
        frequency_quantity: 1,
        payment_frequency: frequency,
        frequency_label: translateFrequency(frequency),
      };
  }
};

export const getFrequency = (quantity, frequency) => {
  if (quantity === 2) return 'two-months';
  if (quantity === 3) return 'quarter';
  if (quantity === 6) return 'semester';
  return frequency;
};

export const findFrequency = (label) => {
  if (!label) throw new Error('label must be provided');
  if (typeof label !== 'string') throw new Error('label must be string');
  return frontEndFrequencies.find((l) => l.label === label);
};

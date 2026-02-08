const managerPhaseTypes = [
  {
    id: 1,
    label: 'Novos Clientes',
    key: 'NOVOS_CLIENTES',
  },
  {
    id: 2,
    label: 'Negociação',
    key: 'NEGOCIACAO',
  },
  {
    id: 3,
    label: 'Implementação',
    key: 'IMPLEMENTACAO',
  },
  {
    id: 4,
    label: 'Pronto para Vender',
    key: 'PRONTO_PARA_VENDER',
  },
];

const findManagerPhaseType = (role) => {
  if (!role) return { id: 0, key: 'unknown', label: 'Não informado' };
  if (typeof role !== 'string' && typeof role !== 'number')
    return { id: 0, key: 'invalid', label: 'Inválido' };
  const parameter = typeof role === 'string' ? 'key' : 'id';
  const found = managerPhaseTypes.find((s) => s[parameter] === role);
  return found || { id: 0, key: 'unknown', label: 'Desconhecido' };
};

const findManagerPhaseTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return managerPhaseTypes.find((s) => s.key === key);
};

const findManagerPhaseTypeById = (id) => {
  if (!id) return null;
  if (typeof id !== 'number') return null;
  return managerPhaseTypes.find((s) => s.id === id);
};

module.exports = {
  managerPhaseTypes,
  findManagerPhaseType,
  findManagerPhaseTypeByKey,
  findManagerPhaseTypeById,
};


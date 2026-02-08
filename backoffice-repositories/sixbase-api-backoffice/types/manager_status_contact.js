const managerStatusContactTypes = [
  {
    id: 1,
    label: 'Não contatado',
    key: 'NAO_CONTATADO',
  },
  {
    id: 2,
    label: 'Em contato',
    key: 'EM_CONTATO',
  },
  {
    id: 3,
    label: 'Em acompanhamento',
    key: 'EM_ACOMPANHAMENTO',
  },
  {
    id: 4,
    label: 'Sem retorno',
    key: 'SEM_RETORNO',
  },
  {
    id: 5,
    label: 'Concluído',
    key: 'CONCLUIDO',
  },
  {
    id: 6,
    label: 'Concluído - Remover do fluxo',
    key: 'CONCLUIDO_REMOVIDO',
  },
];

const findManagerStatusContactType = (role) => {
  if (!role) return { id: 0, key: 'unknown', label: 'Não informado' };
  if (typeof role !== 'string' && typeof role !== 'number')
    return { id: 0, key: 'invalid', label: 'Inválido' };
  const parameter = typeof role === 'string' ? 'label' : 'id';
  const found = managerStatusContactTypes.find((s) => s[parameter] === role);
  return found || { id: 0, key: 'unknown', label: 'Desconhecido' };
};

const findManagerStatusContactTypeByKey = (key) => {
  if (!key) throw new Error('key must be provided');
  if (typeof key !== 'string') throw new Error('key must be string');
  return managerStatusContactTypes.find((s) => s.key === key);
};

module.exports = {
  managerStatusContactTypes,
  findManagerStatusContactType,
  findManagerStatusContactTypeByKey,
};

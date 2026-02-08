const productCategories = [
  {
    id: 1,
    label: 'Ambiente',
  },
  {
    id: 2,
    label: 'Animais e Plantas',
  },
  {
    id: 3,
    label: 'Desenvolvimento Pessoal',
  },
  {
    id: 4,
    label: 'Design',
  },
  {
    id: 5,
    label: 'Direito',
  },
  {
    id: 6,
    label: 'Educação',
  },
  {
    id: 7,
    label: 'Empreendedorismo Digital',
  },
  {
    id: 8,
    label: 'Entretenimento',
  },
  {
    id: 9,
    label: 'Espiritualidade',
  },
  {
    id: 10,
    label: 'Finanças',
  },
  {
    id: 11,
    label: 'Gastronomia',
  },
  {
    id: 12,
    label: 'Geral',
  },
  {
    id: 13,
    label: 'Hobbies',
  },
  {
    id: 14,
    label: 'Idiomas',
  },
  {
    id: 15,
    label: 'Internet',
  },
  {
    id: 16,
    label: 'Literatura',
  },
  {
    id: 17,
    label: 'Moda e Beleza',
  },
  {
    id: 18,
    label: 'Música e Arte',
  },
  {
    id: 19,
    label: 'Negócios e Carreira',
  },
  {
    id: 20,
    label: 'Prédios e Construções',
  },
  {
    id: 21,
    label: 'Relacionamentos',
  },
  {
    id: 22,
    label: 'Saúde e Esportes',
  },
  {
    id: 23,
    label: 'Sexualidade',
  },
  {
    id: 24,
    label: 'Software',
  },
  {
    id: 25,
    label: 'Tecnologia da Informação',
  },
  {
    id: 2000,
    label: 'Outros',
  },
];

const findProductCategories = (type) => {
  if (type === 0) return { label: 'Não definido' };
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'label' : 'id';
  const selectedType = productCategories.find((s) => s[parameter] === type);
  return selectedType;
};

const findProductCategoriesById = (id) => {
  if (!id) throw new Error('id must be provided');
  return productCategories.find((s) => s.id === id);
};

module.exports = {
  productCategories,
  findProductCategories,
  findProductCategoriesById,
};

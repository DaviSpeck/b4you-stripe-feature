'use strict';

const formTypes = [
  { id: 1, key: 'personalizado', label: 'Personalizado' },
  { id: 2, key: 'onboarding_creator', label: 'Onboarding Creator' },
  { id: 3, key: 'onboarding_marca', label: 'Onboarding Marca' },
];

const findFormTypeById = (id) =>
  formTypes.find((t) => t.id === Number(id)) || null;
const findFormTypeByKey = (key) =>
  formTypes.find((t) => t.key === String(key)) || null;

module.exports = {
  formTypes,
  findFormTypeById,
  findFormTypeByKey,
};

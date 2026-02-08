import _ from 'lodash';

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/**
 * @param {string} value Ex: (100.53)
 */
export const formatBRL = (value) => formatter.format(value).replace(/^(\D+)/, '$1');

export const capitalizeName = (name) => {
  if (!name) return '';
  name = name.toLowerCase().replace(/(?:^|\s)\S/g, (capitalize) => capitalize.toUpperCase());

  const PreposM = ['Da', 'De', 'Do', 'Das', 'Dos', 'A', 'E'];
  const prepos = ['da', 'de', 'do', 'das', 'dos', 'a', 'e'];

  for (let i = PreposM.length - 1; i >= 0; i -= 1) {
    name = name.replace(
      RegExp(`\\b${PreposM[i].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'g'),
      prepos[i]
    );
  }

  return name;
};

export const floatAmountToInteger = (amount) => _.round(amount * 100) || 0;

export const splitFullName = (name) => ({
  firstName: name.split(' ')[0],
  lastName: name.substring(name.split(' ')[0].length).trim(),
});

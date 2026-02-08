import { createHash } from 'crypto';

export const SHA256 = (data) => createHash('sha256').update(data).digest('hex');
export const splitFullName = (name) => ({
  firstName: name.split(' ')[0],
  lastName: name.substring(name.split(' ')[0].length).trim(),
});
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

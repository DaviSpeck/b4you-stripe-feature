const capitalize = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const formattedName = (name) => {
  if (!name) return 'Sem dados';

  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return capitalize(parts[0]);

  return `${capitalize(parts[0])} ${capitalize(parts[1])}`;
};

const formattedFullName = (fullName) => {
  if (!fullName) return 'Sem dados';

  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return capitalize(parts[0]);

  return parts.map((part) => capitalize(part)).join(' ');
};

export { formattedFullName, formattedName };

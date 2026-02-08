const generateRandomPassword = (size = 15) =>
  /* eslint no-bitwise: ["error", { "allow": ["~"] }] */
  [...Array(size)].map(() => (~~(Math.random() * 36)).toString(36)).join('');

const generateRandomCode = (size = 10) => generateRandomPassword(size);

const randomFixedInteger = (size) =>
  Math.floor(
    10 ** (size - 1) + Math.random() * (10 ** size - 10 ** (size - 1) - 1),
  );

module.exports = {
  generateRandomPassword,
  generateRandomCode,
  randomFixedInteger,
};

const { Op } = require('sequelize');

const formatWhere = (input) => {
  if (!input) return {};
  const trimmedInput = input.trim();
  let orObject = {};
  if (!trimmedInput.includes(' ')) {
    orObject = {
      full_name: { [Op.like]: `%${trimmedInput}%` },
      email: { [Op.like]: `%${trimmedInput}%` },
    };
  } else {
    orObject = {
      full_name: { [Op.like]: `%${trimmedInput}%` },
    };
  }

  const sanitizedInput = input.replace(/[^\d]/g, '');
  if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
    orObject = {
      ...orObject,
      document_number: { [Op.like]: `%${sanitizedInput}%` },
    };
  }

  if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
    orObject = {
      ...orObject,
      cnpj: { [Op.like]: `%${sanitizedInput}%` },
    };
  }

  return {
    [Op.or]: orObject,
  };
};

module.exports = { formatWhere };

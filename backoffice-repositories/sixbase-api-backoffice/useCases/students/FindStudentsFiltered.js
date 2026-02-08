const { Op } = require('sequelize');
const {
  findAllStudentFiltered,
} = require('../../database/controllers/students');

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

  return {
    [Op.or]: orObject,
  };
};

module.exports = class {
  constructor({ input, page, size }) {
    this.input = input;
    this.page = page;
    this.size = size;
  }

  async execute() {
    const where = formatWhere(this.input);
    const students = await findAllStudentFiltered(where, this.page, this.size);
    return students;
  }
};
const Answers = require('../models/Answers');

const createAnswer = async (data) => Answers.create(data);

const deleteAnswer = async (where) => Answers.destroy({ where });

const findOneAnswer = async (where) => Answers.findOne({ where });

module.exports = {
  createAnswer,
  deleteAnswer,
  findOneAnswer,
};

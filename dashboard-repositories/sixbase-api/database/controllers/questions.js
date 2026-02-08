const Questions = require('../models/Questions');
const Questions_history = require('../models/Questions_history');
const Students = require('../models/Students');
const Users = require('../models/Users');
const Products = require('../models/Products');
const Answers = require('../models/Answers');
const Modules = require('../models/Modules');
const Lessons = require('../models/Lessons');

const createQuestion = async (questionObj) => {
  const question = await Questions.create(questionObj);
  return question;
};

const findOneQuestion = async (where) => {
  const question = await Questions.findOne({
    where,
    nest: true,
    include: [
      {
        model: Answers,
        as: 'answers',
        order: [['id', 'asc']],
        separate: true,
        include: [
          {
            model: Students,
            as: 'student',
          },
          {
            model: Users,
            as: 'collaborator',
          },
        ],
      },
      {
        model: Students,
        as: 'student',
      },
      {
        model: Products,
        as: 'product',
        required: true,
      },
      {
        model: Modules,
        as: 'module',
        required: true,
      },
      {
        model: Lessons,
        as: 'lesson',
        required: true,
      },
    ],
  });
  return question;
};

const updateQuestion = async (where, data) => {
  const question = await Questions.update(data, { where });
  return question;
};

const deleteQuestion = async (where) => {
  const deleted = await Questions.destroy({
    where,
  });
  return deleted;
};

const findAllQuestions = async (where) => {
  const questions = await Questions.findAll({
    nest: true,
    where,
    include: [
      {
        model: Questions,
        as: 'answers',
        order: ['id', 'desc'],
        include: [
          {
            model: Users,
            as: 'producer',
          },
          {
            model: Students,
            as: 'student',
          },
          {
            model: Questions_history,
            as: 'history',
            order: ['id', 'desc'],
          },
        ],
      },
      {
        model: Users,
        as: 'producer',
      },
      {
        model: Students,
        as: 'student',
      },
      {
        model: Questions_history,
        as: 'history',
        order: ['id', 'desc'],
      },
    ],
  });
  return questions;
};

const findQuestionsPaginated = async (page, size, where) => {
  const limit = size;
  const offset = page * limit;
  const questions = await Questions.findAndCountAll({
    nest: true,
    where,
    limit,
    offset,
    include: [
      {
        model: Answers,
        as: 'answers',
        include: [
          {
            model: Students,
            as: 'student',
          },
          {
            model: Users,
            as: 'collaborator',
          },
        ],
      },
      {
        model: Students,
        as: 'student',
      },
      {
        model: Products,
        as: 'product',
      },
      {
        model: Modules,
        as: 'module',
      },
      {
        model: Lessons,
        as: 'lesson',
      },
    ],
  });
  return questions;
};

module.exports = {
  createQuestion,
  findOneQuestion,
  updateQuestion,
  deleteQuestion,
  findAllQuestions,
  findQuestionsPaginated,
};

const Lesson_comments = require('../models/Lesson_comments');

const createLessonComment = async (data, options = {}) =>
  Lesson_comments.create(data, options);

const updateLessonComment = async (where, data, options = {}) =>
  Lesson_comments.update(data, { where, ...options });

const findLessonComment = async (where, options = {}) =>
  Lesson_comments.findOne({ where, ...options });

const findLessonComments = async (where, options = {}) =>
  Lesson_comments.findAll({ where, ...options });

const deleteLessonComment = async (where, options = {}) =>
  Lesson_comments.destroy({ where, ...options });

module.exports = {
  createLessonComment,
  updateLessonComment,
  findLessonComment,
  findLessonComments,
  deleteLessonComment,
};


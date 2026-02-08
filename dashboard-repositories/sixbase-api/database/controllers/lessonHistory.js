const LessonHistory = require('../models/Study_history');

const createLessonHistory = async (historyObject) => {
  const lessonHistory = await LessonHistory.create(historyObject);
  return lessonHistory;
};

const updateLessonHistory = async (id, historyObject) => {
  const lessonHistory = await LessonHistory.update(historyObject, {
    where: { id },
  });

  return lessonHistory;
};

const findLessonHistory = async (where) => {
  const lessonHistory = await LessonHistory.findOne({
    raw: true,
    where,
  });

  return lessonHistory;
};

module.exports = {
  createLessonHistory,
  updateLessonHistory,
  findLessonHistory,
};

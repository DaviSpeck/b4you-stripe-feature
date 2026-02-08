const Lesson_notes = require('../models/Lesson_notes');

const createLessonNotes = async (data, t = null) => {
  const lessonNote = await Lesson_notes.create(
    data,
    t
      ? {
          transaction: t,
        }
      : null,
  );
  return lessonNote;
};

const updateLessonNotes = async (where, data) =>
  Lesson_notes.update(data, { where });

const findOneLessonNotes = async (where) => Lesson_notes.findOne({ where });

const findAllLessonNotes = async (where) => Lesson_notes.findAll({ where });

const deleteLessonNote = async (where) => Lesson_notes.destroy({ where });

module.exports = {
  createLessonNotes,
  deleteLessonNote,
  findAllLessonNotes,
  findOneLessonNotes,
  updateLessonNotes,
};

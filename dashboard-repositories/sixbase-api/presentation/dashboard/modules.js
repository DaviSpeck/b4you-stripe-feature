const SerializeSingleLesson = require('./lessons');
const { capitalizeName } = require('../../utils/formatters');

const calculateDuration = (lessons) => {
  if (!lessons || lessons.length === 0) return 0;
  const totalDuration = lessons.reduce((acc, { active, duration }) => {
    acc += active && duration;
    return acc;
  }, 0);

  return totalDuration;
};

const resolveLessons = (lessons) => {
  if (!lessons) return [];
  const orderedLessons = lessons.sort((a, b) => a.order - b.order);
  return new SerializeSingleLesson(orderedLessons).adapt();
};

const resolveClassrooms = (classrooms) =>
  classrooms.map(({ uuid, label, is_default }) => ({
    uuid,
    label,
    is_default,
  }));

const serializeSingleModule = (module) => {
  const {
    uuid,
    title,
    description,
    order,
    active,
    release,
    created_at,
    updated_at,
    lesson,
    classrooms,
    cover,
    cover_key,
  } = module;

  const lessons_duration = calculateDuration(lesson);
  return {
    uuid,
    title: capitalizeName(title),
    description: capitalizeName(description),
    order,
    active,
    release,
    classrooms: resolveClassrooms(classrooms),
    lessons_quantity: (lesson && lesson.length) || 0,
    lessons_duration,
    lessons: resolveLessons(lesson),
    cover,
    cover_key,
    created_at,
    updated_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleModule);
    }
    return serializeSingleModule(this.data);
  }
};

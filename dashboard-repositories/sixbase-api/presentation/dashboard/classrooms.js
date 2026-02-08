const { capitalizeName } = require('../../utils/formatters');

const serializeModules = (modules) =>
  modules &&
  modules.map(({ uuid, title, cover }) => ({
    uuid,
    title,
    cover,
  }));

const findLessons = (modules) => modules.map(({ lesson }) => lesson).flat();

const countModulesAndLessons = (modules) => {
  if (!modules)
    return {
      lessons_count: 0,
      modules_count: 0,
    };
  const lessons = findLessons(modules);
  return {
    lessons_count: lessons.length,
    modules_count: modules.length,
  };
};

const serializeClassroom = (classroom) => {
  const { label, is_default, uuid, created_at, updated_at, modules } =
    classroom;

  const { lessons_count, modules_count } = countModulesAndLessons(modules);
  return {
    uuid,
    label: capitalizeName(label),
    is_default,
    modules_count,
    lessons_count,
    modules: serializeModules(modules),
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
    if (Array.isArray(this.data)) return this.data.map(serializeClassroom);
    return serializeClassroom(this.data);
  }
};

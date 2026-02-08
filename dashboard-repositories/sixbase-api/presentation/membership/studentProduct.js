const { EBOOKTYPE } = require('../../types/productTypes');
const { slugify } = require('../../utils/formatters');
const { translateDurationToStringTime } = require('../common');
const { findProductCategoriesById } = require('../../types/productCategories');
const {
  serializeProducer,
  resolveType,
  resolveNextLesson,
} = require('../common');
const date = require('../../utils/helpers/date');

const serializeModules = (modules) => {
  const data = {
    lessons: 0,
    duration: translateDurationToStringTime(0),
    progress: 0,
  };

  if (modules.length === 0) {
    return data;
  }

  const activeLessons = modules
    .map(({ lesson }) => lesson)
    .flat()
    .filter(({ active }) => active);

  const statistics = activeLessons.reduce(
    (acc, { video, study_history }) => {
      acc.done += study_history && study_history.done ? 1 : 0;
      acc.totalDuration += video ? video.duration : 0;
      return acc;
    },
    { done: 0, totalDuration: 0 },
  );

  const [last_viewed] = activeLessons
    .filter(({ study_history }) => !!study_history)
    .map(({ study_history }) => study_history)
    .flat()
    .sort((a, b) => date(b.updated_at).now() - date(a.updated_at).now());

  const progress = statistics.done / activeLessons.length;
  return {
    lessons: activeLessons.length,
    duration: translateDurationToStringTime(statistics.totalDuration),
    progress: progress ? Number(progress.toFixed(2)) : 0,
    last_viewed_date: last_viewed ? last_viewed.updated_at : null,
  };
};

const serializeSingleCourseItem = (courseItem) => {
  const {
    product: {
      uuid,
      name,
      description,
      cover,
      cover_custom,
      logo,
      producer,
      excerpt,
      thumbnail,
      id_type,
      ebook_cover,
      nickname,
      category,
      anchor_view,
    },
    classroom,
  } = courseItem;

  if (id_type === EBOOKTYPE)
    return {
      uuid,
      name,
      description,
      cover,
      cover_custom,
      excerpt,
      thumbnail,
      next_lesson_id: null,
      slug: slugify(name),
      type: resolveType(id_type),
      producer: serializeProducer({ nickname, ...producer }),
      nickname,
      url_logo: logo,
      duration: null,
      total_lessons: null,
      progress: null,
      ebook_cover,
      category: findProductCategoriesById(category),
    };

  const statistics = serializeModules(classroom ? classroom.modules : []);
  const nextLesson = resolveNextLesson(classroom ? classroom.modules : []);
  return {
    uuid,
    name,
    description,
    cover,
    cover_custom,
    excerpt,
    thumbnail,
    next_lesson_id: nextLesson ? nextLesson.uuid : null,
    last_viewed_date: statistics.last_viewed_date,
    slug: slugify(name),
    type: resolveType(id_type),
    producer: serializeProducer({ nickname, ...producer }),
    url_logo: logo,
    duration: statistics.duration,
    total_lessons: statistics.lessons,
    progress: statistics.progress,
    ebook_cover,
    category: findProductCategoriesById(category),
    anchor_view,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleCourseItem);
    }
    return serializeSingleCourseItem(this.data);
  }
};

const { slugify } = require('../../utils/formatters');
const {
  serializeProducer,
  resolveType,
  resolveNextLesson,
} = require('../common');

const serializeModules = (modules) => {
  const data = {
    lessons: 0,
    duration: 0,
    progress: 0,
  };
  if (!modules.length === 0) {
    return data;
  }

  let doneLessons = 0;
  let totalDuration = 0;
  let totalLessons = 0;

  modules.forEach(({ lesson }) => {
    lesson.forEach(({ active, duration, study_history }) => {
      if (active) {
        totalDuration += duration;
        totalLessons += 1;
      }
      if (active && study_history && study_history.done) {
        doneLessons += 1;
      }
    });
  });

  const progress = doneLessons / totalLessons;
  const duration = Math.round(totalDuration / 60);
  return {
    lessons: totalLessons,
    duration: `${duration} ${duration === 1 ? 'Hora' : 'Horas'}`,
    progress: progress ? Number(progress.toFixed(2)) : 0,
  };
};

const serializeSingleSale = (sale) => {
  const { products } = sale;
  let totalSales = {};
  products.forEach(
    ({
      type,
      product: {
        uuid,
        name,
        description,
        cover,
        logo,
        module,
        producer,
        excerpt,
        thumbnail,
      },
    }) => {
      const statistics = serializeModules(module);
      const nextLesson = resolveNextLesson(module);
      totalSales = {
        uuid,
        name,
        description,
        cover,
        excerpt,
        thumbnail,
        next_lesson_id: nextLesson ? nextLesson.uuid : null,
        slug: slugify(name),
        type: resolveType(type),
        producer: serializeProducer(producer),
        url_logo: logo,
        duration: statistics.duration,
        total_lessons: statistics.lessons,
        progress: statistics.progress,
      };
    },
  );
  return totalSales;
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSale);
    }
    return serializeSingleSale(this.data);
  }
};

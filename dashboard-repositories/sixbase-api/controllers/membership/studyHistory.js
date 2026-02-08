const ApiError = require('../../error/ApiError');
const dateHelper = require('../../utils/helpers/date');
const Cache = require('../../config/Cache');
const {
  updateLessonHistory,
} = require('../../database/controllers/lessonHistory');
const { findSalesStudent } = require('../../database/controllers/sales');
const {
  createStudentProgress,
  findOneStudentProgress,
} = require('../../database/controllers/student_progress');
const db = require('../../database/models');

const verifyAndMarkCourseAsFinished = async (id_product, id_student) => {
  const studentProgress = await findOneStudentProgress(id_student, id_product);
  if (studentProgress) return true;
  const sale = await findSalesStudent(id_student, id_product);
  if (!sale) return false;
  const [saleItem] = sale.products;
  const {
    product: { module },
  } = saleItem;
  const lessons = module.map(({ lesson }) => lesson).flat();
  const activeLessons = lessons.filter(({ active }) => active === true);
  const doneLessons = lessons.reduce((acc, lesson) => {
    const { study_history } = lesson;
    if (study_history && study_history.done === true) acc += 1;
    return acc;
  }, 0);
  const finished = doneLessons === activeLessons.length;
  if (finished) {
    const totalDuration = lessons.reduce((acc, { duration }) => {
      acc += duration;
      return acc;
    }, 0);
    const hours = totalDuration / 60 / 60;
    createStudentProgress({
      id_student,
      id_product,
      hours,
      finished_at: dateHelper().now(),
    });
  }
  return finished;
};

const updateHistoryController = async (req, res, next) => {
  const { history, data, student } = req;
  try {
    if (data?.time) {
      data.time = parseInt(data.time, 10);
    }
    await updateLessonHistory(history.id, data);
    const finished = await verifyAndMarkCourseAsFinished(
      history.id_product,
      student.id,
    );

    const { products } = db.sequelize.models;
    const product = await products.findOne({
      attributes: ['uuid'],
      where: { id: history.id_product },
    });

    if (product) {
      const cacheKey = `student_product_full:${product.uuid}:${student.id}`;
      await Cache.del(cacheKey);
    }

    return res
      .status(200)
      .send({ success: true, message: 'Lesson history updated', finished });
  } catch (error) {
    console.log('error lesson2', error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  updateHistoryController,
};

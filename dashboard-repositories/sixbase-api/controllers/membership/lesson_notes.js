const ApiError = require('../../error/ApiError');
const {
  createLessonNotes,
  deleteLessonNote,
  findAllLessonNotes,
  findOneLessonNotes,
} = require('../../database/controllers/lesson_notes');
const SerializeNotes = require('../../presentation/membership/lessonsNotes');

module.exports.createLessonNoteController = async (req, res, next) => {
  const {
    student: { id: id_student },
    lesson: { id_product, id: id_lesson },
    body: { title, note },
  } = req;
  try {
    await createLessonNotes({ id_product, id_lesson, id_student, title, note });
    return res
      .status(200)
      .send({ success: true, message: 'Nota criada com sucesso' });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

module.exports.getLessonNotesController = async (req, res, next) => {
  const {
    student: { id: id_student },
    lesson: { id_product, id: id_lesson },
  } = req;
  try {
    const lessonNotes = await findAllLessonNotes({
      id_product,
      id_lesson,
      id_student,
    });
    return res.status(200).send(new SerializeNotes(lessonNotes).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

module.exports.deleteLessonNoteController = async (req, res, next) => {
  const {
    student: { id: id_student },
    lesson: { id_product, id: id_lesson },
    params: { note_id: uuid },
  } = req;
  try {
    const lessonNote = await findOneLessonNotes({
      id_product,
      id_lesson,
      id_student,
      uuid,
    });
    if (!lessonNote) throw ApiError.badRequest('Nota não encontrada.');
    await deleteLessonNote({
      id_product,
      id_lesson,
      id_student,
      uuid,
    });
    return res
      .status(200)
      .send({ success: true, message: 'Nota deletada com sucesso' });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

module.exports.findLessonNoteByProductController = async (req, res, next) => {
  const {
    student: { id: id_student },
    product,
  } = req;
  try {
    const lessonNotesProduct = await findAllLessonNotes({
      id_product: product.id,
      id_student,
    });
    return res.status(200).send(lessonNotesProduct);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

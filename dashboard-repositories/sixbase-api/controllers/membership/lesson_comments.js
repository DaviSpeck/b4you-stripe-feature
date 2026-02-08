const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const Products = require('../../database/models/Products');
const {
  createLessonComment,
  deleteLessonComment,
  findLessonComment,
  findLessonComments,
  updateLessonComment,
} = require('../../database/controllers/lesson_comments');
const LessonCommentsPresenter = require('../../presentation/membership/lessonComments');

const MAX_COMMENT_LENGTH = 2000;

const loadProductSettings = async (id_product) =>
  Products.findOne({
    raw: true,
    attributes: [
      'id',
      'membership_comments_enabled',
      'membership_comments_auto_approve',
    ],
    where: { id: id_product },
  });

const normalizeContent = (content = '') => content.trim();

module.exports.getLessonCommentsController = async (req, res, next) => {
  const {
    lesson: { id: id_lesson, id_product },
    student: { id: id_student },
  } = req;

  try {
    const product = await loadProductSettings(id_product);

    if (!product || !product.membership_comments_enabled) {
      return res.status(200).send({
        settings: {
          enabled: !!product?.membership_comments_enabled,
          auto_approve: !!product?.membership_comments_auto_approve,
        },
        comments: [],
      });
    }

    const comments = await findLessonComments(
      {
        id_lesson,
        id_product,
        [Op.or]: [{ status: 'approved' }, { id_student }],
      },
      {
        order: [['created_at', 'ASC']],
        include: [
          {
            association: 'student',
            attributes: ['uuid', 'full_name', 'profile_picture'],
          },
        ],
      },
    );

    const presenter = new LessonCommentsPresenter(comments, id_student);

    return res.status(200).send({
      settings: {
        enabled: product.membership_comments_enabled,
        auto_approve: product.membership_comments_auto_approve,
      },
      comments: presenter.adapt(),
    });
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

module.exports.createLessonCommentController = async (req, res, next) => {
  const {
    lesson: { id: id_lesson, id_product },
    student: { id: id_student },
    body: { content },
  } = req;

  try {
    const product = await loadProductSettings(id_product);
    if (!product || !product.membership_comments_enabled) {
      throw ApiError.badRequest('Comentários desativados para este curso.');
    }

    const normalizedContent = normalizeContent(content);
    if (!normalizedContent) {
      throw ApiError.badRequest('O comentário não pode ser vazio.');
    }
    if (normalizedContent.length > MAX_COMMENT_LENGTH) {
      throw ApiError.badRequest(
        `O comentário deve ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`,
      );
    }

    const autoApprove = product.membership_comments_auto_approve;

    const comment = await createLessonComment({
      id_lesson,
      id_product,
      id_student,
      content: normalizedContent,
      status: autoApprove ? 'approved' : 'pending',
      auto_approved: autoApprove,
      approved_by: null,
      approved_at: autoApprove ? new Date() : null,
    });

    const commentWithRelations = await findLessonComment(
      { id: comment.id },
      {
        include: [
          {
            association: 'student',
            attributes: ['uuid', 'full_name', 'profile_picture'],
          },
        ],
      },
    );

    const presenter = new LessonCommentsPresenter(
      [commentWithRelations],
      id_student,
    );

    return res.status(201).send({
      settings: {
        enabled: product.membership_comments_enabled,
        auto_approve: product.membership_comments_auto_approve,
      },
      comment: presenter.adapt()[0],
    });
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

module.exports.updateLessonCommentController = async (req, res, next) => {
  const {
    lesson: { id: id_lesson, id_product },
    student: { id: id_student },
    params: { comment_id: uuid },
    body: { content },
  } = req;

  try {
    const product = await loadProductSettings(id_product);
    if (!product || !product.membership_comments_enabled) {
      throw ApiError.badRequest('Comentários desativados para este curso.');
    }

    const existingComment = await findLessonComment({
      uuid,
      id_lesson,
      id_product,
    });

    if (!existingComment) {
      throw ApiError.badRequest('Comentário não encontrado.');
    }

    if (existingComment.id_student !== id_student) {
      throw ApiError.badRequest(
        'Você não tem permissão para editar este comentário.',
      );
    }

    const normalizedContent = normalizeContent(content);
    if (!normalizedContent) {
      throw ApiError.badRequest('O comentário não pode ser vazio.');
    }
    if (normalizedContent.length > MAX_COMMENT_LENGTH) {
      throw ApiError.badRequest(
        `O comentário deve ter no máximo ${MAX_COMMENT_LENGTH} caracteres.`,
      );
    }

    const autoApprove = product.membership_comments_auto_approve;

    await updateLessonComment(
      { id: existingComment.id },
      {
        content: normalizedContent,
        status: autoApprove ? 'approved' : 'pending',
        auto_approved: autoApprove,
        approved_by: null,
        approved_at: autoApprove ? new Date() : null,
      },
    );

    const updatedComment = await findLessonComment(
      { id: existingComment.id },
      {
        include: [
          {
            association: 'student',
            attributes: ['uuid', 'full_name', 'profile_picture'],
          },
        ],
      },
    );

    const presenter = new LessonCommentsPresenter(
      [updatedComment],
      id_student,
    );

    return res.status(200).send({
      comment: presenter.adapt()[0],
    });
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

module.exports.deleteLessonCommentController = async (req, res, next) => {
  const {
    lesson: { id: id_lesson, id_product },
    student: { id: id_student },
    params: { comment_id: uuid },
  } = req;

  try {
    const existingComment = await findLessonComment({
      uuid,
      id_lesson,
      id_product,
    });

    if (!existingComment) {
      throw ApiError.badRequest('Comentário não encontrado.');
    }

    if (existingComment.id_student !== id_student) {
      throw ApiError.badRequest(
        'Você não tem permissão para excluir este comentário.',
      );
    }

    await deleteLessonComment({ id: existingComment.id });

    return res.status(200).send({
      success: true,
    });
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


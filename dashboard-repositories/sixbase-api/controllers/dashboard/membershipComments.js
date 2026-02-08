const ApiError = require('../../error/ApiError');
const LessonComments = require('../../database/models/Lesson_comments');
const {
  deleteLessonComment,
  findLessonComment,
  updateLessonComment,
} = require('../../database/controllers/lesson_comments');
const { findOneLesson } = require('../../database/controllers/lessons');
const { updateProduct } = require('../../database/controllers/products');
const MembershipCommentsPresenter = require('../../presentation/dashboard/membershipComments');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const resolvePagination = (pageParam, sizeParam) => {
  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const size = Math.min(
    Math.max(parseInt(sizeParam, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  return {
    page,
    size,
    offset: (page - 1) * size,
  };
};

module.exports.getMembershipCommentSettingsController = async (
  req,
  res,
  next,
) => {
  try {
    const { product } = req;
    return res.status(200).send({
      enabled: !!product.membership_comments_enabled,
      auto_approve: !!product.membership_comments_auto_approve,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${
          req.originalUrl
        }`,
        error,
      ),
    );
  }
};

module.exports.updateMembershipCommentSettingsController = async (
  req,
  res,
  next,
) => {
  const {
    product: { id: id_product },
    body: { enabled, auto_approve },
  } = req;

  try {
    await updateProduct(id_product, {
      membership_comments_enabled: enabled,
      membership_comments_auto_approve: auto_approve,
    });

    req.product.membership_comments_enabled = enabled;
    req.product.membership_comments_auto_approve = auto_approve;

    return res.status(200).send({
      enabled,
      auto_approve,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${
          req.originalUrl
        }`,
        error,
      ),
    );
  }
};

module.exports.listMembershipCommentsController = async (req, res, next) => {
  const {
    product: { id: id_product },
    query: { status = 'pending', lesson_uuid, page, size },
  } = req;

  try {
    const { size: limit, offset, page: currentPage } = resolvePagination(
      page,
      size,
    );

    const where = {
      id_product,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (lesson_uuid) {
      const lesson = await findOneLesson({
        uuid: lesson_uuid,
      });
      if (!lesson || lesson.module?.id_product !== id_product) {
        throw ApiError.badRequest('Aula não encontrada para este curso.');
      }
      where.id_lesson = lesson.id;
    }

    const { rows, count } = await LessonComments.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          association: 'lesson',
          attributes: ['uuid', 'title'],
          include: [
            {
              association: 'module',
              attributes: ['uuid', 'title'],
            },
          ],
        },
        {
          association: 'student',
          attributes: ['uuid', 'full_name', 'email'],
        },
        {
          association: 'moderator',
          attributes: ['uuid', 'full_name', 'first_name', 'last_name'],
        },
      ],
    });

    const presenter = new MembershipCommentsPresenter(rows);

    return res.status(200).send({
      count,
      page: currentPage,
      size: limit,
      comments: presenter.adapt(),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${
          req.originalUrl
        }`,
        error,
      ),
    );
  }
};

module.exports.updateMembershipCommentStatusController = async (
  req,
  res,
  next,
) => {
  const {
    product: { id: id_product },
    params: { comment_id: uuid },
    body: { status },
    user: { id: id_user },
  } = req;

  const allowedStatuses = ['approved', 'rejected', 'pending'];

  try {
    if (!allowedStatuses.includes(status)) {
      throw ApiError.badRequest('Status inválido.');
    }

    const comment = await findLessonComment({
      uuid,
      id_product,
    });

    if (!comment) {
      throw ApiError.badRequest('Comentário não encontrado.');
    }

    const updatePayload = {
      status,
      auto_approved: false,
    };

    if (status === 'approved') {
      updatePayload.approved_by = id_user;
      updatePayload.approved_at = new Date();
    } else if (status === 'pending') {
      updatePayload.approved_by = null;
      updatePayload.approved_at = null;
    } else {
      updatePayload.approved_by = id_user;
      updatePayload.approved_at = new Date();
    }

    await updateLessonComment({ id: comment.id }, updatePayload);

    const updated = await LessonComments.findOne({
      where: { id: comment.id },
      include: [
        {
          association: 'lesson',
          attributes: ['uuid', 'title'],
          include: [
            {
              association: 'module',
              attributes: ['uuid', 'title'],
            },
          ],
        },
        {
          association: 'student',
          attributes: ['uuid', 'full_name', 'email'],
        },
        {
          association: 'moderator',
          attributes: ['uuid', 'full_name', 'first_name', 'last_name'],
        },
      ],
    });

    const presenter = new MembershipCommentsPresenter([updated]);

    return res.status(200).send({
      comment: presenter.adapt()[0],
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${
          req.originalUrl
        }`,
        error,
      ),
    );
  }
};

module.exports.deleteMembershipCommentController = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { comment_id: uuid },
  } = req;

  try {
    const comment = await findLessonComment({
      uuid,
      id_product,
    });

    if (!comment) {
      throw ApiError.badRequest('Comentário não encontrado.');
    }

    await deleteLessonComment({ id: comment.id });

    return res.status(200).send({ success: true });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${
          req.originalUrl
        }`,
        error,
      ),
    );
  }
};


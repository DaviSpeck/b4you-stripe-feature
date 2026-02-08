const express = require('express');

const router = express.Router();
const {
  getProductByUUID,
  getLessonByUUID,
  getStudentCourses,
  getStudentEbooks,
  downloadEBOOKController,
  downloadCertificateController,
  getHomeProductController,
  getTemplate,
} = require('../../controllers/membership/products');
const { downloadAttachmentController } = require('../../controllers/common');
const {
  findStudentProductByUUIDAdapter,
  isEbookProduct,
  isFinishedCourse,
  isVideoProduct,
  findSelectedAttachment,
  findEbook,
  findLessonAccessContextAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');
const LessonNotesController = require('../../controllers/membership/lesson_notes');
const MembershipPlugins = require('../../database/models/MembershipPlugins');
const {
  findMembershipPluginType,
} = require('../../types/membershipPluginsTypes');
const ApiError = require('../../error/ApiError');
const Products = require('../../database/models/Products');
const {
  getMembershipPageLayoutByProduct,
} = require('../../controllers/membership/membershipPageLayout');
const {
  getRecommendedProductsWithAccess,
} = require('../../controllers/membership/recommendedProducts');

router.get('/template/:product_id', getTemplate);

router.get('/home', getHomeProductController);

router.get('/courses', getStudentCourses);

router.get('/ebooks', getStudentEbooks);

router.get(
  '/:product_id/page-layout',
  findStudentProductByUUIDAdapter,
  getMembershipPageLayoutByProduct,
);

// Recommended products (student view)
router.get(
  '/:product_id/recommended-products',
  findStudentProductByUUIDAdapter,
  getRecommendedProductsWithAccess,
);

router.get(
  '/:product_id/notes',
  findStudentProductByUUIDAdapter,
  LessonNotesController.findLessonNoteByProductController,
);

router.get('/:product_id/membership-plugins', async (req, res, next) => {
  const {
    params: { product_id: uuid },
  } = req;
  try {
    const product = await Products.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        uuid,
      },
    });
    if (!product) {
      throw ApiError.badRequest('Produto não encontrado');
    }
    const plugins = await MembershipPlugins.findAll({
      raw: true,
      attributes: ['uuid', 'id_plugin', 'settings'],
      where: {
        id_product: product.id,
      },
    });
    return res.status(200).send({
      plugins: plugins.map((p) => ({
        ...p,
        type: findMembershipPluginType(p.id_plugin),
      })),
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
});

router.get('/:product_id', findStudentProductByUUIDAdapter, getProductByUUID);

router.get(
  '/:product_id/:lesson_id',
  findLessonAccessContextAdapter,
  getLessonByUUID,
);

router.get(
  '/pdf/download/:product_id/:ebook_id',
  findStudentProductByUUIDAdapter,
  isEbookProduct,
  findEbook,
  downloadEBOOKController,
);

router.get(
  '/certificate/download/:product_id',
  findStudentProductByUUIDAdapter,
  isFinishedCourse,
  downloadCertificateController,
);

router.get(
  '/attachment/download/:product_id/:attachment_id',
  findStudentProductByUUIDAdapter,
  isVideoProduct,
  findSelectedAttachment,
  downloadAttachmentController,
);

module.exports = router;

const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const createLessonDTO = require('../../dto/lessons/createLesson');
const updateLessonDTO = require('../../dto/lessons/updateLesson');
const updateOrderDTO = require('../../dto/lessons/updateLessonOrder');
const uploadAttachmentDTO = require('../../dto/lessons/uploadAttachment');

const router = express.Router();

const {
  validateCreateLesson,
  validateUpdateLesson,
  validateUpdateOrder,
  validateLessonAttachment,
  findAndOrderProductLessons,
  findLessonsByUUID,
} = require('../../middlewares/validatorsAndAdapters/lessons');
const { downloadAttachmentController } = require('../../controllers/common');
const {
  validateModule,
} = require('../../middlewares/validatorsAndAdapters/modules');
const {
  validateLesson,
} = require('../../middlewares/validatorsAndAdapters/common');
const {
  createLessonController,
  updateLessonController,
  updateOrderController,
  deleteAttachmentController,
  changeModuleLessonAndReorderController,
  deleteLessonController,
  confirmVideoUploadController,
  deleteLessonVideoController,
  uploadAttachmentController,
} = require('../../controllers/dashboard/lessons');

const {
  findAndOrderProductModules,
} = require('../../middlewares/validatorsAndAdapters/modules');

router.post(
  '/:module_id',
  validateDTO(createLessonDTO),
  findAndOrderProductModules,
  validateModule,
  validateCreateLesson,
  createLessonController,
);

router.put(
  '/:lesson_id',
  validateDTO(updateLessonDTO),
  findAndOrderProductModules,
  validateLesson,
  validateUpdateLesson,
  updateLessonController,
);

router.put(
  '/:lesson_uuid/attachment',
  validateDTO(uploadAttachmentDTO),
  uploadAttachmentController,
);

router.put(
  '/:module_id/reorder',
  validateDTO(updateOrderDTO),
  findAndOrderProductModules,
  validateModule,
  findAndOrderProductLessons,
  validateUpdateOrder,
  updateOrderController,
);

router.put(
  '/:module_id/change/module',
  validateDTO(updateOrderDTO),
  findAndOrderProductModules,
  validateModule,
  findLessonsByUUID,
  changeModuleLessonAndReorderController,
);

router.delete(
  '/:lesson_id/:attachment_id',
  findAndOrderProductModules,
  validateLesson,
  validateLessonAttachment,
  deleteAttachmentController,
);

router.delete(
  '/:lesson_id',
  findAndOrderProductModules,
  validateLesson,
  deleteLessonController,
);

router.put(
  '/:lesson_id/confirm/upload',
  findAndOrderProductModules,
  validateLesson,
  confirmVideoUploadController,
);

router.get('/attachment/download/:attachment_id', downloadAttachmentController);

router.delete('/:lesson_id/remove/video', deleteLessonVideoController);

module.exports = router;

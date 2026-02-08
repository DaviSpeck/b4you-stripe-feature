const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const migrateStudentsDTO = require('../../dto/students/migrateStudents');
const {
  createOrUpdateImportStudentController,
  filterClassroomsStudents,
  findAllStudentsController,
  getStudentsSummaryController,
  migrateAllStudentsController,
  migrateSingleStudentController,
  exportStudentsController,
  importStudentsFileController,
  removeStudentProductController,
  sendEmailStudentController,
  removeAccessProductStudentController,
} = require('../../controllers/dashboard/students');
const {
  findSelectedClassroom,
} = require('../../middlewares/validatorsAndAdapters/classrooms');
const {
  findSelectedStudent,
  verifyIfStudentPurchasedProduct,
} = require('../../middlewares/validatorsAndAdapters/students');
const validateDto = require('../../middlewares/validate-dto');
const importStudentDto = require('../../dto/students/importStudents');
const importStudentsFileSchema = require('../../dto/students/importStudentsFile');

const router = express.Router();

router.get('/', findAllStudentsController);

router.get('/summary', getStudentsSummaryController);

router.put('/remove', removeStudentProductController);

router.get('/filters', filterClassroomsStudents);

router.put(
  '/migrate/:classroom_id',
  validateDTO(migrateStudentsDTO),
  findSelectedClassroom(),
  findSelectedStudent,
  verifyIfStudentPurchasedProduct,
  migrateSingleStudentController,
);

router.put(
  '/migrate/all/:classroom_from/:classroom_id',
  findSelectedClassroom(),
  findSelectedClassroom('classroom_from', 'classroom_from'),
  migrateAllStudentsController,
);

router.post(
  '/import',
  validateDto(importStudentDto),
  createOrUpdateImportStudentController,
);

router.post(
  '/import-file',
  validateDto(importStudentsFileSchema),
  importStudentsFileController,
);

router.get('/export', exportStudentsController);

router.post('/:studentUuid/email', sendEmailStudentController);

router.delete('/:studentUuid/remove', removeAccessProductStudentController);

module.exports = router;

const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const createClassRoomDTO = require('../../dto/classrooms/createClassroom');
const updateClassroomDTO = require('../../dto/classrooms/updateClassroom');
const {
  createClassroomController,
  findAllClassroomsController,
  updateClassroomController,
  deleteClassroomController,
  findAllClassroomsControllerPreview,
} = require('../../controllers/dashboard/classrooms');
const {
  findDefaultClassroom,
  validateCreateClassroom,
  findSelectedClassroom,
  validateUpdateClassroom,
  isThereAnyStudents,
  isThereAnyOffer,
} = require('../../middlewares/validatorsAndAdapters/classrooms');

const router = express.Router();

router.get('/', findAllClassroomsController);

router.get('/preview', findAllClassroomsControllerPreview);

router.post(
  '/',
  validateDTO(createClassRoomDTO),
  findDefaultClassroom,
  validateCreateClassroom,
  createClassroomController,
);

router.put(
  '/:classroom_id',
  validateDTO(updateClassroomDTO),
  findSelectedClassroom(),
  findDefaultClassroom,
  validateUpdateClassroom,
  updateClassroomController,
);

router.delete(
  '/:classroom_id',
  findSelectedClassroom(),
  isThereAnyOffer,
  isThereAnyStudents,
  deleteClassroomController,
);

module.exports = router;

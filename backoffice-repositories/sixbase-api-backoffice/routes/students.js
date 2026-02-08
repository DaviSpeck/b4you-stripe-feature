const express = require('express');

const router = express.Router();
const StudentController = require('../controllers/students');
const validateDto = require('../middlewares/validate-dto');
const updateEmailDTO = require('../dto/students/updateEmail');

router.put(
  '/update/email/:student_uuid',
  validateDto(updateEmailDTO),
  StudentController.updateStudentEmail,
);

router.get('/', StudentController.findStudentsSales);

router.get('/:studentUuid', StudentController.findStudentsData);

router.post('/:studentUuid/email', StudentController.sendStudentsRecoverEmail);

router.put('/:studentUuid/change-email/support', StudentController.changeEmail);

router.get('/:studentUuid/notes', StudentController.getNotes);

router.post('/:studentUuid/notes', StudentController.createNote);

router.delete('/:studentUuid/notes/:id', StudentController.deleteNote);

module.exports = router;

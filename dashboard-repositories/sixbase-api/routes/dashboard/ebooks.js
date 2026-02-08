const router = require('express').Router();
const validateDto = require('../../middlewares/validate-dto');
const uploadEbookDTO = require('../../dto/products/uploadEbook');
const updateFilesDescriptionDTO = require('../../dto/products/updateFIlesDescription');
const {
  isThereAnEbook,
} = require('../../middlewares/validatorsAndAdapters/ebooks');
const {
  uploadEbookController,
  findEbooksController,
  donwloadEbookController,
  deleteEbookController,
  updateFIlesDescriptionController,
  updateAllowPiracyWatermark,
} = require('../../controllers/dashboard/ebooks');

router.put('/', validateDto(uploadEbookDTO), uploadEbookController);

router.put(
  '/files-description',
  validateDto(updateFilesDescriptionDTO),
  updateFIlesDescriptionController,
);

router.get('/', findEbooksController);

router.get('/download/:ebook_id', isThereAnEbook, donwloadEbookController);

router.delete('/:ebook_id', isThereAnEbook, deleteEbookController);

router.put('/update/:ebook_id', isThereAnEbook, updateAllowPiracyWatermark);

module.exports = router;

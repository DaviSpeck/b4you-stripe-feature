const multer = require('../multer');
const localStorage = require('../storages/localStorage');
const uploadsDir = require('../uploadDir');
const limits = require('../limits/common');
const { validFileFilter } = require('../fileFilters');

const allowedMimes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
];

module.exports = multer({
  uploadsDir,
  storage: localStorage,
  fileFilter: validFileFilter(allowedMimes),
  limits,
});

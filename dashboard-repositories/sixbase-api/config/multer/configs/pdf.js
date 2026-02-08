const multer = require('../multer');
const localStorage = require('../storages/localStorage');
const uploadsDir = require('../uploadDir');
const limits = require('../limits/common');
const { validFileFilter } = require('../fileFilters');

const allowedMimes = ['application/pdf'];

module.exports = multer({
  uploadsDir,
  storage: localStorage,
  fileFilter: validFileFilter(allowedMimes),
  limits,
});

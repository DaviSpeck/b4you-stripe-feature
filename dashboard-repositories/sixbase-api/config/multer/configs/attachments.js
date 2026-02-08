const multer = require('../multer');
const localStorage = require('../storages/localStorage');
const uploadsDir = require('../uploadDir');
const limits = require('../limits/common');
const { invalidFileFIlter } = require('../fileFilters');

const notAllowedMimes = [
  'application/octet-stream',
  'application/x-csh',
  'application/x-msdos-program',
];

module.exports = multer({
  uploadsDir,
  storage: localStorage,
  fileFilter: invalidFileFIlter(notAllowedMimes),
  limits,
});

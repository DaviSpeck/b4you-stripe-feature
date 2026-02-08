const multer = require('multer');
const _ = require('lodash');
const { v4 } = require('../../../utils/helpers/uuid');
const { generateRandomCode } = require('../../../utils/generators');

module.exports = (uploadDir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const file_extension = _.last(file.originalname.split('.'));
      file.key = `${v4()}-${generateRandomCode(4)}.${file_extension}`;
      cb(null, file.key);
    },
  });

const validateFileUpload = require('./validateFileUpload');

const allowedImagesExtensions = ['image/jpeg', 'image/png', 'image/jpg'];

const imageFilter = (extension) => allowedImagesExtensions.includes(extension);

module.exports = validateFileUpload({
  maxSize: 10,
  unity: 'MB',
  fileFilter: imageFilter,
});

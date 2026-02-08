module.exports = ({ uploadsDir, storage, limits, fileFilter }) => ({
  dest: uploadsDir,
  storage: storage(uploadsDir),
  limits,
  fileFilter,
});

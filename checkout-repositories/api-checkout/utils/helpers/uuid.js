const { v4: uuidv4, validate } = require('uuid');
const { nanoid } = require('nanoid');

const uuidHelper = (uuidProvider) => ({
  v4: () => uuidProvider(),
  validate: (uuid) => validate(uuid),
  nanoid: (size = 21) => nanoid(size),
});

module.exports = uuidHelper(uuidv4);

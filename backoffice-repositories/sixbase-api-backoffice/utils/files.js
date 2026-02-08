const { Readable } = require('stream');
const FileManager = require('../services/FileManager');

/**
 * @typedef {Object} File
 * @param {string} key
 * @param {string} path
 */

/**
 * @typedef {Object} FileParams
 * @param {File} file
 * @param {String} readPermission
 * @param {boolean} deleteFileFromDisk
 * @param {String} bucket
 */

const bufferToStream = async (binary) => {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
};

const resolveImageFromBuffer = async (fileBuffer, key) => {
  const stream = await bufferToStream(fileBuffer);
  const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
  const uploadedFile = await FileManagerInstance.uploadFile(
    stream,
    key,
    FileManager.ACLS.PUBLICREAD,
  );
  return { file: uploadedFile, key };
};

module.exports = {
  resolveImageFromBuffer,
};

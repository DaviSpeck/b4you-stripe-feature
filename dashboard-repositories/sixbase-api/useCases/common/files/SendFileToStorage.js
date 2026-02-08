const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const FileManager = require('../../../services/FileManager');

const createReadStreamFromFilePath = (filePath) => {
  const fileStream = fs.createReadStream(filePath);
  return fileStream;
};

const resolveFilePathAndKey = (file) => {
  const { key, path: filePath, originalname, size } = file;
  const pathResolved = path.resolve(filePath);
  return { key, filePath: pathResolved, originalname, size };
};

const resolveReadPermission = (permission) => {
  switch (permission) {
    case 'public':
      return FileManager.ACLS.PUBLICREAD;
    case 'private':
      return FileManager.ACLS.PRIVATE;

    default:
      return FileManager.ACLS.PUBLICREAD;
  }
};

module.exports = class SendFIleToStorage {
  constructor({
    file,
    readPermission = 'public',
    deleteFileFromDisk = true,
    bucket = process.env.BUCKET_NAME,
  }) {
    if (!file) throw new Error('missing file param');
    if (readPermission !== 'public' && readPermission !== 'private')
      throw new Error('Permissão inválida. Aceita público ou privado');
    if (typeof deleteFileFromDisk !== 'boolean')
      throw new Error('invalid deleteFileFromDisk: must be a boolean');
    this.file = file;
    this.readPermission = readPermission;
    this.deleteFileFromDisk = deleteFileFromDisk;
    this.bucket = bucket;
  }

  async execute() {
    const { key, filePath, originalname, size } = resolveFilePathAndKey(
      this.file,
    );
    const fileStream = createReadStreamFromFilePath(filePath);
    const permission = resolveReadPermission(this.readPermission);
    const FileManagerInstance = new FileManager(this.bucket);
    const uploadedFile = await FileManagerInstance.uploadFile(
      fileStream,
      key,
      permission,
    );
    if (this.deleteFileFromDisk) {
      fs.unlinkSync(filePath);
    }
    const file_extension = _.last(originalname.split('.'));
    return {
      file: uploadedFile,
      key,
      filePath,
      originalname,
      file_size: size,
      file_extension,
    };
  }
};

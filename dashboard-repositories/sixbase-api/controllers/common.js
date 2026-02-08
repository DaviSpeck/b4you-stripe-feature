const Lessons_attachments = require('../database/models/Lessons_attachments');
const ApiError = require('../error/ApiError');
const FileManager = require('../services/FileManager');
const { permissionTypes } = require('../types/permissionsTypes');

const { slugify } = require('../utils/formatters');

const downloadAttachment = async (key) => {
  const fileManagerInstance = new FileManager(process.env.BUCKET_NAME);
  const attachmentFile = await fileManagerInstance.getFile(key);
  return { data: attachmentFile.Body };
};

const downloadAttachmentController = async (req, res, next) => {
  const {
    params: { attachment_id },
  } = req;
  try {
    const attachmentFile = await Lessons_attachments.findOne({
      raw: true,
      attributes: ['id', 'file_key', 'original_name'],
      where: {
        uuid: attachment_id,
      },
    });
    if (!attachmentFile) {
      throw ApiError.badRequest('Anexo não encontrado');
    }
    const attachment = await downloadAttachment(attachmentFile.file_key);
    res.setHeader('Content-Type', 'application/octet');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${slugify(attachmentFile.original_name)}`,
    );
    return res.status(200).send(attachment.data);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const saveOnSession = async (session, data, role) => {
  session[role] = data;
};

const resolveUserPermissions = () => {
  const permissionsKeys = permissionTypes.map(({ key }) => key);
  return {
    ...permissionsKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {}),
  };
};

const saveManyToSession = (session, dataArray) => {
  dataArray.forEach(({ key, value }) => {
    saveOnSession(session, value, key);
  });
};

module.exports = {
  downloadAttachmentController,
  saveOnSession,
  resolveUserPermissions,
  saveManyToSession,
};

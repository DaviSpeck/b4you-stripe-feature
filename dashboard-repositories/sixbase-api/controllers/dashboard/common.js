const { Op } = require('sequelize');
const VideoManager = require('../../services/VideoManager');
const FileManager = require('../../services/FileManager');
const {
  decrementOrder,
  deleteLesson,
} = require('../../database/controllers/lessons');
const {
  deleteLessonAttachmentByID,
} = require('../../database/controllers/lessons_attachments');

const deleteAttachments = async (attachments) => {
  const promises = [];
  const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
  attachments.forEach(({ id, file_key }) => {
    promises.push(FileManagerInstance.deleteFile(file_key));
    promises.push(deleteLessonAttachmentByID(id));
  });
  await Promise.all(promises);
};

const deleteLessonAndAttachments = async ({
  attachments,
  uri,
  id,
  order,
  id_module,
}) => {
  await deleteAttachments(attachments);
  if (uri) {
    await VideoManager.deleteVideo(uri);
  }
  await deleteLesson({ id });
  await decrementOrder({
    order: {
      [Op.gte]: order,
    },
    id_module,
    deleted_at: null,
  });
};

module.exports = {
  deleteLessonAndAttachments,
};

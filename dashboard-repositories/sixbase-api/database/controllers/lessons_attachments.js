const Lessons_attachments = require('../models/Lessons_attachments');

const createLessonAttachment = async (lessonAttachmentsObj, t = null) => {
  try {
    const lesson_attach = await Lessons_attachments.create(
      lessonAttachmentsObj,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return lesson_attach;
  } catch (error) {
    throw error;
  }
};

const deleteLessonAttachmentByID = async (id) => {
  const lesson_attachment = await Lessons_attachments.destroy({
    where: {
      id,
    },
  });
  return lesson_attachment;
};

const findLessonAttachmentByUUID = async (uuid, id_user) => {
  const lessonAttachment = await Lessons_attachments.findOne({
    raw: true,
    where: {
      uuid,
      id_user,
    },
  });

  return lessonAttachment;
};

const findAllAttachments = async (where) =>
  Lessons_attachments.findAll({
    where,
  });

module.exports = {
  createLessonAttachment,
  deleteLessonAttachmentByID,
  findLessonAttachmentByUUID,
  findAllAttachments,
};

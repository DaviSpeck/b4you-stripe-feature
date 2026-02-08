const resolveModerator = (moderator) => {
  if (!moderator) return null;
  const name =
    moderator.full_name ||
    `${moderator.first_name || ''} ${moderator.last_name || ''}`.trim();
  return {
    uuid: moderator.uuid,
    name: name.trim(),
  };
};

const resolveLesson = (lesson) => {
  if (!lesson) return null;
  return {
    uuid: lesson.uuid,
    title: lesson.title,
    module: lesson.module
      ? {
          uuid: lesson.module.uuid,
          title: lesson.module.title,
        }
      : null,
  };
};

const resolveStudent = (student) => {
  if (!student) return null;
  return {
    uuid: student.uuid,
    name: student.full_name,
    email: student.email,
  };
};

const serializeComment = (comment) => ({
  uuid: comment.uuid,
  content: comment.content,
  status: comment.status,
  auto_approved: comment.auto_approved,
  created_at: comment.created_at,
  updated_at: comment.updated_at,
  approved_at: comment.approved_at,
  student: resolveStudent(comment.student),
  lesson: resolveLesson(comment.lesson),
  moderator: resolveModerator(comment.moderator),
});

module.exports = class {
  constructor(data = []) {
    this.data = Array.isArray(data) ? data : [data];
  }

  adapt() {
    return this.data.map(serializeComment);
  }
};


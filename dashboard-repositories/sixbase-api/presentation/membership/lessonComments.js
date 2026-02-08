const serializeStudent = (student) => {
  if (!student) return null;
  return {
    uuid: student.uuid,
    name: student.full_name,
    profile_picture: student.profile_picture,
  };
};

const serializeComment = (comment, currentStudentId) => ({
  uuid: comment.uuid,
  content: comment.content,
  status: comment.status,
  created_at: comment.created_at,
  updated_at: comment.updated_at,
  pending: comment.status === 'pending',
  is_owner: comment.id_student === currentStudentId,
  can_edit: comment.id_student === currentStudentId,
  can_delete: comment.id_student === currentStudentId,
  student: serializeStudent(comment.student),
});

module.exports = class {
  constructor(data, currentStudentId) {
    this.data = data;
    this.currentStudentId = currentStudentId;
  }

  adapt() {
    if (!this.data) return [];
    if (Array.isArray(this.data)) {
      return this.data.map((comment) =>
        serializeComment(comment, this.currentStudentId),
      );
    }
    return [serializeComment(this.data, this.currentStudentId)];
  }
};


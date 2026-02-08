const { capitalizeName } = require('../../utils/formatters');
const { findQuestionStatus } = require('../../status/questionStatus');

const serializeProduct = ({ name }) => ({ name: capitalizeName(name) });

const serializeStudent = (student) => {
  if (!student) return null;
  const { full_name, profile_picture } = student;
  return {
    full_name: capitalizeName(full_name),
    profile_picture,
  };
};

const findRole = (student) => {
  if (student) return { is_student: true, label: 'Estudante' };
  return { is_student: false, label: 'Autor' };
};

const serializeUser = (student, id_user) => ({
  ...serializeStudent(student),
  ...findRole(student, id_user),
});

const serializeAnswers = (answers) => {
  if (!answers || !Array.isArray(answers)) return [];
  return answers.map(({ uuid, message, student, id_user, created_at }) => ({
    uuid,
    message,
    user: serializeUser(student, id_user),
    created_at,
  }));
};

const serializeModuleOrLesson = ({ title }) => ({ title });

const serializeSingleQuestion = (question) => {
  const {
    uuid,
    title,
    message,
    status,
    student,
    product,
    answers,
    module,
    lesson,
    created_at,
  } = question;
  return {
    uuid,
    status: findQuestionStatus(status),
    title: capitalizeName(title),
    message,
    module: serializeModuleOrLesson(module),
    lesson: serializeModuleOrLesson(lesson),
    answers: serializeAnswers(answers),
    student: serializeStudent(student),
    product: serializeProduct(product),
    created_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleQuestion);
    }
    return serializeSingleQuestion(this.data);
  }
};

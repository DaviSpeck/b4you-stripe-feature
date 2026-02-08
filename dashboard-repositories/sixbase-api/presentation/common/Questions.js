const { capitalizeName } = require('../../utils/formatters');

const resolveUser = (producer, student) => {
  if (producer)
    return {
      role: 'producer',
      full_name: capitalizeName(producer.full_name),
      avatar: producer.profile_picture,
    };
  return {
    role: 'student',
    full_name: capitalizeName(student.full_name),
    avatar: student.profile_picture,
  };
};

const serializeHistories = (histories) => {
  if (!histories) return [];
  return histories.map(({ title, message, created_at }) => ({
    title,
    message,
    created_at,
  }));
};

const serializeSingleQuestion = (question) => {
  const {
    dataValues: {
      uuid,
      title,
      message,
      created_at,
      answers,
      history,
      producer,
      student,
    },
  } = question;
  return {
    uuid,
    title,
    message,
    history: serializeHistories(history),
    user: resolveUser(producer, student),
    created_at,
    answers,
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

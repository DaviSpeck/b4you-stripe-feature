const Student_sessions = require('../../database/models/Student_sessions');

module.exports = class StudentSessionRepository {
  static async create(data) {
    const session = await Student_sessions.create(data);
    return session.toJSON();
  }
};

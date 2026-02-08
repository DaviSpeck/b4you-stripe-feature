const Classrooms = require('../../database/models/Classrooms');

module.exports = class ClassroomsRepository {
  static async create(data) {
    const classroom = await Classrooms.create(data);
    return classroom;
  }
};

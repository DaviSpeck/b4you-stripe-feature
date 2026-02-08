const {
  findStudent,
  updateStudent,
} = require('../../database/controllers/students');
const FileManager = require('../../services/FileManager');
const ApiError = require('../../error/ApiError');

module.exports = class {
  constructor(id_student) {
    this.id_student = id_student;
  }

  async execute() {
    const student = await findStudent({
      id: this.id_student,
    });
    if (!student) throw ApiError.badRequest('Estudante não encontrado');
    if (!student.profile_picture_key)
      throw ApiError.badRequest('Estudante não possui foto de perfil');
    const FileManagerInstance = new FileManager(process.env.BUCKET_NAME);
    await FileManagerInstance.deleteFile(student.profile_picture_key);
    await updateStudent(student.id, {
      profile_picture: null,
      profile_picture_key: null,
    });
  }
};

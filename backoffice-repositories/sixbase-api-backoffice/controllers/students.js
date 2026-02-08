const ApiError = require('../error/ApiError');
const FindStudentInfo = require('../useCases/students/FindStudentInfo');
const FindStudentsFilteredUseCase = require('../useCases/students/FindStudentsFiltered');
const ForgotPassword = require('../useCases/students/ForgotPassword');
const SalesItemsRepository = require('../repositories/sequelize/SalesItemsRepository');
const SerializeStudent = require('../presentation/students/filtered');
const SerializeStudentInfo = require('../presentation/students/info');
const StudentRepository = require('../repositories/sequelize/StudentRepository');
const ResetStudentRepository = require('../repositories/sequelize/ResetStudentRepository');
const UpdateStudentEmailUseCase = require('../useCases/students/UpdateEmail');
const Students = require('../database/models/Students');
const Backoffice_notes_student = require('../database/models/Backoffice_notes_student');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const { findUserEventTypeByKey } = require('../types/userEvents');
const date = require('../utils/helpers/date');

module.exports.updateStudentEmail = async (req, res, next) => {
  const {
    body: { email },
    params: { student_uuid },
  } = req;
  try {
    const { full_name, email: old_email } = await new UpdateStudentEmailUseCase(
      {
        student_uuid,
        new_email: email,
      },
    ).execute();
    return res.send({
      success: true,
      message: 'Email do aluno alterado com sucesso',
      info: { student_name: full_name, old_email, new_email: email },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findStudentsSales = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null },
  } = req;
  try {
    const { rows, count } = await new FindStudentsFilteredUseCase({
      input,
      page,
      size,
    }).execute();
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows: new SerializeStudent(rows).adapt(),
      },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findStudentsData = async (req, res, next) => {
  const {
    params: { studentUuid },
  } = req;
  try {
    const data = await new FindStudentInfo({
      StudentRepository,
      SalesItemsRepository,
    }).execute(studentUuid);
    return res.send(new SerializeStudentInfo(data).adapt());
  } catch (error) {
    console.error('findStudentsData - Erro:', error);
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.sendStudentsRecoverEmail = async (req, res, next) => {
  const {
    params: { studentUuid },
  } = req;
  try {
    await new ForgotPassword({
      StudentRepository,
      ResetStudentRepository,
    }).execute(studentUuid);
    return res.send(true);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.changeEmail = async (req, res, next) => {
  const {
    params: { studentUuid },
    body: { email = null },
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    if (!email) {
      throw ApiError.badRequest('Necessário informar o e-mail');
    }
    const emailAlreadyInUse = await Students.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        email,
      },
    });
    if (emailAlreadyInUse) {
      throw ApiError.badRequest('E-mail em uso');
    }
    const student = await Students.findOne({
      where: { uuid: studentUuid },
      attributes: ['uuid', 'id', 'email', 'full_name'],
    });
    await Students.update({ email }, { where: { id: student.id } });
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('client-email').id,
      params: {
        user_agent,
        student_uuid: student.uuid,
        student_name: student.full_name,
        old_values: {
          email: student.email,
        },
        new_values: {
          email,
        },
      },
      ip_address,
      id_user: null,
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getNotes = async (req, res, next) => {
  const {
    params: { studentUuid },
  } = req;
  try {
    const student = await Students.findOne({
      raw: true,
      where: { uuid: studentUuid },
      attributes: ['id'],
    });
    const notes = await Backoffice_notes_student.findAll({
      raw: true,
      nest: true,
      where: {
        id_student: student.id,
      },
      attributes: ['id', 'note', 'created_at'],
      order: [['id', 'desc']],
      include: [
        {
          association: 'user_backoffice',
          attributes: ['full_name'],
        },
      ],
    });
    return res.json(
      notes.map((note) => ({
        ...note,
        created_at: date(note.created_at)
          .utcOffset(-3, true)
          .format('DD/MM/YYYY HH:mm:ss'),
      })),
    );
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.createNote = async (req, res, next) => {
  const {
    params: { studentUuid },
    body: { note },
    user: { id: id_user_backoffice },
  } = req;
  try {
    const student = await Students.findOne({
      raw: true,
      where: { uuid: studentUuid },
      attributes: ['id'],
    });
    const newNote = await Backoffice_notes_student.create({
      id_student: student.id,
      note,
      id_user_backoffice,
    });
    return res.send(newNote);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.deleteNote = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    await Backoffice_notes_student.destroy({ where: { id } });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findStudentsWithSalesStats = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null, status = null },
  } = req;
  try {
    const { rows, count } = await StudentRepository.findStudentsWithSalesStats({
      page,
      size,
      input,
      status,
    });
    return res.send({
      success: true,
      message: 'Lista de estudantes com estatísticas obtida com sucesso',
      info: {
        count,
        rows,
      },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findStudentWithSalesInfo = async (req, res, next) => {
  const {
    params: { studentUuid },
  } = req;
  try {
    const studentWithStats = await StudentRepository.findStudentWithSalesInfo(
      studentUuid,
    );

    if (!studentWithStats) {
      throw ApiError.badRequest('Estudante não encontrado');
    }

    return res.send({
      success: true,
      message: 'Dados do estudante com estatísticas obtidos com sucesso',
      info: studentWithStats,
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

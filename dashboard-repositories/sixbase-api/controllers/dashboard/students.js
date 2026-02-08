const _ = require('lodash');
const ExcelJS = require('exceljs');
const ApiError = require('../../error/ApiError');
const SerializeStudents = require('../../presentation/dashboard/studentProduct');
const ClassroomAccessEmail = require('../../services/email/ClassroomAccess');
const { generateRandomPassword } = require('../../utils/generators');
const {
  capitalizeName,
  transformEmailToName,
  slugify,
  splitFullName,
} = require('../../utils/formatters');
const {
  createStudentProducts,
  findSingleStudentProduct,
  deleteStudentProduct,
  findStudentProductsPaginated,
  findStudentProductsSummary,
  updateStudentProducts,
  findAllStudentProducts,
} = require('../../database/controllers/student_products');
const {
  findOneClassroom,
  findClassrooms,
} = require('../../database/controllers/classrooms');
const {
  findStudentByEmail,
  createStudent,
} = require('../../database/controllers/students');
const {
  createResetStudentPassword,
  findResetRequestByIdStudent,
} = require('../../database/controllers/resetStudent');
const { VIDEOTYPE } = require('../../types/productTypes');
const Student_products = require('../../database/models/Students_products');
const DateHelper = require('../../utils/helpers/date');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const ActiveCampaign = require('../../services/integrations/ActiveCampaign');
const Plugins = require('../../database/models/Plugins');
const Users = require('../../database/models/Users');
const { findStudentByUUID } = require('../../database/controllers/students');

const defaultActiveCampaigAprovedList = 6;
const CREATOR_PRODUCT = 'f77cd951-9890-4a85-a63e-07a472e4ae8e';
const { URL_SIXBASE_MEMBERSHIP } = process.env;

const validateFilters = ({
  page = 0,
  size = 10,
  input,
  class_uuid,
  order_field,
  order_direction,
}) => {
  const where = {
    page: Number(page) || 0,
    size: Number(size) || 10,
  };
  if (input) where.input = input;
  if (class_uuid && class_uuid !== 'all') where.class_uuid = class_uuid;
  if (order_field) where.order_field = order_field;
  if (order_direction) where.order_direction = order_direction;
  return where;
};

const insertActiveCampaign = async (data) => {
  const defaultActiveCampaignUser = await Users.findOne({
    where: {
      email: 'escolacreator.b4you@gmail.com',
    },
  });

  if (!defaultActiveCampaignUser) return;

  const plugin = await Plugins.findOne({
    where: {
      id_user: defaultActiveCampaignUser.id,
      id_plugin: findIntegrationTypeByKey('activecampaign').id,
    },
  });

  if (!plugin) return;

  const integration = new ActiveCampaign(
    plugin.settings.apiUrl,
    plugin.settings.apiKey,
  );

  for await (const studentData of data) {
    const { firstName, lastName } = splitFullName(studentData.full_name);
    const {
      contact: { id },
    } = await integration.createOrUpdateContact({
      email: studentData.email,
      firstName,
      lastName,
      phone: studentData.whatsapp,
    });
    await integration.insertContactOnList({
      idList: defaultActiveCampaigAprovedList,
      idContact: id,
    });
  }
};

const findAllStudentsController = async (req, res, next) => {
  const {
    product: { id: id_product },
    query,
  } = req;
  try {
    const filters = validateFilters(query);
    filters.id_product = id_product;

    const studentProducts = await findStudentProductsPaginated(filters);

    const totalStudentsFromCount = Array.isArray(studentProducts.count)
      ? studentProducts.count.length
      : Number(studentProducts.count) || 0;

    const serializedRows = new SerializeStudents(studentProducts.rows).adapt();

    return res.status(200).send({
      count: totalStudentsFromCount,
      rows: serializedRows,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getStudentsSummaryController = async (req, res, next) => {
  const {
    product: { id: id_product },
    query,
  } = req;
  try {
    const filters = validateFilters(query);

    const summaryData = await findStudentProductsSummary({
      id_product,
      input: filters.input,
      class_uuid: filters.class_uuid,
    });

    const parsedSummary = {
      total_students: Number(summaryData?.total_students ?? 0),
      average_progress: Number(
        Number(summaryData?.average_progress ?? 0).toFixed(2),
      ),
      completion_rate: Number(
        Number(summaryData?.completion_rate ?? 0).toFixed(2),
      ),
    };

    return res.status(200).send(parsedSummary);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const removeStudentProductController = async (req, res, next) => {
  const {
    body: { id },
  } = req;
  try {
    await deleteStudentProduct({ id });
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const filterClassroomsStudents = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const classrooms = await findClassrooms({ id_product });
    const orderedAndFilteredClassrooms = _.orderBy(classrooms, ['label']).map(
      ({ uuid, label }) => ({
        uuid,
        label,
      }),
    );
    return res.status(200).send(orderedAndFilteredClassrooms);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
const migrateSingleStudentController = async (req, res, next) => {
  const { student_product, selectedClassroom } = req;
  try {
    await updateStudentProducts(
      { id: student_product.id },
      { id_classroom: selectedClassroom.id },
    );
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const migrateAllStudentsController = async (req, res, next) => {
  const {
    selectedClassroom,
    product: { id: id_product },
    classroom_from: { id: id_classroom },
  } = req;
  try {
    const studentProducts = await findAllStudentProducts({
      id_product,
      id_classroom,
    });
    const promises = [];
    studentProducts.forEach((studentProduct) => {
      promises.push(
        updateStudentProducts(
          { id: studentProduct.id },
          { id_classroom: selectedClassroom.id },
        ),
      );
    });
    await Promise.all(promises);
    return res.sendStatus(200);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const importStudentsFileController = async (req, res, next) => {
  const {
    product: {
      id: id_product,
      uuid: uuid_product,
      support_email,
      name: product_name,
      producer: { full_name },
      id_type,
    },
    body: { data, classroom_id },
  } = req;
  const newStudentsPromises = [];
  const studentEmailPromises = [];
  const studentIds = [];
  const studentProductAccess = [];
  let studentsPromises = [];
  const studentTokenPromises = [];
  try {
    let classroom = null;
    if (id_type === VIDEOTYPE) {
      if (classroom_id) {
        classroom = await findOneClassroom({ uuid: classroom_id, id_product });
      }
      if (!classroom) {
        classroom = await findOneClassroom({ id_product, is_default: true });
      }
    }
    studentsPromises = data.map(({ email }) => findStudentByEmail(email));
    const listStudents = await Promise.all(studentsPromises);
    for await (const [index, student] of listStudents.entries()) {
      if (!student) {
        newStudentsPromises.push(
          createStudent({
            email: data[index].email,
            full_name: data[index].full_name,
            status: 'pending',
            password: generateRandomPassword(),
            document_number: data[index].document_number,
            document_type: 'CPF',
            whatsapp: data[index].whatsapp,
          }),
        );
      } else {
        const studentProduct = await findSingleStudentProduct({
          id_product,
          id_student: student.id,
        });
        if (!studentProduct) {
          const pathToPage = `${
            id_type === VIDEOTYPE ? 'cursos' : 'ebooks'
          }/${slugify(product_name)}/${uuid_product}`;
          studentIds.push(student.id);
          const emailData = {
            full_name: capitalizeName(student.full_name),
            url_action: `${URL_SIXBASE_MEMBERSHIP}/${pathToPage}`,
            email: student.email,
            product_name,
            productor_name: capitalizeName(full_name),
            support_email,
          };
          studentEmailPromises.push(new ClassroomAccessEmail(emailData).send());
        }
      }
    }

    const createdStudents = await Promise.all(newStudentsPromises);
    createdStudents.forEach((student) => {
      studentIds.push(student.id);
      studentTokenPromises.push(
        createResetStudentPassword({
          id_student: student.id,
        }),
      );
    });

    studentIds.forEach((id) => {
      studentProductAccess.push(
        createStudentProducts({
          id_student: id,
          id_product,
          id_classroom: classroom ? classroom.id : null,
        }),
      );
    });
    await Promise.all(studentProductAccess);
    const createdTokens = await Promise.all(studentTokenPromises);
    createdTokens.forEach((token, index) => {
      const emailData = {
        full_name: capitalizeName(createdStudents[index].full_name),
        url_action: `${URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${token.uuid}/first`,
        email: createdStudents[index].email,
        product_name,
        productor_name: capitalizeName(full_name),
        support_email,
      };
      studentEmailPromises.push(new ClassroomAccessEmail(emailData).send());
    });
    await Promise.all(studentEmailPromises);
    if (data.length > 0 && uuid_product === CREATOR_PRODUCT) {
      await insertActiveCampaign(data);
    }
    return res
      .status(200)
      .send({ success: true, message: 'All students were imported' });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const createOrUpdateImportStudentController = async (req, res, next) => {
  const {
    product: {
      id: id_product,
      uuid: uuid_product,
      support_email,
      name: product_name,
      producer: { first_name, last_name },
      id_type,
    },
    body: { data, classroom_id },
  } = req;
  const newStudentsPromises = [];
  const studentEmailPromises = [];
  const studentIds = [];
  const studentProductAccess = [];
  const studentsPromises = [];
  const studentTokenPromises = [];
  try {
    let classroom = null;
    if (id_type === VIDEOTYPE) {
      if (classroom_id) {
        classroom = await findOneClassroom({ uuid: classroom_id, id_product });
      }
      if (!classroom) {
        classroom = await findOneClassroom({ id_product, is_default: true });
      }
    }
    data.forEach((email) => {
      studentsPromises.push(findStudentByEmail(email));
    });
    const listStudents = await Promise.all(studentsPromises);
    for await (const [index, student] of listStudents.entries()) {
      if (!student) {
        newStudentsPromises.push(
          createStudent({
            email: data[index],
            full_name: transformEmailToName(data[index]),
            status: 'pending',
            password: generateRandomPassword(),
            document_number: '',
            document_type: '',
            whatsapp: '',
          }),
        );
      } else {
        const studentProduct = await findSingleStudentProduct({
          id_product,
          id_student: student.id,
        });
        if (!studentProduct) {
          const pathToPage = `${
            id_type === VIDEOTYPE ? 'cursos' : 'ebooks'
          }/${slugify(product_name)}/${uuid_product}`;
          studentIds.push(student.id);
          const emailData = {
            full_name: capitalizeName(student.full_name),
            url_action: `${URL_SIXBASE_MEMBERSHIP}/${pathToPage}`,
            email: student.email,
            product_name,
            productor_name: capitalizeName(`${first_name} ${last_name}`),
            support_email,
          };
          studentEmailPromises.push(new ClassroomAccessEmail(emailData).send());
        }
      }
    }

    const createdStudents = await Promise.all(newStudentsPromises);
    createdStudents.forEach((student) => {
      studentIds.push(student.id);
      studentTokenPromises.push(
        createResetStudentPassword({
          id_student: student.id,
        }),
      );
    });

    studentIds.forEach((id) => {
      studentProductAccess.push(
        createStudentProducts({
          id_student: id,
          id_product,
          id_classroom: classroom ? classroom.id : null,
        }),
      );
    });
    await Promise.all(studentProductAccess);
    const createdTokens = await Promise.all(studentTokenPromises);
    createdTokens.forEach((token, index) => {
      const emailData = {
        full_name: capitalizeName(createdStudents[index].full_name),
        url_action: `${URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${token.uuid}/first`,
        email: createdStudents[index].email,
        product_name,
        productor_name: capitalizeName(`${first_name} ${last_name}`),
        support_email,
      };
      studentEmailPromises.push(new ClassroomAccessEmail(emailData).send());
    });
    await Promise.all(studentEmailPromises);
    return res
      .status(200)
      .send({ success: true, message: 'All students were imported' });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const resolveCreatedAt = (created_at, sales_items) => {
  if (created_at) return DateHelper(created_at).format('DD/MM/YYYY');
  if (sales_items && sales_items.paid_at)
    return DateHelper(sales_items.paid_at).format('DD/MM/YYYY');
  return 'Não informado';
};

// eslint-disable-next-line
const exportStudentsController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;

  try {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=afiliados.xlsx');
    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      useStyles: true,
      useSharedStrings: true,
      filename: 'alunos.xlsx',
      stream: res,
    });
    const worksheet = workbook.addWorksheet();
    worksheet.columns = [
      {
        header: 'Nome',
        key: 'full_name',
        width: 30,
      },
      {
        header: 'Email',
        width: 30,
        key: 'email',
      },
      {
        header: 'Whatsapp',
        width: 16,
        key: 'whatsapp',
      },
      {
        header: 'Turma',
        width: 30,
        key: 'classroom_name',
      },
      {
        header: 'Data',
        width: 30,
        key: 'created_at',
      },
    ];
    let offset = 0;
    const limit = 100;
    let total = 100;
    while (total !== 0) {
      // eslint-disable-next-line
      const rows = await Student_products.findAll({
        nest: true,
        limit,
        offset,
        where: {
          '$product.id$': id_product,
        },
        include: [
          {
            association: 'classroom',
            attributes: ['label'],
          },
          {
            association: 'student',
            attributes: ['full_name', 'email', 'whatsapp', 'document_number'],
          },
          {
            association: 'product',
            attributes: [],
          },
          {
            association: 'sales_items',
            required: false,
            attributes: ['paid_at'],
          },
        ],
      });
      total = rows.length;
      if (total < 100) {
        total = 0;
      }
      offset += 100;

      for (const {
        student: { full_name, email, whatsapp },
        classroom,
        created_at,
        sales_items,
      } of rows) {
        worksheet
          .addRow({
            full_name: capitalizeName(full_name),
            email,
            whatsapp,
            classroom_name: classroom ? capitalizeName(classroom.label) : '',
            created_at: resolveCreatedAt(created_at, sales_items),
          })
          .commit();
      }
    }
    worksheet.commit();
    await workbook.commit();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const sendEmailStudentController = async (req, res, next) => {
  const {
    product: {
      support_email,
      name: product_name,
      producer: { full_name },
    },
    params: { studentUuid },
  } = req;

  try {
    const student = await findStudentByUUID(studentUuid);

    if (!student) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    let token;
    const alreadyExistsRecovery = await findResetRequestByIdStudent(student.id);

    if (alreadyExistsRecovery) {
      token = alreadyExistsRecovery.uuid;
    } else {
      const { uuid } = await createResetStudentPassword({
        id_student: student.id,
      });
      token = uuid;
    }

    const emailData = {
      full_name: capitalizeName(student.full_name),
      url_action: `${URL_SIXBASE_MEMBERSHIP}/cadastrar-senha/${token.uuid}/first`,
      email: student.email,
      product_name,
      productor_name: capitalizeName(full_name),
      support_email,
    };

    await new ClassroomAccessEmail(emailData).send();
    return res.send(true);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const removeAccessProductStudentController = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { studentUuid },
  } = req;

  try {
    const student = await findStudentByUUID(studentUuid);

    if (!student) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    await deleteStudentProduct({ id_product, id_student: student.id });
    return res.send(true);
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports = {
  exportStudentsController,
  createOrUpdateImportStudentController,
  filterClassroomsStudents,
  findAllStudentsController,
  getStudentsSummaryController,
  migrateAllStudentsController,
  migrateSingleStudentController,
  importStudentsFileController,
  removeStudentProductController,
  sendEmailStudentController,
  removeAccessProductStudentController,
};

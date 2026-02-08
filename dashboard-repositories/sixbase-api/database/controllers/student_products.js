const { Op, literal } = require('sequelize');
const Products = require('../models/Products');
const Student_products = require('../models/Students_products');
const Users = require('../models/Users');
const rawData = require('../rawData');
const { PAYMENT_ONLY_TYPE } = require('../../types/productTypes');

const createStudentProducts = (data, t = null) =>
  Student_products.create(data, { transaction: t });

const findStudentProductsCoursePaginated = async (where, page, size) => {
  const factor = parseInt(page, 10);
  const limit = parseInt(size, 10);
  const offset = factor * limit;
  const studentProducts = await Student_products.findAndCountAll({
    nest: true,
    limit,
    offset,
    where,
    distinct: true,
    subQuery: false,
    order: [['id', 'desc']],
    include: [
      {
        model: Products,
        as: 'product',
        paranoid: false,
        include: [
          {
            model: Users,
            as: 'producer',
          },
        ],
      },
    ],
  });
  return studentProducts;
};

const buildStudentProductsWhere = ({ id_product, input, class_uuid }) => {
  let where = {};

  if (id_product) where.id_product = id_product;

  if (input) {
    let orObject = {
      '$student.full_name$': { [Op.like]: `%${input}%` },
      '$student.email$': { [Op.like]: `%${input}%` },
    };

    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0) {
      orObject = {
        ...orObject,
        '$student.whatsapp$': { [Op.like]: `%${sanitizedInput}%` },
        '$student.document_number$': { [Op.like]: `%${sanitizedInput}%` },
      };
    }

    where = {
      ...where,
      [Op.or]: orObject,
    };
  }

  if (class_uuid) {
    where = {
      ...where,
      '$classroom.uuid$': class_uuid,
    };
  }

  return where;
};

const AVAILABLE_LESSONS_SUBQUERY = `
  SELECT COUNT(DISTINCT l.id)
  FROM lessons l
  INNER JOIN modules m ON m.id = l.id_module
  LEFT JOIN modules_classrooms mc ON mc.id_module = m.id
  WHERE l.active = 1
    AND l.deleted_at IS NULL
    AND m.deleted_at IS NULL
    AND m.active = 1
    AND m.id_product = student_products.id_product
    AND (
      student_products.id_classroom IS NULL
      OR mc.id_classroom = student_products.id_classroom
      OR NOT EXISTS (
        SELECT 1
        FROM modules_classrooms mc2
        WHERE mc2.id_module = m.id
      )
    )
`;

const COMPLETED_LESSONS_SUBQUERY = `
  SELECT COUNT(DISTINCT l.id)
  FROM study_history sh
  INNER JOIN lessons l ON l.id = sh.id_lesson
  INNER JOIN modules m ON m.id = l.id_module
  LEFT JOIN modules_classrooms mc ON mc.id_module = m.id
  WHERE sh.id_student = student_products.id_student
    AND sh.id_product = student_products.id_product
    AND sh.done = 1
    AND l.active = 1
    AND l.deleted_at IS NULL
    AND m.deleted_at IS NULL
    AND m.active = 1
    AND m.id_product = student_products.id_product
    AND (
      student_products.id_classroom IS NULL
      OR mc.id_classroom = student_products.id_classroom
      OR NOT EXISTS (
        SELECT 1
        FROM modules_classrooms mc2
        WHERE mc2.id_module = m.id
      )
    )
`;

const LAST_ACCESS_SUBQUERY = `
  SELECT MAX(sh.updated_at)
  FROM study_history sh
  WHERE sh.id_student = student_products.id_student
    AND sh.id_product = student_products.id_product
`;

const buildProgressExpression = () => `
  CASE
    WHEN (${AVAILABLE_LESSONS_SUBQUERY}) = 0 THEN 0
    ELSE (( ${COMPLETED_LESSONS_SUBQUERY} ) * 100.0 / ( ${AVAILABLE_LESSONS_SUBQUERY} ))
  END
`;

const findStudentProductsPaginated = async ({
  page,
  size,
  id_product,
  class_uuid,
  input,
  order_field,
  order_direction,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  const where = buildStudentProductsWhere({ id_product, input, class_uuid });

  const lastAccessLiteral = literal(`(${LAST_ACCESS_SUBQUERY})`);
  const completedLessonsLiteral = literal(`(${COMPLETED_LESSONS_SUBQUERY})`);
  const availableLessonsLiteral = literal(`(${AVAILABLE_LESSONS_SUBQUERY})`);
  const progressExpression = buildProgressExpression();

  const orderDirection =
    typeof order_direction === 'string' &&
    order_direction.toUpperCase() === 'ASC'
      ? 'ASC'
      : 'DESC';

  let order = [['id', 'desc']];

  if (order_field === 'student') {
    order = [[literal('student.full_name'), orderDirection]];
  } else if (order_field === 'classroom') {
    order = [[literal('classroom.label'), orderDirection]];
  } else if (order_field === 'last_access') {
    order = [[lastAccessLiteral, orderDirection]];
  } else if (order_field === 'released_at') {
    order = [
      [
        literal('COALESCE(sales_items.paid_at, student_products.created_at)'),
        orderDirection,
      ],
    ];
  } else if (order_field === 'progress') {
    order = [[literal(progressExpression), orderDirection]];
  }

  const studentProducts = await Student_products.findAndCountAll({
    nest: true,
    limit,
    offset,
    where,
    distinct: true,
    order,
    subQuery: false,
    attributes: {
      include: [
        [lastAccessLiteral, 'last_access_at'],
        [completedLessonsLiteral, 'completed_lessons'],
        [availableLessonsLiteral, 'available_lessons'],
        [literal(progressExpression), 'progress_percentage'],
      ],
    },
    include: [
      {
        association: 'student',
        attributes: [
          'uuid',
          'full_name',
          'email',
          'whatsapp',
          'profile_picture',
          'document_type',
          'document_number',
        ],
      },
      {
        association: 'classroom',
        attributes: ['uuid', 'label'],
      },
      { association: 'sales_items', required: false, attributes: ['paid_at'] },
    ],
  });

  return {
    count: studentProducts.count,
    rows: rawData(studentProducts.rows),
  };
};

const findStudentProductsSummary = async ({
  id_product,
  class_uuid,
  input,
}) => {
  const whereConditions = [];
  const replacements = {};

  if (id_product) {
    whereConditions.push('sp.id_product = :id_product');
    replacements.id_product = id_product;
  }

  if (class_uuid) {
    whereConditions.push('c.uuid = :class_uuid');
    replacements.class_uuid = class_uuid;
  }

  if (input) {
    const sanitizedInput = input.replace(/[^\d]/g, '');
    const inputConditions = ['s.full_name LIKE :input', 's.email LIKE :input'];

    if (sanitizedInput.length > 0) {
      inputConditions.push('s.whatsapp LIKE :sanitized_input');
      inputConditions.push('s.document_number LIKE :sanitized_input');
      replacements.sanitized_input = `%${sanitizedInput}%`;
    }

    whereConditions.push(`(${inputConditions.join(' OR ')})`);
    replacements.input = `%${input}%`;
  }

  const query = `
    WITH student_progress AS (
      SELECT 
        sp.id_student,
        sp.id_product,
        sp.id_classroom,
        -- Aulas disponíveis
        (
          SELECT COUNT(DISTINCT l.id)
          FROM lessons l
          INNER JOIN modules m ON m.id = l.id_module
          LEFT JOIN modules_classrooms mc ON mc.id_module = m.id
          WHERE l.active = 1
            AND l.deleted_at IS NULL
            AND m.deleted_at IS NULL
            AND m.active = 1
            AND m.id_product = sp.id_product
            AND (
              sp.id_classroom IS NULL
              OR mc.id_classroom = sp.id_classroom
              OR NOT EXISTS (
                SELECT 1 FROM modules_classrooms mc2
                WHERE mc2.id_module = m.id
              )
            )
        ) AS available_lessons,
        -- Aulas completadas
        (
          SELECT COUNT(DISTINCT l.id)
          FROM study_history sh
          INNER JOIN lessons l ON l.id = sh.id_lesson
          INNER JOIN modules m ON m.id = l.id_module
          LEFT JOIN modules_classrooms mc ON mc.id_module = m.id
          WHERE sh.id_student = sp.id_student
            AND sh.id_product = sp.id_product
            AND sh.done = 1
            AND l.active = 1
            AND l.deleted_at IS NULL
            AND m.deleted_at IS NULL
            AND m.active = 1
            AND m.id_product = sp.id_product
            AND (
              sp.id_classroom IS NULL
              OR mc.id_classroom = sp.id_classroom
              OR NOT EXISTS (
                SELECT 1 FROM modules_classrooms mc2
                WHERE mc2.id_module = m.id
              )
            )
        ) AS completed_lessons
      FROM student_products sp
      WHERE sp.id_product = :id_product
    ),
    total_students_count AS (
      SELECT COUNT(*) AS total
      FROM student_products
      WHERE id_product = :id_product
    )
    SELECT 
      (SELECT total FROM total_students_count) AS total_students,
      COALESCE(
        AVG(
          CASE 
            WHEN available_lessons = 0 THEN 0
            ELSE (completed_lessons * 100.0 / available_lessons)
          END
        ),
        0
      ) AS average_progress,
      COALESCE(
        AVG(
          CASE 
            WHEN available_lessons = 0 THEN 0
            WHEN completed_lessons >= available_lessons THEN 100
            ELSE 0
          END
        ),
        0
      ) AS completion_rate
    FROM student_progress
  `;

  const [results] = await Student_products.sequelize.query(query, {
    replacements,
    type: Student_products.sequelize.QueryTypes.SELECT,
  });

  return (
    results || {
      total_students: 0,
      average_progress: 0,
      completion_rate: 0,
    }
  );
};

const findStudentProduct = async (where, id_student) => {
  const studentProducts = await Student_products.findOne({
    nest: true,
    where,
    subQuery: false,
    include: [
      {
        association: 'product',
        paranoid: false,
        include: [
          {
            association: 'ebooks',
            separate: true,
          },
          {
            association: 'producer',
          },
          {
            association: 'progress',
            where: {
              id_student,
            },
            required: false,
          },
          {
            association: 'anchors',
            order: [['order', 'asc']],
            separate: true,
            include: [
              {
                association: 'modules',
                attributes: ['id'],
              },
            ],
          },
        ],
      },
    ],
  });
  return studentProducts;
};

const updateStudentProducts = async (where, data, t = null) =>
  Student_products.findOne({ where }).then(async (result) => {
    if (result) {
      await result.update(data, { transaction: t });
    }
  });

const findSingleStudentProduct = async (where) =>
  Student_products.findOne({
    raw: true,
    where,
  });

const findAllStudentProducts = async (where, t = null) =>
  Student_products.findAll({
    raw: true,
    where,
    transaction: t,
  });

const findStudentProductDesc = async (where) =>
  Student_products.findOne({
    order: [['id', 'desc']],
    where,
    include: [
      {
        association: 'product',
        paranoid: false,
        where: {
          id_type: { [Op.ne]: PAYMENT_ONLY_TYPE },
        },
        include: [
          {
            required: false,
            association: 'ebooks',
          },
        ],
      },
    ],
  });

const deleteStudentProduct = async (where, t = null) =>
  Student_products.destroy({
    where,
    transaction: t,
  });

module.exports = {
  createStudentProducts,
  findAllStudentProducts,
  findSingleStudentProduct,
  findStudentProductsCoursePaginated,
  findStudentProductsPaginated,
  findStudentProductsSummary,
  findStudentProduct,
  updateStudentProducts,
  deleteStudentProduct,
  findStudentProductDesc,
};

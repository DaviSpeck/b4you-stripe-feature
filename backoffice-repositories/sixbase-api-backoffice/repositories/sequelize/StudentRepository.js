const Students = require('../../database/models/Students');
const { QueryTypes } = require('sequelize');
const StudentFilters = require('../../utils/studentFilters');

module.exports = class StudentRepository {
  static async findByUUID(uuid) {
    const student = await Students.findOne({
      where: {
        uuid,
      },
      attributes: [
        'id',
        'email',
        'status',
        'full_name',
        'document_number',
        'whatsapp',
        'bank_code',
        'account_agency',
        'account_number',
        'address',
      ],
    });
    if (!student) return null;
    return student.toJSON();
  }

  static async findByUUIDWithSQL(uuid) {
    try {
      const results = await Students.sequelize.query(
        `
        SELECT 
          id,
          uuid,
          email,
          status,
          full_name,
          document_number,
          whatsapp,
          bank_code,
          account_agency,
          account_number,
          address,
          created_at,
          updated_at
        FROM students 
        WHERE uuid = :uuid
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { uuid },
        },
      );

      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Erro ao buscar student por UUID com SQL direto:', error);
      return this.findByUUID(uuid);
    }
  }

  static async findStudentsWithSalesStats({
    page = 0,
    size = 10,
    input = null,
    status = null,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = {};
      if (input) where.input = input;
      if (status) where.status = status;

      const { baseFilters, baseReplacements } =
        StudentFilters.createBaseFiltersSQL(where);

      const results = await Students.sequelize.query(
        `
        SELECT 
          s.id,
          s.uuid,
          s.email,
          s.status,
          s.full_name,
          s.document_number,
          s.whatsapp,
          s.bank_code,
          s.account_agency,
          s.account_number,
          s.address,
          s.created_at,
          s.updated_at,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_spent,
          MAX(si.created_at) as last_purchase_date,
          MIN(si.created_at) as first_purchase_date
        FROM students s
        LEFT JOIN sales_items si ON s.id = si.id_student
        WHERE 1=1
        ${baseFilters}
        GROUP BY s.id, s.uuid, s.email, s.status, s.full_name, s.document_number, 
                 s.whatsapp, s.bank_code, s.account_agency, s.account_number, 
                 s.address, s.created_at, s.updated_at
        ORDER BY s.id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            limit,
            offset,
            ...baseReplacements,
          },
        },
      );

      const countResult = await Students.sequelize.query(
        `
        SELECT COUNT(DISTINCT s.id) as total
        FROM students s
        WHERE 1=1
        ${baseFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: baseReplacements,
        },
      );

      const total = countResult[0]?.total || 0;

      return {
        rows: results.map((row) => ({
          ...row,
          total_sales: Number(row.total_sales),
          total_spent: Number(row.total_spent),
        })),
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar students com stats de vendas:', error);
      throw error;
    }
  }

  static async findStudentWithSalesInfo(studentUuid) {
    try {
      const results = await Students.sequelize.query(
        `
        SELECT 
          s.id,
          s.uuid,
          s.email,
          s.status,
          s.full_name,
          s.document_number,
          s.whatsapp,
          s.bank_code,
          s.account_agency,
          s.account_number,
          s.address,
          s.created_at,
          s.updated_at,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_spent,
          MAX(si.created_at) as last_purchase_date,
          MIN(si.created_at) as first_purchase_date,
          COUNT(CASE WHEN si.id_status = 2 THEN 1 END) as paid_sales,
          COUNT(CASE WHEN si.id_status = 3 THEN 1 END) as pending_sales,
          COUNT(CASE WHEN si.id_status = 4 THEN 1 END) as processing_sales,
          COUNT(CASE WHEN si.id_status = 5 THEN 1 END) as completed_sales,
          COUNT(CASE WHEN si.id_status = 6 THEN 1 END) as delivered_sales,
          COUNT(CASE WHEN si.id_status = 7 THEN 1 END) as cancelled_sales,
          COUNT(CASE WHEN si.id_status = 8 THEN 1 END) as refunded_sales
        FROM students s
        LEFT JOIN sales_items si ON s.id = si.id_student
        WHERE s.uuid = :studentUuid
        GROUP BY s.id, s.uuid, s.email, s.status, s.full_name, s.document_number, 
                 s.whatsapp, s.bank_code, s.account_agency, s.account_number, 
                 s.address, s.created_at, s.updated_at
        LIMIT 1
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { studentUuid },
        },
      );

      if (!results || results.length === 0) {
        return null;
      }

      const result = results[0];
      return {
        ...result,
        total_sales: Number(result.total_sales),
        total_spent: Number(result.total_spent),
        paid_sales: Number(result.paid_sales),
        pending_sales: Number(result.pending_sales),
        processing_sales: Number(result.processing_sales),
        completed_sales: Number(result.completed_sales),
        delivered_sales: Number(result.delivered_sales),
        cancelled_sales: Number(result.cancelled_sales),
        refunded_sales: Number(result.refunded_sales),
      };
    } catch (error) {
      console.error('Erro ao buscar student com informações de vendas:', error);
      throw error;
    }
  }
};

import ExcelJS from 'exceljs';
import { PassThrough } from 'stream';
import { date as dateHelper } from '../utils/date.mjs';
import { capitalizeName } from '../utils/formatters.mjs';
import { Affiliates } from '../database/models/Affiliates.mjs';
import { Op } from 'sequelize';

const normalizeStatus = (id_status) => {
  if (id_status == null) return null;
  if (typeof id_status === 'number' || typeof id_status === 'string') return id_status;
  if (typeof id_status === 'object') {
    if (typeof id_status.ne !== 'undefined') return { [Op.ne]: id_status.ne };
    if (typeof id_status.eq !== 'undefined') return { [Op.eq]: id_status.eq };
    if (Array.isArray(id_status.in)) return { [Op.in]: id_status.in };
    if (Array.isArray(id_status.notIn)) return { [Op.notIn]: id_status.notIn };
  }
  return null;
};

export const formatWhere = ({ product_uuid, id_status, input }) => {
  let where = {};
  if (product_uuid) where = { ...where, '$product.uuid$': product_uuid };
  const statusValue = normalizeStatus(id_status);
  if (statusValue !== null) where.status = statusValue;
  if (input) {
    let orObject = {
      '$user.first_name$': { [Op.like]: `%${input}%` },
      '$user.last_name$': { [Op.like]: `%${input}%` },
      '$user.email$': { [Op.like]: `%${input}%` },
    };
    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0) {
      orObject = {
        ...orObject,
        '$user.document_number$': {
          [Op.like]: `%${sanitizedInput}%`,
        },
      };
    }
    where = {
      ...where,
      [Op.or]: orObject,
    };
  }

  return where;
};

const getHeaders = () => [
  { header: 'Nome', key: 'full_name', width: 30 },
  { header: 'Email', key: 'email', width: 30 },
  { header: 'Whatsapp', key: 'whatsapp', width: 16 },
  { header: 'Produto', key: 'product_name', width: 30 },
  { header: 'Comissao', key: 'commission', width: 10 },
  { header: 'Aceito em', key: 'accepted_at', width: 20 },
];

const formatRow = ({
  commission,
  updated_at,
  product: { name: product_name } = {},
  user: { full_name, email, whatsapp } = {},
}) => ({
  full_name: capitalizeName(full_name),
  email,
  whatsapp,
  product_name,
  commission,
  accepted_at: updated_at ? dateHelper(updated_at).format('DD/MM/YYYY') : '',
});

const fetchAffiliates = async (query) => {
  const where = formatWhere(query);
  const limit = 500;
  let offset = 0;
  const affiliatesToExport = [];

  while (true) {
    const affiliates = await Affiliates.findAll({
      where,
      attributes: ['id', 'commission', 'status', 'updated_at'],
      limit,
      offset,
      nest: true,
      distinct: true,
      subQuery: false,
      paranoid: true,
      order: [['created_at', 'DESC']],
      group: ['id'],
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid'],
          where: { id_user: query.id_user },
        },
        {
          association: 'user',
          attributes: ['full_name', 'email', 'whatsapp', 'instagram', 'tiktok', 'document_number'],
        },
      ],
    });

    if (!affiliates.length) break;
    affiliatesToExport.push(...affiliates.map((affiliate) => affiliate.toJSON()));
    offset += limit;
    if (affiliates.length < limit) break;
  }

  return affiliatesToExport;
};

const generateWorkbookBuffer = async (rows) => {
  const headers = getHeaders();
  const stream = new PassThrough();
  const buffers = [];
  const finished = new Promise((resolve, reject) => {
    stream.on('data', (chunk) => buffers.push(chunk));
    stream.on('finish', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);
  });

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    useStyles: true,
    useSharedStrings: true,
    stream,
  });

  const worksheet = workbook.addWorksheet();
  worksheet.columns = headers;

  // Estiliza o cabeçalho (linha 1) igual ao de vendas.
  const headerRow = worksheet.getRow(1);
  headers.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F1B35' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  headerRow.commit();

  for (const row of rows) {
    const excelRow = worksheet.addRow(row);
    excelRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    excelRow.commit();
  }

  worksheet.commit();
  await workbook.commit();
  return finished;
};

export class ExportXLS {
  constructor(query) {
    this.query = query;
  }

  async execute() {
    const affiliates = await fetchAffiliates(this.query);
    const data = affiliates.map(formatRow);
    const buffer = await generateWorkbookBuffer(data);
    return buffer;
  }
}

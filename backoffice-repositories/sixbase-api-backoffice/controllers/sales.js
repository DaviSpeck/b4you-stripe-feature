const exceljs = require('exceljs');
const fs = require('fs');
const path = require('path');
const { Op, literal } = require('sequelize');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const ApiError = require('../error/ApiError');
const SalesItemsRepository = require('../repositories/sequelize/SalesItemsRepository');
const FindSales = require('../useCases/sales/FindSales');
const SerializeOverallSales = require('../presentation/sales/SerializeOverallSales');
const { salesStatus, findStatus } = require('../status/salesStatus');
const { capitalizeName, formatBRL } = require('../utils/formatters');
const { FRONTEND_DATE, DATABASE_DATE } = require('../types/dateTypes');
const date = require('../utils/helpers/date');
const CreateRefund = require('../useCases/refunds/CreateRefund');
const Charges = require('../database/models/Charges');
const { findChargeStatus } = require('../status/chargeStatus');
const Sales_items = require('../database/models/Sales_items');
const database = require('../database/models/index');
const { serializeSale } = require('../presentation/sales/serializeSingleSale');
const { findSaleItemsType } = require('../types/saleItemsTypes');
const Sales = require('../database/models/Sales');
const FindSalesCommissions = require('../useCases/sales/FindSalesCommissions');
const { findSaleItemRefund } = require('../database/controllers/sales_items');

const LOGO_PATH = path.resolve(__dirname, '../images/logo.png');
const {
  salesDetailedColumns,
  salesSimplifiedColumns,
} = require('../mocks/excelColumns.mock');

module.exports.findSingleSale = async (req, res, next) => {
  const {
    params: { saleItemUuid },
  } = req;
  try {
    const saleItem = await Sales_items.findOne({
      subQuery: false,
      distinct: true,
      attributes: [
        'created_at',
        'id',
        'price',
        'id_status',
        'uuid',
        'payment_method',
        'paid_at',
        'valid_refund_until',
        'type',
        'id_affiliate',
        'tracking_code',
        'tracking_url',
        'tracking_company',
        'credit_card',
        'price_total',
        'price_product',
      ],
      where: { uuid: saleItemUuid },
      include: [
        { association: 'sale', attributes: ['params'] },
        {
          association: 'product',
          attributes: [
            'name',
            'uuid',
            'support_email',
            'support_whatsapp',
            'id_type',
            'payment_type',
          ],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['full_name', 'email', 'uuid'],
            },
          ],
        },
        {
          association: 'affiliate',
          attributes: ['id'],
          include: [
            {
              association: 'user',
              attributes: ['first_name', 'last_name', 'uuid'],
            },
          ],
        },
        {
          association: 'refund',
          attributes: ['created_at', 'id_status', 'updated_at'],
        },
        {
          association: 'charges',
          attributes: [
            'installments',
            'price',
            'psp_id',
            'provider',
            'provider_id',
            'billet_url',
            'uuid',
            'provider_response_details',
          ],
        },
        {
          association: 'referral_commission',
          required: false,
          attributes: ['amount', 'id_status', 'release_date'],
          include: [
            {
              association: 'user',
              attributes: ['full_name', 'uuid'],
            },
          ],
        },
      ],
    });

    return res.status(200).send(serializeSale(saleItem));
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

module.exports.card_approval = async (req, res, next) => {
  const {
    query: { start_date, end_date },
  } = req;
  try {
    const promises = [];
    promises.push(
      Sales_items.count({
        col: '*',
        where: {
          id_status: 2,
          payment_method: 'card',
          paid_at: {
            [Op.between]: [
              date(start_date).format(DATABASE_DATE),
              date(end_date).format(DATABASE_DATE),
            ],
          },
        },
      }),
    );
    promises.push(
      database.sequelize.query(
        "select count(distinct id_student, id_product) as total from sales_items where id_status = 3 and payment_method = 'card' and created_at between :start_date and :end_date",
        {
          replacements: {
            start_date: date(start_date).format(DATABASE_DATE),
            end_date: date(end_date).format(DATABASE_DATE),
          },
          plain: true,
        },
      ),
    );
    const [paid, denied] = await Promise.all(promises);
    const total = paid + denied.total;
    return res.json({ card_approval: paid / total });
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

module.exports.refundSale = async (req, res, next) => {
  const { uuid } = req.params;
  const {
    bank_code,
    agency: account_agency,
    account_number,
    account_type,
  } = req.body;

  let bankAccount = {};
  if (bank_code && account_agency && account_number && account_type) {
    bankAccount = {
      bank_code,
      account_number,
      account_agency,
      account_type,
    };
  }

  try {
    await new CreateRefund({
      saleUuid: uuid,
      bankAccount,
    }).execute();

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

module.exports.generateRefundReceipt = async (req, res, next) => {
  const {
    params: { saleItemUuid },
  } = req;

  try {
    const refund = await findSaleItemRefund({ uuid: saleItemUuid });
    if (!refund) throw ApiError.badRequest('Refund not found');

    const charge = refund.charges?.[0];
    const pdfDoc = await PDFDocument.create();
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { height, width } = page.getSize();
    let y = height - 60;

    const brandColor = rgb(0.27, 0.8, 0.69);
    const darkTextColor = rgb(0.1, 0.1, 0.1);
    const lightBackground = rgb(0.95, 1, 0.98);
    const mediumGray = rgb(0.7, 0.7, 0.7);
    const leftMargin = 60;

    const drawText = (
      text,
      x,
      textY,
      size = 12,
      font = normalFont,
      color = darkTextColor,
    ) => {
      page.drawText(text ?? '-', { x, y: textY, size, font, color });
    };

    const drawLine = (x1, y1, x2, y2, thickness = 0.5, color = mediumGray) => {
      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness,
        color,
      });
    };

    const drawRectangle = (
      x,
      rectY,
      rectWidth,
      rectHeight,
      borderColor = brandColor,
      fillColor,
      borderWidth = 1,
      borderRadius = 0,
    ) => {
      const rectOptions = {
        x,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        borderColor,
        borderWidth,
        borderRadius,
      };
      if (fillColor !== undefined) {
        rectOptions.color = fillColor;
      }
      page.drawRectangle(rectOptions);
    };

    const drawLabelValue = (label, value) => {
      const displayValue = value ?? '-';
      drawText(label, leftMargin, y, 12, normalFont);
      const valueWidth = normalFont.widthOfTextAtSize(String(displayValue), 12);
      drawText(
        String(displayValue),
        width - leftMargin - valueWidth,
        y,
        12,
        normalFont,
      );

      y -= 5;
      drawLine(leftMargin, y, width - leftMargin, y);
      y -= 14;
    };

    const drawSectionTitle = (title) => {
      y -= 26;
      drawText(title, leftMargin, y, 10, boldFont);
      y -= 25;
    };

    drawRectangle(
      50,
      height - 100,
      width - 100,
      40,
      brandColor,
      undefined,
      1,
      10,
    );
    drawText(
      'Comprovante de estorno',
      leftMargin,
      height - 85,
      14,
      boldFont,
      brandColor,
    );

    try {
      const logoBytes = fs.readFileSync(LOGO_PATH);
      const pngImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(pngImage, {
        width: 70,
        height: 70,
        x: width - 130,
        y: height - 115,
      });
    } catch (err) {}

    y = height - 140;
    drawText(
      'Olá, informamos que o estorno da sua cobrança foi efetuado com sucesso.',
      leftMargin,
      y,
      12,
      boldFont,
    );

    drawSectionTitle('Dados do estorno');
    const amount = charge?.price || refund.price_total || 0;
    drawLabelValue(
      'Código da cobrança:',
      charge?.psp_id || charge?.uuid || refund.id || '-',
    );
    drawLabelValue(
      'Data da cobrança:',
      charge?.paid_at ? date(charge.paid_at).format('DD/MM/YYYY') : '-',
    );
    drawLabelValue('Valor da cobrança:', formatBRL(amount));
    drawLabelValue(
      'Data do cancelamento:',
      charge?.updated_at ? date(charge.updated_at).format('DD/MM/YYYY') : '-',
    );
    drawLabelValue('Valor do cancelamento:', formatBRL(amount));

    drawSectionTitle('Dados do titular');
    const methodLabel =
      refund.payment_method === 'billet'
        ? 'Boleto'
        : refund.payment_method === 'pix'
        ? 'Pix'
        : 'Cartão de crédito';
    drawLabelValue('Tipo de transação:', methodLabel);
    drawLabelValue(
      'Nome do titular:',
      capitalizeName(refund.sale?.full_name || ''),
    );
    const cardData = refund.credit_card;
    if (
      (refund.payment_method === 'card' ||
        refund.payment_method === 'credit_card') &&
      cardData
    ) {
      drawLabelValue(
        'Número do cartão:',
        `XXXX-XXXX-XXXX-${cardData.last_four || '----'}`,
      );
      if (cardData.brand) {
        drawLabelValue('Bandeira do cartão:', capitalizeName(cardData.brand));
      }
      if (charge?.installments) {
        drawLabelValue('Número de parcelas:', `${charge.installments}`);
      }
    }

    y -= 20;
    const attentionBoxHeight = 60;
    drawRectangle(
      50,
      y - attentionBoxHeight,
      width - 100,
      attentionBoxHeight,
      brandColor,
      lightBackground,
      1,
      10,
    );
    drawText('Atenção:', leftMargin, y - 15, 11, boldFont);
    const attentionText =
      'O crédito concedido dependerá da data de fechamento da fatura e só poderá ser realizado mediante ao banco emissor do cartão. Em caso de dúvida, entre em contato com seu banco.';
    const words = attentionText.split(' ');
    const maxWidth = width - 2 * leftMargin;
    y -= 30;
    let line = '';
    for (const word of words) {
      const testLine = `${line + word} `;
      if (normalFont.widthOfTextAtSize(testLine, 10) > maxWidth) {
        drawText(line, leftMargin, y, 10, normalFont);
        y -= 14;
        line = `${word} `;
      } else {
        line = testLine;
      }
    }
    drawText(line, leftMargin, y, 10, normalFont);

    y = 80;
    drawText('Atenciosamente,', leftMargin, y, 11, normalFont);
    y -= 16;
    drawText('Equipe Backoffice', leftMargin, y, 11, boldFont);
    y -= 16;
    drawText('Brasília-DF', leftMargin, y, 11, normalFont);
    drawText(
      date(new Date()).format('DD/MM/YYYY'),
      width - 100,
      y,
      11,
      normalFont,
    );

    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    return res.status(200).send(Buffer.from(pdfBytes));
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

module.exports.findSalesPaginated = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      id_status,
      start_date,
      end_date,
      payment_method = 'all',
      input,
    },
  } = req;
  try {
    const { rows, count, total } = await new FindSales(
      SalesItemsRepository,
    ).executeWithSQL({
      end_date,
      id_status,
      page,
      size,
      start_date,
      payment_method,
      input,
    });
    return res.send({
      count,
      rows: new SerializeOverallSales(rows).adapt(),
      total,
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

module.exports.findSalesIp = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input },
  } = req;
  try {
    const offset = Number(page) * Number(size);
    const limit = Number(size);

    const where = {
      [Op.and]: [literal(`JSON_EXTRACT(params, '$.ip') IS NOT NULL`)],
    };

    if (input) {
      where[Op.and].push(literal(`JSON_EXTRACT(params, '$.ip') = '${input}'`));
    }

    const { count, rows: sales } = await Sales.findAndCountAll({
      where,
      offset,
      limit,
      order: [['id', 'desc']],
      attributes: ['id', 'params', 'created_at'],
      logging: false,
    });

    const saleIds = sales.map((s) => s.id);

    const items = await Sales_items.findAll({
      where: {
        id_sale: {
          [Op.in]: saleIds,
        },
      },
      include: [
        {
          association: 'product',
          attributes: ['uuid', 'name'],
          include: [{ association: 'producer', attributes: ['uuid'] }],
        },
        {
          association: 'student',
          attributes: ['uuid', 'full_name', 'email', 'document_number'],
        },
      ],
      attributes: [
        'created_at',
        'price',
        'id_sale',
        'id_product',
        'id_student',
        'payment_method',
        'id_status',
        'paid_at',
      ],
    });

    const grouped = sales.map((sale) => ({
      ...sale.toJSON(),
      items: items
        .filter((item) => item.id_sale === sale.id)
        .map((e) => ({
          ...e.toJSON(),
          status: findStatus(e.id_status),
        })),
    }));
    return res.send({
      count,
      rows: grouped,
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

module.exports.findStatus = async (req, res, next) => {
  try {
    return res.send(salesStatus);
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

const methods = {
  card: 'Cartão de crédito',
  pix: 'Pix',
  billet: 'Boleto',
};

const resolveProductType = (id_type) => {
  if (id_type === 1 || id_type === 2) {
    return 'Digital';
  }

  if (id_type === 3) {
    return 'Somente Pagamento';
  }

  if (id_type === 4) {
    return 'Físico';
  }

  return ' - ';
};

const transacaobject = ({
  created_at,
  updated_at,
  paid_at,
  payment_method,
  affiliate,
  product,
  id_status,
  offer,
  student,
  commissions,
  charges,
  price_total,
  company_net_profit_amount,
  company_gross_profit_amount,
  fee_fixed,
  fee_variable_amount,
  interest_installment_amount,
  price_product,
  tax_total,
  type,
  sale,
}) => {
  const producerCommissions = commissions.find((t) => t.id_role === 1);
  const coproducersCommissions = commissions.filter((t) => t.id_role === 2);
  const affiliateCommission = commissions.find((t) => t.id_role === 3);
  const psp_cost_total = charges.reduce((acc, t) => {
    acc += t.psp_cost_total;
    return acc;
  }, 0);

  const { address } = sale;

  return {
    id_pay42: charges[0].psp_id,
    provider: charges[0].provider,
    provider_id: charges[0].provider_id,
    sale_type: findSaleItemsType(type).name,
    full_name: capitalizeName(product.producer.full_name),
    document_number: student.document_number,
    product_name: capitalizeName(product.name),
    product_type: resolveProductType(product.id_type),
    status: findStatus(id_status).name,
    offer_name: offer ? capitalizeName(offer.name) : ' - ',
    created_at: date(created_at).format(FRONTEND_DATE),
    updated_at: date(updated_at).format(FRONTEND_DATE),
    paid_at: paid_at ? date(paid_at).format(FRONTEND_DATE) : ' - ',
    affiliate_name: affiliate
      ? capitalizeName(`${affiliate.user.full_name}`)
      : ' - ',
    payment_method: methods[payment_method],
    gross_profit: company_gross_profit_amount,
    net_profit: company_net_profit_amount,
    gross_percentage: fee_variable_amount ?? 0,
    gross_fixed: fee_fixed ?? 0,
    installment_amount: interest_installment_amount ?? 0,
    cost_total: psp_cost_total + tax_total,
    producer_commission: producerCommissions?.amount ?? 0,
    coproducers_commissions:
      coproducersCommissions.length > 0
        ? coproducersCommissions.reduce((acc, t) => {
            acc += t.amount;
            return acc;
          }, 0)
        : 0,
    affiliate_commission: affiliateCommission ? affiliateCommission.amount : 0,
    installments: charges[0].installments,
    offer_price: price_product,
    paid_price: price_total,
    street: address.street,
    number: address.number,
    neighborhood: address.neighborhood,
    complement: address.complement,
    city: address.city,
    state: address.state,
    zipcode: address.zipcode,
  };
};

// eslint-disable-next-line consistent-return
module.exports.exportSales = async (req, res, next) => {
  const {
    query: { start_date, end_date, id_status = 'all', payment_method = 'all' },
  } = req;
  try {
    const filename = `${start_date}_${end_date}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    let offset = 0;

    const workbook = new exceljs.stream.xlsx.WorkbookWriter({
      useStyles: true,
      useSharedStrings: true,
      filename,
      stream: res,
    });

    const worksheet = workbook.addWorksheet();
    worksheet.columns = salesDetailedColumns;

    let total = 100;
    while (total !== 0) {
      // eslint-disable-next-line no-await-in-loop
      const sales = await SalesItemsRepository.findToExport({
        id_status,
        end_date,
        offset,
        start_date,
        payment_method,
      });
      total = sales.length;
      if (total < 200) {
        total = 0;
      }
      offset += 200;
      for (const sale of sales) {
        worksheet.addRow(transacaobject(sale)).commit();
      }
    }

    worksheet.commit();
    await workbook.commit();
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

const translateChargePaymentMethod = (pm) => {
  if (pm === 'billet') {
    return 'Boleto';
  }

  if (pm === 'pix') {
    return 'Pix';
  }

  return 'Cartão de crédito';
};

// eslint-disable-next-line
module.exports.exportCharges = async (req, res, next) => {
  const {
    query: { start_date, end_date, id_status = 'all', payment_method = 'all' },
  } = req;
  try {
    const filename = `${start_date}_${end_date}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    const workbook = new exceljs.stream.xlsx.WorkbookWriter({
      filename,
      stream: res,
      useSharedStrings: true,
      useStyles: true,
    });

    const worksheet = workbook.addWorksheet();
    worksheet.columns = salesSimplifiedColumns;

    let where = {
      [Op.or]: {
        created_at: {
          [Op.between]: [
            date(start_date).startOf('day').format(DATABASE_DATE),
            date(end_date).endOf('day').format(DATABASE_DATE),
          ],
        },
        paid_at: {
          [Op.between]: [
            date(start_date).startOf('day').format(DATABASE_DATE),
            date(end_date).endOf('day').format(DATABASE_DATE),
          ],
        },
      },
    };

    if (id_status !== 'all') {
      let status = 0;
      const numberStatus = parseInt(id_status, 10);
      if (numberStatus === 1) {
        status = 1;
      }

      if (numberStatus === 2) {
        status = 2;
      }

      if (numberStatus === 3) {
        status = 4;
      }

      if (numberStatus === 5) {
        status = 7;
      }

      where.id_status = status;

      if (numberStatus === 4) {
        status = 5;
        delete where.id_status;
        where = {
          ...where,
          [Op.and]: {
            id_status: [2, 5],
            refund_amount: {
              [Op.gt]: 0,
            },
          },
        };
      }
    }

    if (payment_method !== 'all') {
      where.payment_method = payment_method;
      if (payment_method === 'card') {
        where.payment_method = 'credit_card';
      }
    }

    const PAGE_SIZE = 200;
    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const charges = await Charges.findAll({
        nest: true,
        where,
        logging: false,
        offset,
        limit: PAGE_SIZE,
        subQuery: false,
        order: [['id', 'asc']],
        distinct: true,
        attributes: [
          'uuid',
          'psp_id',
          'created_at',
          'paid_at',
          'payment_method',
          'installments',
          'price',
          'id_status',
          'provider',
          'provider_id',
          'refund_amount',
        ],
        include: [
          {
            association: 'student',
            attributes: ['document_number', 'email'],
          },
          {
            association: 'sales_items',
            duplicating: false,
            attributes: [
              'id',
              'fee_variable_amount',
              'fee_fixed',
              'id',
              'interest_installment_amount',
            ],
            include: [
              {
                association: 'commissions',
                duplicating: false,
                separate: true,
                attributes: ['id', 'amount'],
              },
            ],
          },
        ],
      });
      const returned = charges.length;
      for (const charge of charges) {
        const { sales_items } = charge;
        worksheet
          .addRow({
            uuid: charge.uuid,
            id_pay42: charge.psp_id,
            provider: charge.provider,
            provider_id: charge.provider_id,
            created_at: date(charge.created_at).format('YYYY-MM-DD HH:mm:ss'),
            paid_at: charge.paid_at
              ? date(charge.paid_at).format('YYYY-MM-DD HH:mm:ss')
              : ' - ',
            status: findChargeStatus(charge.id_status).label,
            payment_method: translateChargePaymentMethod(charge.payment_method),
            document_number: charge.student.document_number,
            email: charge.student.email,
            installments: charge.installments,
            price: charge.price,
            fee_fixed: sales_items.reduce((acc, v) => {
              acc += v.fee_fixed;
              return acc;
            }, 0),
            fee_variable_amount: sales_items.reduce((acc, v) => {
              acc += v.fee_variable_amount;
              return acc;
            }, 0),
            interest_installment_amount: sales_items.reduce((acc, v) => {
              acc += v.interest_installment_amount;
              return acc;
            }, 0),
            commissions: sales_items.reduce((acc, v) => {
              acc += v.commissions.reduce((a, c) => {
                a += c.amount;
                return a;
              }, 0);
              return acc;
            }, 0),
            refund_amount: charge.refund_amount ?? 0,
          })
          .commit();
      }
      if (returned === 0 || returned < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    worksheet.commit();
    await workbook.commit();
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

module.exports.findSalesCommissions = async (req, res, next) => {
  const {
    params: { saleUuid },
  } = req;
  try {
    const sales = await new FindSalesCommissions(
      SalesItemsRepository,
    ).executeWithSQL(saleUuid);
    return res.send(sales);
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

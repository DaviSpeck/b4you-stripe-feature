const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const ApiError = require('../../error/ApiError');
const CreateRefundUseCase = require('../../useCases/dashboard/sales/CreateRefund');
const IntegrationNotifications = require('../../database/models/IntegrationNotifications');
const SerializeSaleItem = require('../../presentation/dashboard/refunds/saleItem');
const {
  findSaleItemRefund,
  findSaleItemSale,
} = require('../../database/controllers/sales_items');
const dateHelper = require('../../utils/helpers/date');
const {
  formatBRL,
  capitalizeName,
  removeEmojis,
} = require('../../utils/formatters');
const {
  findIntegrationNotificationTypeByKey,
} = require('../../types/integrationNotificationTypes');

const imagePath = path.resolve(__dirname, '../../images/logo.png');
const imageBytes = fs.readFileSync(imagePath); // PNG or JPG
const Plugins = require('../../database/models/Plugins');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const SQS = require('../../queues/aws');
const models = require('../../database/models/index');

const resolvePaymentMethod = (payment_method) => {
  if (payment_method === 'card') return 'Cartão de crédito';
  if (payment_method === 'billet') return 'Boleto';
  return 'Pix';
};

const createProducerRefundController = async (req, res, next) => {
  const {
    params: { sale_item_id },
    body: { reason, bank_account },
    user: { id, full_name, email },
  } = req;
  try {
    const saleItem = await findSaleItemSale({
      uuid: sale_item_id,
    });

    const sanitizedReason = reason ? removeEmojis(reason) : reason;

    await models.sequelize.transaction(async (t) => {
      await new CreateRefundUseCase({
        reason: sanitizedReason,
        sale_item_uuid: sale_item_id,
        bank_account,
        producer: { id, full_name, email },
      }).execute();

      t.afterCommit(async () => {
        const plugin = await Plugins.findOne({
          where: {
            id_user: id,
            id_plugin: [findIntegrationTypeByKey('tiny').id],
          },
        });

        if (plugin && saleItem.sale.id_order_tiny != null) {
          try {
            await SQS.add('tinyShipping', {
              sale_id: saleItem.id_sale,
            });
          } catch (error) {
            console.log(`error on tiny shipping ${saleItem.id_sale}`, error);
          }
        }

        try {
          console.log('trying call refund bling', saleItem.id_sale);
          await SQS.add('blingRefund', {
            sale_id: saleItem.id_sale,
          });
        } catch (error) {
          console.log(`error on cancel order bling ${saleItem.id_sale}`, error);
        }

        try {
          console.log(
            'trying create notification',
            saleItem.id_sale,
            sanitizedReason,
          );
          await IntegrationNotifications.create({
            id_user: saleItem.sale.id_user,
            id_type: findIntegrationNotificationTypeByKey('refund').id,
            id_sale: saleItem.id_sale,
            id_sale_item: saleItem.id,
            read: false,
            params: {
              message: `Reembolso feito pelo produtor ou colaboradores. Motivo: ${sanitizedReason}`,
              action: 'Verique com cautela os dados do comprador',
            },
          });
        } catch (e) {
          console.log('error on generate notifications refund sale', e);
        }

        try {
          console.log('trying shopify refund', saleItem.id);
          SQS.add('shopify', {
            id_sale_item: saleItem.id,
            status: 'refunded',
          });
        } catch (error) {
          console.log('error on cancel shopify', error);
        }
      });
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findSaleRefundController = async (req, res, next) => {
  const {
    params: { sale_item_id },
    user: { id },
  } = req;
  try {
    const saleItem = await findSaleItemRefund({
      uuid: sale_item_id,
      '$product.id_user$': id,
    });
    if (!saleItem) throw ApiError.badRequest('Item de venda não encontrado');
    return res.status(200).send(new SerializeSaleItem(saleItem).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const generateRefundPDFController = async (req, res, next) => {
  const {
    params: { sale_item_id },
  } = req;

  try {
    const refund = await findSaleItemRefund({ uuid: sale_item_id });
    if (!refund) throw ApiError.badRequest('Refund not found');
    const pdfDoc = await PDFDocument.create();
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { height, width } = page.getSize();
    let y = height - 60;

    const brandColor = rgb(0.27, 0.8, 0.69);
    const darkTextColor = rgb(0.1, 0.1, 0.1);
    const lightBackground = rgb(0.95, 1, 0.98);
    const mediumGray = rgb(0.7, 0.7, 0.7);
    const pngImage = await pdfDoc.embedPng(imageBytes); // or embedJpg()
    const drawText = (
      text,
      x,
      textY,
      size = 12,
      font = normalFont,
      color = darkTextColor,
    ) => {
      page.drawText(text, { x, y: textY, size, font, color });
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
      fillColor = undefined,
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
      drawText(label, 60, y, 12, normalFont);
      const valueWidth = normalFont.widthOfTextAtSize(value, 12);
      drawText(value, width - 60 - valueWidth, y, 12, normalFont);

      y -= 5; // increased from 16 to 14 for tighter block
      drawLine(60, y, width - 60, y); // keep line right after the text
      y -= 14; // increased spacing after line
    };

    const drawSectionTitle = (title) => {
      y -= 26; // more vertical margin above sections
      drawText(title, 60, y, 10, boldFont);
      y -= 25;
    };

    // Header with rounded border, no fillColor
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
      60,
      height - 85,
      14,
      boldFont,
      brandColor,
    );

    page.drawImage(pngImage, {
      width: 70,
      height: 70,
      x: width - 130,
      y: height - 115,
    });

    y = height - 140;
    drawText(
      'Olá, informamos que o estorno da sua cobrança foi efetuado com sucesso.',
      60,
      y,
      12,
      boldFont,
    );

    // Refund section
    drawSectionTitle('Dados do estorno');
    drawLabelValue('Código da cobrança:', refund.uuid);
    drawLabelValue(
      'Data da cobrança:',
      dateHelper(refund.charges[0].paid_at).format('DD/MM/YYYY'),
    );
    drawLabelValue('Valor da cobrança:', formatBRL(refund.price_total));
    drawLabelValue(
      'Data do cancelamento:',
      dateHelper(refund.charges[0].updated_at).format('DD/MM/YYYY'),
    );
    drawLabelValue('Valor do cancelamento:', formatBRL(refund.price_total));

    // Cardholder section
    drawSectionTitle('Dados do titular');
    drawLabelValue(
      'Tipo de transação:',
      resolvePaymentMethod(refund.payment_method),
    );
    drawLabelValue('Nome do titular:', capitalizeName(refund.sale.full_name));
    if (refund.payment_method === 'card') {
      drawLabelValue(
        'Número do cartão:',
        `XXXX-XXXX-XXXX-${refund.credit_card.last_four}`,
      );
      drawLabelValue(
        'Bandeira do cartão:',
        capitalizeName(refund.credit_card.brand),
      );
      drawLabelValue(
        'Número de parcelas:',
        `${refund.charges[0].installments}`,
      );
    }

    // Attention box
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
    drawText('Atenção:', 60, y - 15, 11, boldFont);
    const attentionText =
      'O crédito concedido dependerá da data de fechamento da fatura e só poderá ser realizado mediante ao banco emissor do cartão. Em caso de dúvida, entre em contato com seu banco.';
    const words = attentionText.split(' ');
    const maxWidth = width - 120;
    let line = '';
    y -= 30;
    for (const word of words) {
      const testLine = `${line + word} `;
      if (normalFont.widthOfTextAtSize(testLine, 10) > maxWidth) {
        drawText(line, 60, y, 10, normalFont);
        y -= 14;
        line = `${word} `;
      } else {
        line = testLine;
      }
    }
    drawText(line, 60, y, 10, normalFont);

    // Footer
    y = 80;
    drawText('Atenciosamente,', 60, y, 11, normalFont);
    y -= 16;
    drawText('Equipe B4You', 60, y, 11, boldFont);
    y -= 16;
    drawText('Brasília-DF', 60, y, 11, normalFont);
    drawText(
      dateHelper(new Date()).format('DD/MM/YYYY'),
      width - 100,
      y,
      11,
      normalFont,
    );

    // Output PDF
    const pdfBytes = await pdfDoc.save();
    res.contentType('application/pdf');
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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
  createProducerRefundController,
  findSaleRefundController,
  generateRefundPDFController,
};

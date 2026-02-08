import { Op } from 'sequelize';
import { Sales_items } from '../models/Sales_items.mjs';
import { date } from '../../utils/date.mjs';
import { findStatus } from '../../status/salesStatus.mjs';
import { findRefundStatus } from '../../status/refundStatus.mjs';
import { findSaleItemsType } from '../../types/saleItemsTypes.mjs';
import { trackingEmail } from '../../email/messages.mjs';
import { MailService } from '../../services/MailService.mjs';
import { formatUrl, capitalizeName } from '../../utils/formatters.mjs';

const {
  MAILJET_EMAIL_SENDER,
  MAILJET_TEMPLATE_ID,
  MAILJET_PASSWORD,
  MAILJET_USERNAME,
} = process.env;

const EmailService = new MailService({
  userName: MAILJET_USERNAME,
  password: MAILJET_PASSWORD,
  emailSender: MAILJET_EMAIL_SENDER,
  templateID: MAILJET_TEMPLATE_ID,
});

export const findSalesProductsPaginated = async ({
  id_user,
  page,
  size,
  order_id,
  updated_at_start,
  updated_at_end,
}) => {
  const factor = parseInt(page, 10);
  const limit = parseInt(size, 10);
  const offset = factor * limit;
  const where = {
    '$product.id_user$': id_user,
  };
  if (order_id) {
    where.uuid = order_id;
  }
  if (updated_at_start && updated_at_end) {
    where.updated_at = {
      [Op.between]: [
        date(updated_at_start).startOf('day').utc(),
        date(updated_at_end).endOf('day').utc(),
      ],
    };
  }
  const sales = await Sales_items.findAndCountAll({
    where,
    limit,
    offset,
    attributes: [
      'uuid',
      'price',
      'created_at',
      'updated_at',
      'paid_at',
      'valid_refund_until',
      'tracking_code',
      'tracking_url',
      'tracking_company',
      'payment_method',
      'is_upsell',
      'id_status',
      'id_sale',
      'type',
      'quantity',
    ],
    include: [
      {
        association: 'product',
        attributes: [
          'name',
          'cover',
          'header_picture',
          'thumbnail',
          'logo',
          'banner',
          'id_nano',
        ],
      },
      {
        association: 'refunds',
        required: false,
        attributes: [
          'requested_by_student',
          'reason',
          'description',
          'created_at',
          'updated_at',
          'id_status',
        ],
      },
      {
        association: 'student',
        attributes: [
          'full_name',
          'email',
          'document_number',
          'document_type',
          'document_number',
          'whatsapp',
          'profile_picture',
          'status',
          'created_at',
        ],
      },
      {
        association: 'sale',
        attributes: ['address'],
      },
    ],
  });
  sales.rows = sales.rows.map((elem) => {
    const { id_status, refunds, type, ...rest } = elem.toJSON();
    let refund = null;
    if (refunds) {
      const { id_status: id_status_refund, ...restRefund } = refunds;
      refund = {
        ...restRefund,
        status: findRefundStatus(elem.refunds.id_status),
      };
    }
    return {
      ...rest,
      status: findStatus(id_status),
      refunds: refund,
      type: findSaleItemsType(type),
    };
  });
  return sales;
};

export const updateSales = async (id_user, fulfillments) => {
  for await (const s of fulfillments) {
    const sale = await Sales_items.findOne({
      where: {
        uuid: s.order_id,
        '$product.id_user$': id_user,
      },
      attributes: ['id'],
      include: [
        {
          association: 'product',
          attributes: ['id_user', 'name', 'id'],
        },
        { association: 'student', attributes: ['email', 'full_name'] },
      ],
    });
    if (sale) {
      try {
        await Sales_items.update(
          {
            tracking_code: s.tracking_numbers,
            tracking_url: s.tracking_url,
            tracking_company: s.tracking_company,
          },
          { where: { id: sale.id } },
        );
      } catch (error) {
        console.log('erro ao atualizar sale item');
        console.log(error);
      }
      try {
        console.log('disparando email: ', sale.student.email);
        const template = trackingEmail(
          capitalizeName(sale.student.full_name),
          s.tracking_numbers,
          formatUrl(s.tracking_url),
          sale.product.name,
        );
        await EmailService.sendMail({
          subject: 'Código de rastreio atualizado',
          toAddress: [
            {
              Email: sale.student.email,
              Name: capitalizeName(sale.student.full_name),
            },
          ],
          variables: template,
        });
        console.log('email enviado com sucesso', sale.student.email);
      } catch (error) {
        console.log('erro ao enviar email');
        console.log(error);
      }
    }
  }
  return true;
};

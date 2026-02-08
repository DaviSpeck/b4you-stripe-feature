import { date as dateHelper } from '../utils/date.mjs';
import { capitalizeName, formatDocument, DOCUMENT } from '../utils/formatters.mjs';
import { findSaleItemStatusByKey as findStatus } from '../status/salesItemsStatus.mjs';
import { Excel } from './excel.mjs';
import { Sales_items } from '../database/models/Sales_items.mjs';
import { Op } from 'sequelize';

export const formatWhere = ({
  endDate,
  id_status,
  input,
  paymentMethod,
  productID,
  startDate,
  trackingParameters,
  affiliates,
  offers,
  coupons,
}) => {
  let where = {};
  if (id_status) where.id_status = id_status;
  if (paymentMethod) where.payment_method = paymentMethod;
  if (offers) where.id_offer = offers;
  if (productID) {
    productID = productID.split(',');
    where = {
      ...where,
      id_product: {
        [Op.in]: productID,
      },
    };
  }
  if (affiliates && affiliates[0] === 'all-affiliates') {
    where = {
      ...where,
      id_affiliate: {
        [Op.ne]: null,
      },
    };
  } else if (affiliates && affiliates[0] === 'not-affiliates') {
    where = {
      ...where,
      id_affiliate: {
        [Op.eq]: null,
      },
    };
  } else if (affiliates && affiliates.length > 0) {
    where = {
      ...where,
      '$affiliate.id_user$': {
        [Op.in]: affiliates.map((a) => +a),
      },
    };
  }

  if (coupons) {
    if (Array.isArray(coupons)) {
      where = {
        ...where,
        '$coupon_sale.id_coupon$': {
          [Op.in]: coupons,
        },
      };
    } else if (coupons === 'all') {
      where = {
        ...where,
        '$coupon_sale.id_coupon$': {
          [Op.ne]: null,
        },
      };
    } else {
      where = {
        ...where,
        '$coupon_sale.id_coupon$': {
          [Op.eq]: Number(coupons),
        },
      };
    }
  }

  let dates = {};

  if (startDate && endDate) {
    dates = {
      [Op.or]: {
        paid_at: {
          [Op.between]: [
            dateHelper(startDate).startOf('day').add(3, 'h'),
            dateHelper(endDate).endOf('day').add(3, 'h'),
          ],
        },
        created_at: {
          [Op.between]: [
            dateHelper(startDate).startOf('day').add(3, 'h'),
            dateHelper(endDate).endOf('day').add(3, 'h'),
          ],
        },
      },
    };
  }

  let orObject = {};
  orObject = {
    ...dates,
  };

  if (input) {
    let oror = {
      '$sale.full_name$': { [Op.like]: `%${input}%` },
      '$sale.email$': { [Op.like]: `%${input}%` },
      '$product.name$': { [Op.like]: `%${input}%` },
    };
    if (DOCUMENT.test(input)) {
      const sanitizedInput = input.replace(/\D/g, '');
      if (sanitizedInput.length > 0) {
        oror = {
          ...oror,
          '$sale.document_number$': { [Op.like]: `%${sanitizedInput}%` },
        };
      }
    }

    orObject = {
      ...dates,
      [Op.and]: {
        [Op.or]: oror,
      },
    };
  }

  if (trackingParameters.src) where.src = trackingParameters.src;
  if (trackingParameters.sck) where.sck = trackingParameters.sck;
  if (trackingParameters.utm_source) where.utm_source = trackingParameters.utm_source;
  if (trackingParameters.utm_medium) where.utm_medium = trackingParameters.utm_medium;
  if (trackingParameters.utm_campaign) where.utm_campaign = trackingParameters.utm_campaign;
  if (trackingParameters.utm_content) where.utm_content = trackingParameters.utm_content;
  if (trackingParameters.utm_term) where.utm_term = trackingParameters.utm_term;

  where = {
    ...where,
    ...orObject,
  };
  return where;
};

const findAllSalesToExport = async (query) => {
  const where = formatWhere(query);
  where.tracking_code = null;
  const salesItems = await Sales_items.findAll({
    nest: true,
    distinct: true,
    subQuery: false,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    attributes: ['id', 'uuid', 'created_at', 'payment_method', 'paid_at'],
    include: [
      {
        association: 'product',
        attributes: ['name'],
        paranoid: false,
        where: {
          id_type: 4,
          id_user: query.id_user,
        },
      },
      {
        association: 'student',
        attributes: ['full_name', 'document_number'],
      },
      {
        association: 'offer',
        required: false,
        attributes: ['name', 'price'],
      },
      {
        association: 'affiliate',
        attributes: ['id_user'],
        include: [{ association: 'user', attributes: ['full_name'] }],
      },
      {
        association: 'sale',
        attributes: ['address', 'full_name', 'document_number', 'whatsapp', 'email'],
        include: [
          {
            association: 'coupon_sale',
            attributes: ['id_coupon', 'id_sale', 'percentage'],
            include: [
              {
                association: 'coupon',
                attributes: ['coupon'],
                paranoid: false,
              },
            ],
          },
        ],
      },
    ],
  });

  return salesItems.map((s) => s.toJSON());
};

const getHeaders = () => [
  {
    key: 'ID',
    width: 0,
  },
  {
    key: 'PRODUTO',
    width: 0,
  },
  {
    key: 'CLIENTE',
    width: 0,
  },
  {
    key: 'CPF',
    width: 0,
  },
  {
    key: 'CODIGO',
    width: 0,
  },
  {
    key: 'LINK',
    width: 0,
  },
  {
    key: 'DATA DA COMPRRA',
    width: 20,
  },
];

const dataToExport = (salesItems) => {
  if (salesItems.length === 0) return [];
  return salesItems.map(({ uuid, product, sale, paid_at }) => {
    return [
      uuid,
      capitalizeName(product.name),
      capitalizeName(sale.full_name),
      sale.document_number ? formatDocument(sale.document_number) : ' - ',
      null,
      null,
      dateHelper(paid_at).format('DD/MM/YYYY HH:mm:ss'),
    ];
  });
};

export class ExportXLS {
  constructor(query) {
    this.query = query;
  }

  async execute() {
    const headers = getHeaders();
    const salesItems = await findAllSalesToExport(this.query);
    const data = dataToExport(salesItems);
    const file = await new Excel('B4you', headers, data).execute();
    return file;
  }
}

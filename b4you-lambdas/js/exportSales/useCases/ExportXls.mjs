import { Op } from 'sequelize';
import { findSaleItemStatus as findStatus } from '../status/salesItemsStatus.mjs';
import { findPaymentMethodByKey } from '../types/paymentMethods.mjs';
import { findRoleTypeByKey, rolesTypes } from '../types/rolesTypes.mjs';
import { date as dateHelper } from '../utils/date.mjs';
import { DOCUMENT, capitalizeName, formatDocument } from '../utils/formatters.mjs';
const FRONTEND_DATE = 'DD/MM/YYYY HH:mm:ss';

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
}) => {
  let where = {};
  if (id_status) where.id_status = id_status;
  if (paymentMethod) where.payment_method = paymentMethod;
  if (offers) where.id_offer = offers.split(',');
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
      uuid: { [Op.like]: `%${input}%` },
      '$sale.uuid$': { [Op.like]: `%${input}%` },
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

  if (trackingParameters && trackingParameters.src) where.src = trackingParameters.src;
  if (trackingParameters && trackingParameters.sck) where.sck = trackingParameters.sck;
  if (trackingParameters && trackingParameters.utm_source)
    where.utm_source = trackingParameters.utm_source;
  if (trackingParameters && trackingParameters.utm_medium)
    where.utm_medium = trackingParameters.utm_medium;
  if (trackingParameters && trackingParameters.utm_campaign)
    where.utm_campaign = trackingParameters.utm_campaign;
  if (trackingParameters && trackingParameters.utm_content)
    where.utm_content = trackingParameters.utm_content;
  if (trackingParameters && trackingParameters.utm_term)
    where.utm_term = trackingParameters.utm_term;

  where = {
    ...where,
    ...orObject,
  };
  return where;
};

export const queryRole = (role) => {
  let roles = rolesTypes.map((r) => r.id);

  if (!role.producer) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('producer').id);
  }

  if (!role.coproducer) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('coproducer').id);
  }

  if (!role.affiliate) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('affiliate').id);
  }

  if (!role.supplier) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('supplier').id);
  }

  if (!role.manager) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('manager').id);
  }

  return roles;
};

export const getHeaders = () => [
  {
    header: 'ID',
    key: 'id',
    width: 50,
  },
  {
    header: 'DATA DA COMPRA',
    width: 30,
    key: 'created_at',
  },
  {
    header: 'DATA DE ATUALIZAÇÃO',
    width: 30,
    key: 'updated_at',
  },
  {
    header: 'STATUS',
    width: 30,
    key: 'status',
  },
  {
    header: 'PAGO EM',
    width: 30,
    key: 'paid_at',
  },
  {
    header: 'MÉTODO DE PAGAMENTO',
    width: 30,
    key: 'payment_method',
  },
  {
    header: 'PARCELAS',
    width: 30,
    key: 'installments',
  },
  {
    header: 'PRODUTO',
    width: 30,
    key: 'product',
  },
  {
    header: 'AFILIADO',
    width: 30,
    key: 'affiliate',
  },
  {
    header: 'EMAIL AFILIADO',
    width: 30,
    key: 'affiliate_email',
  },
  {
    header: 'COMISSÃO AFILIADO',
    width: 30,
    key: 'affiliate_commission',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'OFERTA',
    width: 30,
    key: 'offer',
  },
  {
    header: 'PREÇO OFERTA ATUAL',
    width: 30,
    key: 'price_offer',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'PREÇO NO MOMENTO DA VENDA',
    width: 30,
    key: 'price_offer_sale',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'PREÇO PAGO PELO CLIENTE',
    width: 30,
    key: 'price_total',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'FRETE',
    width: 30,
    key: 'shipping_price',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'DESCONTO TOTAL',
    width: 30,
    key: 'discount_amount',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'QUANTIDADE',
    width: 30,
    key: 'quantity',
  },
  {
    header: 'SUA COMISSÃO',
    width: 30,
    key: 'commission',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'COMISSÃO FORNECEDORES',
    width: 30,
    key: 'total_suppliers',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'COMISSÃO COPRODUTORES',
    width: 30,
    key: 'total_coproducers',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'TIPO DA VENDA',
    width: 30,
    key: 'type',
  },
  {
    header: 'GERENTE',
    width: 30,
    key: 'manager',
  },
  {
    header: 'EMAIL GERENTE',
    width: 30,
    key: 'email_manager',
  },
  {
    header: 'COMISSÃO GERENTE',
    width: 30,
    key: 'total_manager',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'TARIFA B4YOU',
    width: 30,
    key: 'fee',
    style: {
      numFmt: 'R$#0.#0',
    },
  },
  {
    header: 'NOME',
    width: 30,
    key: 'name',
  },
  {
    header: 'E-MAIL',
    width: 30,
    key: 'email',
  },
  {
    header: 'DOCUMENTO',
    width: 30,
    key: 'document',
  },
  {
    header: 'WHATSAPP',
    width: 30,
    key: 'whatsapp',
  },
  {
    header: 'RUA',
    width: 30,
    key: 'street',
  },
  {
    header: 'NÚMERO',
    width: 30,
    key: 'number',
  },
  {
    header: 'BAIRRO',
    width: 30,
    key: 'neighborhood',
  },
  {
    header: 'COMPLEMENTO',
    width: 30,
    key: 'complement',
  },
  {
    header: 'CIDADE',
    width: 30,
    key: 'city',
  },
  {
    header: 'ESTADO',
    width: 30,
    key: 'state',
  },
  {
    header: 'CEP',
    width: 30,
    key: 'cep',
  },
  {
    header: 'SRC',
    width: 30,
    key: 'src',
  },
  {
    header: 'SCK',
    width: 30,
    key: 'sck',
  },
  {
    header: 'UTM SOURCE',
    width: 30,
    key: 'utm_source',
  },
  {
    header: 'UTM MEDIUM',
    width: 30,
    key: 'utm_medium',
  },
  {
    header: 'UTM CAMPAIGN',
    width: 30,
    key: 'utm_campaign',
  },
  {
    header: 'UTM TERM',
    width: 30,
    key: 'utm_term',
  },
  {
    header: 'CÓDIGO CUPOM',
    width: 30,
    key: 'coupon',
  },
  {
    header: 'PERCENTUAL CUPOM',
    width: 30,
    key: 'coupon_percentage',
  },
  {
    header: 'RASTREIO CODIGO',
    width: 15,
    key: 'tracking_code',
  },
  {
    header: 'RASTREIO URL',
    width: 15,
    key: 'tracking_url',
  },
  {
    header: 'RASTREIO EMPRESA',
    width: 15,
    key: 'tracking_company',
  },
  {
    header: 'MOTIVO DA RECUSA',
    width: 20,
    key: 'provider_response_details',
  },
];

const saleItemsTypes = [
  {
    id: 1,
    name: 'Produto Principal',
    type: 'main',
  },
  {
    id: 2,
    name: 'Upsell',
    type: 'upsell',
  },
  {
    id: 3,
    name: 'Order Bump',
    type: 'order-bump',
  },
  {
    id: 4,
    name: 'Assinatura',
    type: 'subscription',
  },
];

const formatPhone = (phone) => {
  const formattedPhone = phone.replace(/[^\d]/g, '');
  return formattedPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

export const dataToExport = ({
  uuid,
  created_at,
  updated_at,
  product,
  id_status,
  payment_method,
  paid_at,
  quantity,
  sale: { address, full_name, whatsapp, email, document_number, coupon_sale },
  affiliate,
  offer,
  charges,
  commissions = '-',
  src = '-',
  sck = '-',
  utm_source = '-',
  utm_medium = '-',
  utm_campaign = '-',
  utm_content = '-',
  utm_term = '-',
  fee_fixed = '-',
  fee_variable_amount = '-',
  discount_amount = '-',
  tracking_code = '-',
  tracking_url = '-',
  tracking_company = '-',
  price = '-',
  shipping_price = '-',
  price_total = '-',
  type,
}) => {
  const currentAddress = {
    street: address?.street || ' - ',
    number: address?.number || ' - ',
    neighborhood: address?.neighborhood || ' - ',
    complement: address?.complement || ' - ',
    city: address?.city || ' - ',
    state: address?.state || ' - ',
    zipcode: address?.zipcode || ' - ',
  };

  const affiliateCommission = commissions[0].sale_item.commissions.find((c) => c.id_role === 3);
  const managerCommission = commissions[0].sale_item.commissions.find((c) => c.id_role === 5);

  return {
    id: uuid,
    created_at: dateHelper(created_at).subtract(3, 'h').format(FRONTEND_DATE),
    updated_at: updated_at ? dateHelper(updated_at).subtract(3, 'h').format(FRONTEND_DATE) : '-',
    status: findStatus(id_status).name,
    paid_at: paid_at ? dateHelper(paid_at).subtract(3, 'h').format(FRONTEND_DATE) : ' - ',
    payment_method: findPaymentMethodByKey(payment_method).label,
    installments: charges[0].installments || 'N/A',
    product: capitalizeName(product.name),
    affiliate: affiliate ? capitalizeName(affiliate.user.full_name) : '-',
    affiliate_commission: affiliateCommission ? affiliateCommission.amount : 0,
    affiliate_email: affiliate ? affiliate.user.email : '-',
    offer: offer ? capitalizeName(offer.name) : ' - ',
    price_offer: offer ? offer.price : 0,
    price_offer_sale: price,
    shipping_price,
    price_total,
    quantity,
    commission: commissions[0].amount,
    name: capitalizeName(full_name),
    email,
    document: document_number ? formatDocument(document_number) : ' - ',
    whatsapp: whatsapp ? formatPhone(whatsapp) : ' - ',
    street: capitalizeName(currentAddress.street),
    number: currentAddress.number,
    neighborhood: capitalizeName(currentAddress.neighborhood),
    complement: capitalizeName(currentAddress.complement),
    city: capitalizeName(currentAddress.city),
    state: currentAddress.state,
    cep: currentAddress.zipcode,
    src,
    sck,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    coupon: coupon_sale ? coupon_sale.coupon.coupon : ' - ',
    coupon_percentage: coupon_sale ? coupon_sale.percentage : 0,
    total_suppliers: commissions[0].sale_item.commissions
      .filter((c) => c.id_role === 4)
      .reduce((acc, v) => acc + v.amount, 0),
    fee: fee_fixed + fee_variable_amount,
    discount_amount,
    total_coproducers: commissions[0].sale_item.commissions
      .filter((c) => c.id_role === 2)
      .reduce((acc, v) => acc + v.amount, 0),
    manager: managerCommission ? capitalizeName(managerCommission.user.full_name) : ' - ',
    email_manager: managerCommission ? managerCommission.user.email : ' - ',
    total_manager: managerCommission ? managerCommission.amount : 0,
    tracking_code,
    tracking_url,
    tracking_company,
    provider_response_details: charges[0].provider_response_details,
    type: saleItemsTypes.find((typeObj) => typeObj.id === type).name,
  };
};

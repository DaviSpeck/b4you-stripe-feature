const Blocks = require('../../database/models/Blocks');
const { findBlockTypesByKey } = require('../../types/blockTypes');
const { getRawDocument } = require('../../utils/formatters');
const uuid = require('../../utils/helpers/uuid');

const createBlock = async ({
  personal_data,
  visitorId,
  cookies,
  clientIp,
  req,
  type,
  res,
}) => {
  await Blocks.create({
    id_type: findBlockTypesByKey(type).id,
    email: personal_data?.email,
    full_name: personal_data?.full_name,
    document_number: personal_data?.document_number,
    phone: personal_data?.whatsapp,
    address: personal_data?.address,
    visitorId,
    cookies,
    ip: clientIp,
    body: req.body,
  });
  return res.status(200).send({
    sale_id: uuid.v4(),
    status: { id: 3, name: 'Negado', key: 'denied', color: 'warning' },
    upsell_url: null,
    cartao_status: null,
    cartao_status_details: 'Negado',
  });
};
const isCpfAllowed = (document, blockList) =>
  blockList.includes(getRawDocument(document));

const isZipcodeAllowed = (zipcode, list) =>
  list.includes(getRawDocument(zipcode));

const isIPAllowed = (ip, blockList) => blockList.includes(ip);

const specificAddress01 = ({ zipcode, city, state, number }) =>
  getRawDocument(zipcode) === '68005120' &&
  city === 'Santarém' &&
  state === 'PA' &&
  number === '1284';

module.exports = {
  isCpfAllowed,
  createBlock,
  isZipcodeAllowed,
  specificAddress01,
  isIPAllowed,
};

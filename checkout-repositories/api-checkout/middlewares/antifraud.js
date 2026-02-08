/**
 * ============================================================
 *                   TABELA DE CÓDIGOS DE ERRO
 * ============================================================
 * | Código | Descrição                                  | Origem da Validação           |
 * |--------|--------------------------------------------|-------------------------------|
 * | 0001   | Oferta não encontrada                      | validateOffer                 |
 * | 0002   | Email com domínio suspeito (bloqueado)     | validateEmailBlockedDomain    |
 * | 0003   | Domínio de email não permitido (seguro)    | validateEmailSecureDomain     |
 * | 0004   | Requisição sem User-Agent                  | validateAgent                 |
 * | 0005   | Nome completo inválido (sem sobrenome)     | validateFullName              |
 * | 0006   | CPF bloqueado                              | validateCpfBlocked            |
 * | 0007   | CEP bloqueado                              | validateZipcodeBlocked        |
 * | 0008   | IP bloqueado                               | validateIpBlocked             |
 * | 0009   | Endereço especifico bloqueado              | validateSpecificAddressBlocked|
 * =======================================================================================
 */

/* eslint-disable no-console */
const FindOfferCart = require('../useCases/checkout/offers/FindOfferCart');
const uuid = require('../utils/helpers/uuid');
const { formatWhatsapp } = require('../utils/formatters');
const {
  allowedSubdomains,
  blockedMailSubdomains,
  blockedCpfs,
  blockedZips,
  blockedIPs,
} = require('../types/antifraudList');
const {
  isCpfAllowed,
  isZipcodeAllowed,
  specificAddress01,
  isIPAllowed,
} = require('../useCases/security/utils');

const createLogInfo = (req) => {
  const {
    body: {
      card,
      offer_id,
      order_bumps,
      coupon,
      sessionID,
      visitorId,
      b4f,
      full_name,
      email,
      document_number,
      whatsapp,
      address = {},
      integration_shipping_price,
      integration_shipping_company,
    },
    cookies,
    ip,
    eventSessionId,
  } = req;

  let {
    session: { personal_data = {} },
  } = req;

  if (Object.keys(personal_data).length === 0) {
    personal_data = {
      full_name,
      email,
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      address,
    };
  }

  return {
    email,
    ip,
    method: req.method,
    originalUrl: req.originalUrl,
    headers: {
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      referer: req.get('referer'),
      origin: req.get('origin'),
      acceptLanguage: req.get('accept-language'),
    },
    cookies,
    session: personal_data,
    body: {
      full_name,
      document_number,
      whatsapp,
      address,
      card,
      offer_id,
      order_bumps,
      coupon,
      sessionID,
      visitorId,
      b4f,
      integration_shipping_price,
      integration_shipping_company,
    },
    eventSessionId,
  };
};

const denyRequest = (req, res, log, code, message) => {
  console.log(
    JSON.stringify({
      req_id: req.id,
      code,
      message,
      logInfo: log,
      timestamp: new Date().toISOString(),
    }),
  );

  return res.status(200).send({
    sale_id: uuid.v4(),
    status: {
      id: 3,
      name: `Negado`,
      key: 'denied',
      color: 'warning',
      code,
    },
    upsell_url: null,
    cartao_status: null,
    cartao_status_details: 'Negado',
  });
};

const getEmailDomain = (email) => email.split('@')[1]?.toLowerCase();

const validateOffer = async (req, res, offer_id, log) => {
  const offer = await new FindOfferCart(offer_id).execute();
  if (!offer) {
    denyRequest(req, res, log, '0001', '(BLOQUEIO) Oferta não encontrada');
    return false;
  }
  return offer;
};

const validateEmailBlockedDomain = (req, res, email, log) => {
  const domain = getEmailDomain(email);
  if (blockedMailSubdomains.includes(domain)) {
    denyRequest(req, res, log, '0002', '(BLOQUEIO) Email com domínio suspeito');
    return false;
  }
  return true;
};

const validateEmailSecureDomain = (req, res, email, log) => {
  const domain = getEmailDomain(email);
  if (!allowedSubdomains.includes(domain)) {
    denyRequest(
      req,
      res,
      log,
      '0003',
      '(BLOQUEIO) Domínio de email não permitido',
    );
    return false;
  }
  return true;
};

const validateAgent = (req, res, log) => {
  const userAgent = req.headers['user-agent'];
  if (!userAgent) {
    denyRequest(req, res, log, '0004', '(BLOQUEIO) Sem User-Agent');
    return false;
  }
  return true;
};

const validateFullName = (req, res, log) => {
  if (!req?.body?.full_name?.includes(' ')) {
    denyRequest(req, res, log, '0005', '(BLOQUEIO) Nome inválido');
    return false;
  }
  return true;
};

const validateCpfBlocked = (req, res, log) => {
  const blocked = isCpfAllowed(req.body.document_number, blockedCpfs);
  if (blocked) {
    denyRequest(req, res, log, '0006', '(BLOQUEIO) CPF bloqueado');
    return false;
  }
  return true;
};

const validateZipcodeBlocked = (req, res, log) => {
  if (req?.body?.address?.zipcode) {
    const isZipBlocked = isZipcodeAllowed(
      req?.body?.address?.zipcode,
      blockedZips,
    );
    if (isZipBlocked) {
      denyRequest(req, res, log, '0007', '(BLOQUEIO) CEP bloqueado');
      return false;
    }
  }
  return true;
};

const validateIpBlocked = (req, res, log) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (clientIp) {
    const isIpBlocked = isIPAllowed(clientIp, blockedIPs);
    if (isIpBlocked) {
      denyRequest(req, res, log, '0008', '(BLOQUEIO) IP bloqueado');
      return false;
    }
  }
  return true;
};

const validateSpecificAddressBlocked = (req, res, log) => {
  if (req?.body?.address?.zipcode) {
    const isAddressBlocked = specificAddress01(req.body.address);
    if (isAddressBlocked) {
      denyRequest(
        req,
        res,
        log,
        '0009',
        '(BLOQUEIO) Endereço especifico bloqueado',
      );
      return false;
    }
  }
  return true;
};

const antifraud = async (req, res, next) => {
  const {
    body: { offer_id, email },
  } = req;

  const logInfo = createLogInfo(req);

  if (!validateAgent(req, res, logInfo)) return;
  if (!validateFullName(req, res, logInfo)) return;
  if (!validateEmailBlockedDomain(req, res, email, logInfo)) return;
  if (!validateCpfBlocked(req, res, logInfo)) return;
  if (!validateZipcodeBlocked(req, res, logInfo)) return;
  if (!validateIpBlocked(req, res, logInfo)) return;
  if (!validateSpecificAddressBlocked(req, res, logInfo)) return;

  const offer = await validateOffer(req, res, offer_id, logInfo);
  if (!offer) return;

  if (offer?.offer_product?.secure_email) {
    if (!validateEmailSecureDomain(req, res, email, logInfo)) return;
  }
  next();
};

module.exports = antifraud;

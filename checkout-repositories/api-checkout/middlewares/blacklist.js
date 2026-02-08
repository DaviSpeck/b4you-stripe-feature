/**
 * ============================================================
 *                   TABELA DE CÓDIGOS DE ERRO
 * ============================================================
 * | Código | Descrição                                  | Origem da Validação           |
 * |--------|--------------------------------------------|-------------------------------|
 * | 0051   | Bloqueado via cartão de crédito            | storedHash                    |
 * | 0052   | Email e oferta                             | storedHashEmailOffer          |
 * | 0053   | IP                                         | storedHashIp                  |
 * | 0054   | Id do visitante                            | storedHashVisitorId           |
 * | 0055   | Sessão                                     | storedHashSessionId           |
 * | 0056   | Nome e oferta                              | storedHashNameOffer           |
 * =======================================================================================
 */

/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const redis = require('../config/redis');
const Blocks = require('../database/models/Blocks');
const { findBlockTypesByKey } = require('../types/blockTypes');
const FindOffer = require('../useCases/checkout/offers/FindOffer');
const {
  MAX_ATTEMPTS,
  MAX_ATTEMPTS_EMAIL,
  MAX_ATTEMPTS_IP,
  MAX_ATTEMPTS_VISITOR,
  MAX_ATTEMPTS_SESSION_ID,
  MAX_ATTEMPTS_NAME_OFFER,
  ATTEMPT_WINDOW,
  ATTEMPT_WINDOW_EMAIL,
  ATTEMPT_WINDOW_IP,
  ATTEMPT_WINDOW_VISITOR,
  ATTEMPT_WINDOW_SESSION_ID,
  ATTEMPT_WINDOW_NAME_OFFER,
} = require('./security_params');
const { formatWhatsapp } = require('../utils/formatters');

const blacklist = async (req, res, next) => {
  try {
    if (process.env.ENVIRONMENT !== 'PRODUCTION') {
      return next();
    }

    const {
      body: {
        cards,
        card, // compatibilidade com versão antiga (singular)
        offer_id,
        sessionID,
        visitorId,
        full_name,
        email,
        whatsapp,
        document_number,
        address = {},
      },
      cookies,
    } = req;

    // Suporta tanto cards (array) quanto card (singular) para compatibilidade
    const cardToValidate = cards && Array.isArray(cards) && cards.length > 0 
      ? cards[0] 
      : card;
    
    // Se não houver cartão, pula a validação de cartão
    if (!cardToValidate || !cardToValidate.card_number) {
      // Pula apenas a validação de cartão, continua com outras validações
      // Mas não pode continuar sem cartão se estiver em produção
      // Por segurança, vamos retornar erro se não houver cartão
      return res.status(400).send({ message: 'Cartão não informado' });
    }

    let { session: { personal_data = {} } = {} } = req;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (Object.keys(personal_data).length === 0) {
      personal_data = {
        full_name,
        email,
        whatsapp: formatWhatsapp(whatsapp),
        document_number,
        address,
      };
    }

    const offer = await new FindOffer(offer_id).execute();
    if (offer) {
      if (personal_data.whatsapp) {
        const formattedWhatsapp = formatWhatsapp(personal_data.whatsapp);
        const ddd = formattedWhatsapp.substring(0, 2);

        if (ddd === '27' || ddd === '28') {
          const addressState = personal_data.address?.state?.toUpperCase();

          if (addressState && addressState !== 'ES') {
            console.log(
              'Bloqueio DDD/Estado - DDD:',
              ddd,
              'Estado:',
              addressState,
            );
            const randomCode = Math.floor(Math.random() * 10000)
              .toString()
              .padStart(4, '0');
            await Blocks.create({
              id_type: findBlockTypesByKey('fingerprint').id,
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
              status: {
                id: 3,
                name: 'Negado',
                key: 'denied',
                color: 'warning',
                code: randomCode,
              },
              upsell_url: null,
              cartao_status: null,
              cartao_status_details: 'Negado',
            });
          }
        }
      }
    }

    let isCachedCard = false;
    let isCachedEmail = false;
    let isCachedIp = false;
    let isCachedVisitorId = false;
    let isCachedSessionId = false;
    let isCachedNameOffer = false;

    const cardHashKey = `card:${cardToValidate.card_number}:${offer_id}:${personal_data.email}`;
    const emailOfferHashKey = `offer_email:${offer_id}:${personal_data.email}`;
    const ipHashKey = `ip:${clientIp}`;
    const visitorIdHashKey = `visitor_id:${visitorId}`;
    const sessionIdHashKey = `session_id:${sessionID}`;
    const nameOfferHashKey = `offer_name:${offer_id}:${personal_data.full_name}`;

    const storedHash = await redis.get(cardHashKey);
    const storedHashEmailOffer = await redis.get(emailOfferHashKey);
    const storedHashIp = await redis.get(ipHashKey);
    const storedHashVisitorId = await redis.get(visitorIdHashKey);
    const storedHashSessionId = await redis.get(sessionIdHashKey);
    const storedHashNameOffer = await redis.get(nameOfferHashKey);

    // CARD VALIDATION
    if (storedHash) {
      const match = await bcrypt.compare(cardToValidate.card_number, storedHash);
      if (!match) return res.status(400).send({ message: 'Cartão inválido' });

      const attempts = await redis.get(`${cardHashKey}:attempts`);
      const ttlInSeconds = await redis.ttl(`${cardHashKey}:attempts`);

      if (ttlInSeconds > 0 && attempts && attempts > MAX_ATTEMPTS) {
        await Blocks.create({
          id_type: findBlockTypesByKey('card').id,
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
          status: {
            id: 3,
            name: 'Negado',
            key: 'denied',
            color: 'warning',
            code: '0051',
          },
          upsell_url: null,
          cartao_status: null,
          cartao_status_details: 'Negado',
        });
      }

      await redis.set(
        `${cardHashKey}:attempts`,
        parseInt(attempts || 0, 10) + 1,
        'EX',
        ATTEMPT_WINDOW,
      );
      isCachedCard = true;
    }

    // EMAIL VALIDATION
    if (storedHashEmailOffer) {
      const match = await bcrypt.compare(
        `offer_email:${offer_id}:${personal_data.email}`,
        storedHashEmailOffer,
      );
      if (!match) return res.status(400).send({ message: 'Email inválido' });

      const attempts = await redis.get(`${emailOfferHashKey}:attempts`);
      const ttlInSeconds = await redis.ttl(`${emailOfferHashKey}:attempts`);

      if (ttlInSeconds > 0 && attempts && attempts > MAX_ATTEMPTS_EMAIL) {
        await Blocks.create({
          id_type: findBlockTypesByKey('offer-email').id,
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
          status: {
            id: 3,
            name: 'Negado',
            key: 'denied',
            color: 'warning',
            code: '0052',
          },
          upsell_url: null,
          cartao_status: null,
          cartao_status_details: 'Negado',
        });
      }

      await redis.set(
        `${emailOfferHashKey}:attempts`,
        parseInt(attempts || 0, 10) + 1,
        'EX',
        ATTEMPT_WINDOW_EMAIL,
      );
      isCachedEmail = true;
    }

    // IP VALIDATION
    if (storedHashIp) {
      const match = await bcrypt.compare(`ip:${clientIp}`, storedHashIp);
      if (!match) return res.status(400).send({ message: 'Ip inválido' });

      const attempts = await redis.get(`${ipHashKey}:attempts`);
      const ttlInSeconds = await redis.ttl(`${ipHashKey}:attempts`);

      if (ttlInSeconds > 0 && attempts && attempts > MAX_ATTEMPTS_IP) {
        await Blocks.create({
          id_type: findBlockTypesByKey('ip').id,
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
          status: {
            id: 3,
            name: 'Negado',
            key: 'denied',
            color: 'warning',
            code: '0053',
          },
          upsell_url: null,
          cartao_status: null,
          cartao_status_details: 'Negado',
        });
      }

      await redis.set(
        `${ipHashKey}:attempts`,
        parseInt(attempts || 0, 10) + 1,
        'EX',
        ATTEMPT_WINDOW_IP,
      );
      isCachedIp = true;
    }

    // VISITOR ID VALIDATION
    if (visitorId && storedHashVisitorId) {
      const match = await bcrypt.compare(
        `visitor_id:${visitorId}`,
        storedHashVisitorId,
      );
      if (!match) return res.status(400).send({ message: 'VI inválido' });

      const attempts = await redis.get(`${visitorIdHashKey}:attempts`);
      const ttlInSeconds = await redis.ttl(`${visitorIdHashKey}:attempts`);

      if (ttlInSeconds > 0 && attempts && attempts > MAX_ATTEMPTS_VISITOR) {
        await Blocks.create({
          id_type: findBlockTypesByKey('fingerprint').id,
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
          status: {
            id: 3,
            name: 'Negado',
            key: 'denied',
            color: 'warning',
            code: '0054',
          },
          upsell_url: null,
          cartao_status: null,
          cartao_status_details: 'Negado',
        });
      }

      await redis.set(
        `${visitorIdHashKey}:attempts`,
        parseInt(attempts || 0, 10) + 1,
        'EX',
        ATTEMPT_WINDOW_VISITOR,
      );
      isCachedVisitorId = true;
    }

    // SESSION VALIDATION
    if (sessionID && storedHashSessionId) {
      const match = await bcrypt.compare(
        `session_id:${sessionID}`,
        storedHashSessionId,
      );
      if (!match) return res.status(400).send({ message: 'Session inválida' });

      const attempts = await redis.get(`${sessionIdHashKey}:attempts`);
      const ttlInSeconds = await redis.ttl(`${sessionIdHashKey}:attempts`);

      if (ttlInSeconds > 0 && attempts && attempts > MAX_ATTEMPTS_SESSION_ID) {
        await Blocks.create({
          id_type: findBlockTypesByKey('session').id,
          email: personal_data?.email,
          full_name: personal_data?.full_name,
          document_number: personal_data?.document_number,
          phone: personal_data?.whatsapp,
          address: personal_data?.address,
          visitorId: sessionID,
          cookies,
          ip: clientIp,
          body: req.body,
        });
        return res.status(200).send({
          sale_id: uuid.v4(),
          status: {
            id: 3,
            name: 'Negado',
            key: 'denied',
            color: 'warning',
            code: '0055',
          },
          upsell_url: null,
          cartao_status: null,
          cartao_status_details: 'Negado',
        });
      }

      await redis.set(
        `${sessionIdHashKey}:attempts`,
        parseInt(attempts || 0, 10) + 1,
        'EX',
        ATTEMPT_WINDOW_SESSION_ID,
      );
      isCachedSessionId = true;
    }

    // NAME+OFFER VALIDATION
    if (storedHashNameOffer) {
      const match = await bcrypt.compare(
        `offer_name:${offer_id}:${personal_data.full_name}`,
        storedHashNameOffer,
      );
      if (!match)
        return res.status(400).send({ message: 'Oferta/nome inválido' });

      const attempts = await redis.get(`${nameOfferHashKey}:attempts`);
      const ttlInSeconds = await redis.ttl(`${nameOfferHashKey}:attempts`);

      if (ttlInSeconds > 0 && attempts && attempts > MAX_ATTEMPTS_NAME_OFFER) {
        await Blocks.create({
          id_type: findBlockTypesByKey('offer-customer-name').id,
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
          status: {
            id: 3,
            name: 'Negado',
            key: 'denied',
            color: 'warning',
            code: '0056',
          },
          upsell_url: null,
          cartao_status: null,
          cartao_status_details: 'Negado',
        });
      }

      await redis.set(
        `${nameOfferHashKey}:attempts`,
        parseInt(attempts || 0, 10) + 1,
        'EX',
        ATTEMPT_WINDOW_NAME_OFFER,
      );
      isCachedNameOffer = true;
    }

    // Store new hashes
    const hash = await bcrypt.hash(cardToValidate.card_number, 10);
    const hashEmail = await bcrypt.hash(
      `offer_email:${offer_id}:${personal_data.email}`,
      10,
    );
    const hashIp = await bcrypt.hash(`ip:${clientIp}`, 10);
    const hashVisitor = await bcrypt.hash(`visitor_id:${visitorId}`, 10);
    const hashSession = await bcrypt.hash(`session_id:${sessionID}`, 10);
    const hashNameOffer = await bcrypt.hash(
      `offer_name:${offer_id}:${personal_data.full_name}`,
      10,
    );

    await redis.set(cardHashKey, hash);
    await redis.set(emailOfferHashKey, hashEmail);
    await redis.set(ipHashKey, hashIp);
    await redis.set(visitorIdHashKey, hashVisitor);
    await redis.set(sessionIdHashKey, hashSession);
    await redis.set(nameOfferHashKey, hashNameOffer);

    if (!isCachedCard)
      await redis.set(`${cardHashKey}:attempts`, 1, 'EX', ATTEMPT_WINDOW);
    if (!isCachedEmail)
      await redis.set(
        `${emailOfferHashKey}:attempts`,
        1,
        'EX',
        ATTEMPT_WINDOW_EMAIL,
      );
    if (!isCachedIp)
      await redis.set(`${ipHashKey}:attempts`, 1, 'EX', ATTEMPT_WINDOW_IP);
    if (!isCachedVisitorId)
      await redis.set(
        `${visitorIdHashKey}:attempts`,
        1,
        'EX',
        ATTEMPT_WINDOW_VISITOR,
      );
    if (!isCachedSessionId)
      await redis.set(
        `${sessionIdHashKey}:attempts`,
        1,
        'EX',
        ATTEMPT_WINDOW_SESSION_ID,
      );
    if (!isCachedNameOffer)
      await redis.set(
        `${nameOfferHashKey}:attempts`,
        1,
        'EX',
        ATTEMPT_WINDOW_NAME_OFFER,
      );

    return next();
  } catch (err) {
    console.log('error blacklist middleware', err);
    return next(err);
  }
};

module.exports = blacklist;

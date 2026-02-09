const ApiError = require('../../error/ApiError');
const logger = require('../../utils/logger');
const Webhooks_iopay = require('../../database/models/Webhooks_iopay');
// const PaidPixUseCase = require('../../useCases/callbacks/paidPayment');
const Users = require('../../database/models/Users');
const Transactions = require('../../database/models/Transactions');
const SQS = require('../../queues/aws');
const { del: delRedis } = require('../../config/redis');
const HttpClient = require('../../services/HTTPClient');

const KYC = 1;

const sendApprovedUserData = async (user, isIndividual) => {
  try {
    const endpoint = process.env.USERS_LEAD_URL;

    if (!endpoint) {
      logger.warn('PAGARME_APPROVED_USER_ENDPOINT não configurado');
      return;
    }

    const fullName =
      user.full_name ||
      `${user.first_name || ''} ${user.last_name || ''}`.trim();

    const documentNumber = isIndividual
      ? user.document_number
      : user.cnpj || user.document_number;
    const documentType = isIndividual ? 'cpf' : 'cnpj';

    const address = {
      zipcode: user.zipcode || '',
      street: user.street || '',
      number: user.number || '',
      complement: user.complement || '',
      neighborhood: user.neighborhood || '',
      city: user.city || '',
      state: user.state || '',
      country: user.country || '',
    };

    const payload = {
      id: user.id,
      email: user.email,
      nome: fullName,
      document_number: documentNumber,
      document_type: documentType,
      cpf: documentNumber,
      whatsapp: user.whatsapp,
      address,
      kycVerificado: true,
    };

    logger.info(
      `Enviando dados do usuário aprovado para endpoint captação de leads: ${JSON.stringify(
        payload,
      )}`,
    );

    const httpInstance = new HttpClient({
      baseURL: endpoint,
    });

    await httpInstance.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.USERS_LEAD_TOKEN}`,
      },
    });

    logger.info(`Dados do usuário ${user.id} enviados com sucesso`);
  } catch (error) {
    logger.error(
      `Erro ao enviar dados do usuário aprovado: ${error.message}`,
      error,
    );
  }
};

const pagarmeCallbackController = async (req, res, next) => {
  logger.info(`CALLBACK PAGARME -> ${JSON.stringify(req.body)}`);
  try {
    const { body } = req;
    if (!body || !body.type || !body.data) {
      return res.sendStatus(400);
    }

    if (body.type.includes('transfer')) {
      // eslint-disable-next-line
      console.log('callback transfer pagarme -> ', req.body);
      if (body.type === 'transfer.paid') {
        const {
          data: { id },
        } = body;
        const transaction = await Transactions.findOne({
          raw: true,
          attributes: ['id'],
          where: { id_type: 1, uuid: id },
        });
        if (!transaction) {
          // eslint-disable-next-line
          console.log('transfer not found -> ', id);
          return res.sendStatus(200);
        }
        await Transactions.update(
          { id_status: 2 },
          {
            where: {
              id: transaction.id,
            },
          },
        );
      }
      if (body.type === 'transfer.failed') {
        const {
          data: { id },
        } = body;
        const transaction = await Transactions.findOne({
          raw: true,
          attributes: ['id'],
          where: { id_type: 1, uuid: id },
        });
        if (!transaction) {
          // eslint-disable-next-line
          console.log('transfer not found -> ', id);
          return res.sendStatus(200);
        }
        await Transactions.update(
          { id_status: 4 },
          {
            where: {
              id: transaction.id,
            },
          },
        );
      }
      return res.sendStatus(200);
    }

    if (
      body.type === 'charge.paid' &&
      (body.data.payment_method === 'pix' ||
        body.data.payment_method === 'boleto') &&
      body.data.status === 'paid'
    ) {
      // await PaidPixUseCase.execute({
      //   psp_id: null,
      //   charge_uuid: body.data.code,
      // });
      await SQS.add('paidPayment', {
        uuid: body.data.code,
      });
    }

    if (
      body.type === 'charge.paid' &&
      body.data.status === 'paid' &&
      Object.keys(body?.data?.last_transaction?.card || {}).length > 0
    ) {
      await SQS.add('pagarmePaidCharge', {
        provider_id: body.data.id,
      });

      return res.sendStatus(200);
    }

    if (body.type === 'charge.chargedback') {
      await SQS.add('callbacksCard', {
        id: body.data.id,
        status: 6,
        provider: 'PAGARME',
        event_id: body.id || body.data?.id,
        occurred_at: body.created_at || body.data?.created_at,
      });
      return res.sendStatus(200);
    }

    if (body.type === 'recipient.updated') {
      await Webhooks_iopay.create({
        payload: req.body,
        type: KYC,
        recipient_id: body.data.id,
        kyc_status: body.data.status,
      });
      const { status, type, id } = body.data;
      const { account } = body;
      if (account && account.id === 'acc_OKkRG0RFVLH28EZj') {
        if (['refused', 'active'].includes(status)) {
          const isIndividual = type === 'individual';
          const user = await Users.findOne({
            raw: true,
            where: isIndividual
              ? { pagarme_recipient_id: id }
              : { pagarme_recipient_id_cnpj: id },
          });

          if (!user) return res.sendStatus(200);

          const updateValue = status === 'refused' ? 4 : 3;

          if (!isIndividual) {
            await Users.update(
              {
                verified_company_pagarme: updateValue,
                is_company: status === 'active',
                status_cnpj: status === 'active' ? 3 : 4,
                verified_company: status === 'active' ? 1 : 0,
                verified_id: status === 'active' ? 1 : 0,
              },
              { where: { id: user.id } },
            );
          } else {
            await Users.update(
              {
                verified_pagarme: updateValue,
                verified_id: status === 'active' ? 1 : 0,
              },
              { where: { id: user.id } },
            );
          }
          if (status === 'active') {
            const userComplete = await Users.findOne({
              raw: true,
              attributes: [
                'id',
                'email',
                'full_name',
                'first_name',
                'last_name',
                'document_number',
                'cnpj',
                'whatsapp',
                'zipcode',
                'street',
                'number',
                'complement',
                'neighborhood',
                'city',
                'state',
                'country',
              ],
              where: { id: user.id },
            });

            if (userComplete) {
              try {
                await sendApprovedUserData(userComplete, isIndividual);
              } catch (error) {
                console.log('error on sending ');
              }
            }
          }

          const key = `user_${process.env.ENVIRONMENT}_${user.id}`;
          await delRedis(key);
          return res.sendStatus(200);
        }
      } else if (account && account.id === 'acc_YjnXPQsAWczyOr7w') {
        if (['refused', 'active'].includes(status)) {
          const isIndividual = type === 'individual';
          const user = await Users.findOne({
            raw: true,
            where: isIndividual
              ? { pagarme_recipient_id_3: id }
              : { pagarme_recipient_id_cnpj_3: id },
          });

          if (!user) return res.sendStatus(200);

          const updateValue = status === 'refused' ? 4 : 3;

          if (!isIndividual) {
            await Users.update(
              {
                verified_company_pagarme_3: updateValue,
                is_company: status === 'active',
                status_cnpj: status === 'active' ? 3 : 4,
                verified_company_3: status === 'active' ? 1 : 0,
                verified_id: status === 'active' ? 1 : 0,
              },
              { where: { id: user.id } },
            );
          } else {
            await Users.update(
              {
                verified_pagarme_3: updateValue,
                verified_id: status === 'active' ? 1 : 0,
              },
              { where: { id: user.id } },
            );
          }

          // Se o status for active, envia dados para endpoint externo
          if (status === 'active') {
            const userComplete = await Users.findOne({
              raw: true,
              attributes: [
                'id',
                'email',
                'full_name',
                'first_name',
                'last_name',
                'document_number',
                'cnpj',
                'whatsapp',
                'zipcode',
                'street',
                'number',
                'complement',
                'neighborhood',
                'city',
                'state',
                'country',
              ],
              where: { id: user.id },
            });

            if (userComplete) {
              await sendApprovedUserData(userComplete, isIndividual);
            }
          }

          const key = `user_${process.env.ENVIRONMENT}_${user.id}`;
          await delRedis(key);
          return res.sendStatus(200);
        }
      }
    }
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

module.exports = {
  pagarmeCallbackController,
};

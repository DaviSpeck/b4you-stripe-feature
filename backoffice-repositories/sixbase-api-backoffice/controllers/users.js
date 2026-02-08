const { Op, Sequelize } = require('sequelize');
const exceljs = require('exceljs');
const jwt = require('jsonwebtoken');
const {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
} = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const ExcelJS = require('exceljs');
const moment = require('moment');
const ApiError = require('../error/ApiError');
const FindUserFilteredUseCase = require('../useCases/users/FindUserFiltered');
const userBankAccounts = require('../useCases/users/userBankAccounts');
const SerializeUsers = require('../presentation/users/filtered');
const FindUserInfo = require('../useCases/users/FindUserInfo');
const FindAverageSales = require('../useCases/users/FindAverageSales');
const UsersRepository = require('../repositories/sequelize/UsersRepository');
const Users = require('../database/models/Users');
const BackofficeNotes = require('../database/models/Backoffice_notes');
const {
  findNoteType,
  findNoteTypeById,
  findFollowupStatus,
  findFollowupStatusById,
} = require('../types/noteTypes');
const { capitalizeName, rawDocument } = require('../utils/formatters');
const { FRONTEND_DATE } = require('../types/dateTypes');
const date = require('../utils/helpers/date');
const SalesSettings = require('../database/models/Sales_settings');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const {
  findRoleTypeByKey,
  findUserEventTypeByKey,
} = require('../types/userEvents');
const Withdrawals_settings = require('../database/models/Withdrawals_settings');
const Withdrawal_notes = require('../database/models/Withdrawal_notes');
const Users_backoffice = require('../database/models/Users_backoffice');
const SalesMetricsDaily = require('../database/models/SalesMetricsDaily');
const UserBankAccounts = require('../database/models/Users_bank_accounts');
const models = require('../database/models');
const { findCommissionsStatus } = require('../status/commissionsStatus');
const { findKycStatus } = require('../status/pagarmeKycStatus');
const { formatWhere } = require('../utils/common');
const Pagarme = require('../services/payments/Pagarme');
const { usersColumns } = require('../mocks/excelColumns.mock');
const DateHelper = require('../utils/helpers/date');
const uuidHelper = require('../utils/helpers/uuid');
const redis = require('../config/redis');

const NOTE_SHORT_LIMIT = 200;
const NOTE_LONG_LIMIT = 800;

module.exports.changeDocument = async (req, res, next) => {
  const {
    params: { userUuid },
    body: { document_number = null },
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    if (!document_number) {
      throw ApiError.badRequest('Necessário informar o documento');
    }
    const raw = rawDocument(document_number);
    if (raw.length === 0) {
      throw ApiError.badRequest('Necessário informar um documento com dígitos');
    }
    const documentAlreadyInUse = await Users.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        document_number: raw,
      },
    });
    if (documentAlreadyInUse) {
      throw ApiError.badRequest('Documento em uso');
    }
    const user = await UsersRepository.findByUUID(userUuid);
    await Users.update({ document_number: raw }, { where: { id: user.id } });
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('update-data').id,
      params: {
        user_agent,
        old_values: {
          document_number: user.document_number,
        },
      },
      ip_address,
      id_user: user.id,
    });
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

module.exports.generateAccess = async (req, res) => {
  const { userUuid } = req.params;
  const token = jwt.sign(
    { user: userUuid },
    process.env.TOKEN_ACCESS_BACKOFFICE,
    { expiresIn: 86000 },
  );
  return res.send({ token });
};

module.exports.toggleActive = async (req, res, next) => {
  const {
    params: { userUuid },
    body: { active = false },
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    const user = await UsersRepository.findByUUID(userUuid);
    await Users.update({ active }, { where: { id: user.id } });
    await createLogBackoffice({
      id_user_backoffice,
      id_event: active
        ? findUserEventTypeByKey('producer-active-true').id
        : findUserEventTypeByKey('producer-active-false').id,
      params: {
        user_agent,
      },
      ip_address,
      id_user: user.id,
    });
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

module.exports.removeCNPJ = async (req, res, next) => {
  const {
    params: { userUuid },
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    const user = await UsersRepository.findByUUID(userUuid);
    await Users.update(
      {
        cnpj: null,
        is_company: false,
        verified_company: false,
        status_cnpj: 1,
      },
      { where: { id: user.id } },
    );
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('remove-cnpj').id,
      params: {
        user_agent,
      },
      ip_address,
      id_user: user.id,
    });
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

module.exports.updateManager = async (req, res, next) => {
  const {
    params: { userUuid },
    body: { manager_id },
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    if (manager_id === undefined) {
      throw ApiError.badRequest('Necessário informar o manager_id');
    }

    const finalManagerValue = manager_id === '' ? null : manager_id;

    const user = await UsersRepository.findByUUID(userUuid);
    await Users.update(
      { id_manager: finalManagerValue },
      { where: { id: user.id } },
    );
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('update-manager').id,
      params: {
        user_agent,
        old_values: {
          id_manager: user.id_manager,
        },
        new_values: {
          id_manager: finalManagerValue,
        },
      },
      ip_address,
      id_user: user.id,
    });
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

module.exports.changeEmail = async (req, res, next) => {
  const {
    params: { userUuid },
    body: { email = null },
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    if (!email) {
      throw ApiError.badRequest('Necessário informar o e-mail');
    }
    const emailAlreadyInUse = await Users.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        email,
      },
    });
    if (emailAlreadyInUse) {
      throw ApiError.badRequest('E-mail em uso');
    }
    const user = await UsersRepository.findByUUID(userUuid);
    await Users.update({ email }, { where: { id: user.id } });
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('update-data').id,
      params: {
        user_agent,
        old_values: {
          email: user.email,
        },
      },
      ip_address,
      id_user: user.id,
    });

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

module.exports.getNotes = async (req, res, next) => {
  const {
    params: { userUuid },
    query: { type = null, page = 0, size = 5 },
  } = req;
  try {
    const user = await Users.findOne({
      raw: true,
      where: { uuid: userUuid },
      attributes: ['id'],
    });
    const whereClause = { id_user: user.id };

    const typeInfo = findNoteType(type);
    if (typeInfo) {
      if (typeInfo.key === 'administrative') {
        whereClause[Op.or] = [{ type: typeInfo.id }, { type: null }];
      } else {
        whereClause.type = typeInfo.id;
      }
    }

    const limit = Number(size) || 5;
    const offset = (Number(page) || 0) * limit;

    const total = await BackofficeNotes.count({
      where: whereClause,
      distinct: true,
      col: 'uuid',
    });

    const latestPerUuid = await BackofficeNotes.findAll({
      raw: true,
      where: whereClause,
      attributes: [
        'uuid',
        [Sequelize.fn('MAX', Sequelize.col('version')), 'max_version'],
        [Sequelize.fn('MAX', Sequelize.col('created_at')), 'latest_created_at'],
      ],
      group: ['uuid'],
      order: [[Sequelize.literal('latest_created_at'), 'DESC']],
      limit,
      offset,
    });

    const versionPairs = latestPerUuid.map((item) => ({
      uuid: item.uuid,
      version: item.max_version,
    }));

    const rows = versionPairs.length
      ? await BackofficeNotes.findAll({
        raw: true,
        nest: true,
        where: {
          ...whereClause,
          [Op.or]: versionPairs,
        },
        attributes: [
          'id',
          'uuid',
          'version',
          'note',
          'type',
          'summary',
          'next_action',
          'pending_points',
          'additional_notes',
          'followup_status',
          'next_contact_at',
          'created_at',
        ],
        order: [['created_at', 'desc']],
        include: [
          {
            association: 'user_backoffice',
            attributes: ['full_name'],
          },
        ],
      })
      : [];
    const mapped = rows.map((note) => {
      const mappedType = findNoteTypeById(note.type) || findNoteType(note.type);
      const mappedFollowup =
        note.followup_status !== null && note.followup_status !== undefined
          ? findFollowupStatusById(note.followup_status) ||
          findFollowupStatus(note.followup_status)
          : null;
      return {
        ...note,
        uuid: note.uuid,
        version: note.version,
        type: mappedType ? mappedType.key : note.type,
        followup_status: mappedFollowup
          ? mappedFollowup.key
          : note.followup_status,
        created_at: date(note.created_at)
          .utcOffset(-3, true)
          .format('DD/MM/YYYY HH:mm:ss'),
        next_contact_at: note.next_contact_at
          ? date(note.next_contact_at)
            .utcOffset(-3, true)
            .format('DD/MM/YYYY HH:mm:ss')
          : null,
      };
    });

    return res.json({
      page: Number(page) || 0,
      size: limit,
      total,
      rows: mapped,
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

module.exports.createNote = async (req, res, next) => {
  const {
    params: { userUuid },
    body: {
      note,
      note_uuid = null,
      type = null,
      summary = null,
      next_action = null,
      pending_points = null,
      additional_notes = null,
      followup_status = null,
      next_contact_at = null,
    },
    user: { id: id_user_backoffice },
  } = req;
  try {
    const typeInfo = findNoteType(type);
    if (!typeInfo) {
      return next(ApiError.badRequest('Tipo de nota inválido'));
    }

    const followupInfo = followup_status
      ? findFollowupStatus(followup_status)
      : null;
    if (followup_status && !followupInfo) {
      return next(ApiError.badRequest('Status de follow-up inválido'));
    }

    const trimmedSummary = summary ? summary.trim() : '';
    const trimmedNextAction = next_action ? next_action.trim() : '';

    if (typeInfo.key === 'commercial') {
      if (!trimmedSummary) {
        return next(ApiError.badRequest('Resumo do contato e obrigatório'));
      }
      if (!trimmedNextAction) {
        return next(ApiError.badRequest('Próxima ação e obrigatória'));
      }
    }

    if (summary && summary.length > NOTE_LONG_LIMIT) {
      return next(
        ApiError.badRequest('Resumo do contato deve ter no máximo ' + NOTE_LONG_LIMIT + ' caracteres.'),
      );
    }
    if (next_action && next_action.length > NOTE_SHORT_LIMIT) {
      return next(
        ApiError.badRequest(
          `Próxima ação (follow-up) deve ter no máximo ${NOTE_SHORT_LIMIT} caracteres.`,
        ),
      );
    }
    if (pending_points && pending_points.length > NOTE_LONG_LIMIT) {
      return next(
        ApiError.badRequest(
          `Pontos pendentes deve ter no máximo ${NOTE_LONG_LIMIT} caracteres.`,
        ),
      );
    }
    if (additional_notes && additional_notes.length > NOTE_LONG_LIMIT) {
      return next(
        ApiError.badRequest(
          `Observações adicionais deve ter no máximo ${NOTE_LONG_LIMIT} caracteres.`,
        ),
      );
    }
    if (note && note.length > NOTE_LONG_LIMIT) {
      return next(
        ApiError.badRequest(
          `Observação livre deve ter no máximo ${NOTE_LONG_LIMIT} caracteres.`,
        ),
      );
    }

    if (next_contact_at) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextDate = new Date(next_contact_at);
      if (Number.isNaN(nextDate.getTime())) {
        return next(ApiError.badRequest('Data do próximo contato inválida'));
      }
      if (nextDate < today) {
        return next(
          ApiError.badRequest(
            'Data do próximo contato não pode ser no passado.',
          ),
        );
      }
    }

    const user = await Users.findOne({
      raw: true,
      where: { uuid: userUuid },
      attributes: ['id'],
    });

    const noteUuid =
      note_uuid && uuidHelper.validate(note_uuid) ? note_uuid : uuidHelper.v4();

    const lastVersion = await BackofficeNotes.findOne({
      raw: true,
      where: { uuid: noteUuid, id_user: user.id },
      attributes: ['version'],
      order: [['version', 'desc']],
    });
    const nextVersion = lastVersion ? Number(lastVersion.version || 0) + 1 : 1;

    const newNote = await BackofficeNotes.create({
      id_user: user.id,
      note,
      uuid: noteUuid,
      version: nextVersion,
      type: typeInfo.id,
      summary,
      next_action,
      pending_points,
      additional_notes,
      followup_status: followupInfo ? followupInfo.id : null,
      next_contact_at,
      id_user_backoffice,
    });
    return res.send(newNote);
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

module.exports.deleteNote = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    await BackofficeNotes.destroy({ where: { id } });
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

module.exports.getNoteHistory = async (req, res, next) => {
  const {
    params: { userUuid, noteUuid },
  } = req;
  try {
    const user = await Users.findOne({
      raw: true,
      where: { uuid: userUuid },
      attributes: ['id'],
    });

    if (!user) {
      return next(ApiError.badRequest('Usu rio nÆo encontrado'));
    }

    const rows = await BackofficeNotes.findAll({
      raw: true,
      nest: true,
      where: { id_user: user.id, uuid: noteUuid },
      attributes: [
        'id',
        'uuid',
        'version',
        'note',
        'type',
        'summary',
        'next_action',
        'pending_points',
        'additional_notes',
        'followup_status',
        'next_contact_at',
        'created_at',
      ],
      include: [
        {
          association: 'user_backoffice',
          attributes: ['full_name'],
        },
      ],
      order: [['version', 'desc']],
    });

    const mapped = rows.map((note) => {
      const mappedType = findNoteTypeById(note.type) || findNoteType(note.type);
      const mappedFollowup =
        note.followup_status !== null && note.followup_status !== undefined
          ? findFollowupStatusById(note.followup_status) ||
          findFollowupStatus(note.followup_status)
          : null;
      return {
        ...note,
        type: mappedType ? mappedType.key : note.type,
        followup_status: mappedFollowup ? mappedFollowup.key : note.followup_status,
        created_at: note.created_at
          ? date(note.created_at).utcOffset(-3, true).format('DD/MM/YYYY HH:mm:ss')
          : null,
        next_contact_at: note.next_contact_at
          ? date(note.next_contact_at).utcOffset(-3, true).format('DD/MM/YYYY HH:mm:ss')
          : null,
      };
    });

    return res.json({ rows: mapped });
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

module.exports.findUsers = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      blocked_withdrawal = null,
      follow_up = null,
      negative_balance = null,
    },
  } = req;
  try {
    const filteredCompany = [];
    const filteredIndividual = [];
    const { rows, count } = await FindUserFilteredUseCase.executeWithSQL({
      input,
      page,
      size,
      blocked_withdrawal,
      follow_up,
      negative_balance,
    });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows: new SerializeUsers(rows).adapt(),
      },
      filteredCompany,
      filteredIndividual,
      status: 200,
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

module.exports.findPagarme = async (req, res, next) => {
  try {
    const usersCompanyCount = await Users.findAll({
      raw: true,
      where: {
        cnpj: {
          [Op.not]: null,
        },
      },
      attributes: [
        'verified_company_pagarme',
        [
          Sequelize.fn('COUNT', Sequelize.col('verified_company_pagarme')),
          'count',
        ],
      ],
      group: ['verified_company_pagarme'],
      order: [
        [
          Sequelize.fn('COUNT', Sequelize.col('verified_company_pagarme')),
          'DESC',
        ],
      ],
    });
    const filteredCompany = usersCompanyCount.map((e) => ({
      count: e.count,
      status: findKycStatus(e.verified_company_pagarme),
    }));
    const usersCount = await Users.findAll({
      raw: true,
      where: {
        is_company: false,
      },
      attributes: [
        'verified_pagarme',
        [Sequelize.fn('COUNT', Sequelize.col('verified_pagarme')), 'count'],
      ],
      group: ['verified_pagarme'],
      order: [
        [Sequelize.fn('COUNT', Sequelize.col('verified_pagarme')), 'DESC'],
      ],
    });
    const filteredIndividual = usersCount.map((e) => ({
      count: e.count,
      status: findKycStatus(e.verified_pagarme),
    }));

    const sortedDataIndividual = filteredIndividual.sort((a, b) => {
      if (a.status.label < b.status.label) return -1;
      if (a.status.label > b.status.label) return 1;
      return 0;
    });

    const sortedDataCompany = filteredCompany.sort((a, b) => {
      if (a.status.label < b.status.label) return -1;
      if (a.status.label > b.status.label) return 1;
      return 0;
    });

    return res.send({
      filteredCompany: sortedDataCompany,
      filteredIndividual: sortedDataIndividual,
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

module.exports.findPagarmeProducers = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null, type = false, status = null },
  } = req;
  try {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const where = formatWhere(input);
    if (!input) {
      where.is_company = type !== 'cpf';
      if (status !== 'all') {
        if (type !== 'cpf') {
          where.verified_company_pagarme = status;
        } else {
          where.verified_pagarme = status;
        }
      }
    }
    const users = await Users.findAndCountAll({
      raw: true,
      offset,
      limit,
      where,
      order: [['id', 'desc']],
      attributes: [
        'id',
        'uuid',
        'email',
        'full_name',
        'pagarme_recipient_id',
        'pagarme_recipient_id_cnpj',
        'verified_company_pagarme',
        'verified_pagarme',
        'document_number',
        'cnpj',
        'is_company',
      ],
    });
    const data = users.rows.map((e) => ({
      id: e.id,
      uuid: e.uuid,
      email: e.email,
      full_name: e.full_name,
      is_company: e.is_company,
      status: e.is_company
        ? findKycStatus(e.verified_company_pagarme)
        : findKycStatus(e.verified_pagarme),
      pagarme_id: e.is_company
        ? e.pagarme_recipient_id_cnpj
        : e.pagarme_recipient_id,
      document: e.is_company ? e.cnpj : e.document_number,
    }));
    return res.send({
      count: users.count,
      rows: data,
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

function extrairKycDetails(arr) {
  const traducoes = {
    waiting_analysis:
      'O pedido de afiliação foi iniciado e aguarda confirmação do sistema.',
    in_analysis: 'O pedido de afiliação foi recebido e está em análise.',
    additional_documents_required:
      'A afiliação possui pendências e será necessário respondê-las via webapp.',
    answered_waiting_analysis:
      '	As pendências foram respondidas pelo cliente e está em análise.',
    ok: '(Estado Final do KYC) A afiliação foi finalizada e aprovada.',
    fully_denied: '(Estado Final do KYC) A afiliação foi finalizada e negada',
  };
  if (arr.length > 0 && arr[0].payload?.data?.status === 'refused') {
    return [
      {
        kyc_details: {
          status: 'Recusado',
          status_reason:
            'Negado no cadastro, será necessário realizar novo procedimento. Antes disso, verificar todas informações se estão corretas',
        },
        created_at: arr[0].created_at,
      },
    ];
  }
  return arr
    .filter(
      (item) =>
        item.payload && item.payload.data && item.payload.data.kyc_details,
    )
    .map((item) => {
      const kycDetails = item.payload.data.kyc_details;
      return {
        kyc_details: {
          status: kycDetails.status,
          status_reason:
            traducoes[kycDetails.status_reason] || kycDetails.status_reason,
        },
        created_at: item.created_at,
      };
    });
}

module.exports.findUser = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;
  try {
    const user = await new FindUserInfo(UsersRepository).executeWithSQL({
      userUuid,
    });

    const {
      pagarme_recipient_id,
      pagarme_recipient_id_cnpj,
      pagarme_recipient_id_3,
      pagarme_recipient_id_cnpj_3,
    } = user;
    const pagarmeKey2 = new Pagarme('B4YOU_PAGARME_2');
    const pagarmeKey3 = new Pagarme('B4YOU_PAGARME_3');
    const accounts = [];
    if (pagarme_recipient_id) {
      accounts.push({
        recipient_id: pagarme_recipient_id,
        instance: pagarmeKey2,
      });
    }

    if (pagarme_recipient_id_cnpj) {
      accounts.push({
        recipient_id: pagarme_recipient_id_cnpj,
        instance: pagarmeKey2,
      });
    }

    if (pagarme_recipient_id_3) {
      accounts.push({
        recipient_id: pagarme_recipient_id_3,
        instance: pagarmeKey3,
      });
    }

    if (pagarme_recipient_id_cnpj_3) {
      accounts.push({
        recipient_id: pagarme_recipient_id_cnpj_3,
        instance: pagarmeKey3,
      });
    }

    const promises = [];
    for (const account of accounts) {
      promises.push(account.instance.getRecipientBalance(account.recipient_id));
    }

    try {
      const results = await Promise.allSettled(promises);
      user.pagarmeBalances = results
        .filter(
          (result) => result.status === 'fulfilled' && result.value !== null,
        )
        .map((result) => result.value);

      if (user.pagarmeBalances.length > 0) {
        console.log(
          `✓ Found ${user.pagarmeBalances.length} valid Pagar.me balance(s)`,
        );
      }
    } catch (error) {
      console.error('Error fetching Pagar.me balances:', error);
      user.pagarmeBalances = [];
    }
    return res.send(new SerializeUsers(user).adapt());
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

module.exports.findUsersBalances = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      search = '',
      start_date = null,
      end_date = null,
    },
  } = req;
  try {
    const cacheKey = `findUsersBalances:${JSON.stringify({
      page,
      size,
      search,
      start_date,
      end_date,
    })}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.send(cached);
    }

    const limit = parseInt(size, 10);
    const offset = limit * parseInt(page, 10);
    const promises = [];

    let whereClause = '';
    const replacements = { offset, limit };

    if (search) {
      whereClause += ' AND (u.full_name LIKE :search OR u.email LIKE :search)';
      replacements.search = `%${search}%`;
    }

    if (start_date && end_date) {
      whereClause += ' AND (u.created_at BETWEEN :start_date AND :end_date)';
      replacements.start_date = start_date;
      replacements.end_date = end_date;
    }

    const baseQuery = `
      SELECT
        u.id,
        u.uuid,
        u.full_name,
        u.email,
        COALESCE(c_pending.pending, 0) AS pending,
        COALESCE(c_paid.paid, 0) AS paid,
        COALESCE(t_withdrawals.withdrawals, 0) AS withdrawals,
        COALESCE(ua_activity.activity, 0) AS activity,
        (COALESCE(c_paid.paid, 0) - COALESCE(t_withdrawals.withdrawals, 0) + COALESCE(ua_activity.activity, 0)) AS balance
      FROM users u
      LEFT JOIN (
        SELECT id_user, SUM(amount) AS pending
        FROM commissions
        WHERE id_status = 2
        GROUP BY id_user
      ) c_pending ON c_pending.id_user = u.id
      LEFT JOIN (
        SELECT id_user, SUM(amount) AS paid
        FROM commissions
        WHERE id_status = 3
        GROUP BY id_user
      ) c_paid ON c_paid.id_user = u.id
      LEFT JOIN (
        SELECT id_user, SUM(withdrawal_total) AS withdrawals
        FROM transactions
        WHERE id_status IN (1, 2) AND id_type = 1
        GROUP BY id_user
      ) t_withdrawals ON t_withdrawals.id_user = u.id
      LEFT JOIN (
        SELECT id_user, SUM(amount) AS activity
        FROM user_activity
        GROUP BY id_user
      ) ua_activity ON ua_activity.id_user = u.id
      WHERE 1=1 ${whereClause}
    `;

    const filteredQuery = `
      SELECT * FROM (${baseQuery}) AS t
      WHERE t.balance != 0 OR t.pending != 0
    `;

    const idsQuery = `
      SELECT id, balance, pending FROM (${filteredQuery}) AS t ORDER BY balance DESC
    `;

    const countReplacements = { ...replacements };
    delete countReplacements.limit;
    delete countReplacements.offset;

    promises.push(
      models.sequelize.query(idsQuery, {
        replacements: countReplacements,
      }),
    );

    promises.push(
      models.sequelize.query(
        `${filteredQuery}
        ORDER BY balance DESC
        LIMIT :limit OFFSET :offset`,
        {
          replacements,
        },
      ),
    );

    const [[allResultsForCount], [result]] = await Promise.all(promises);

    const config = {
      credentials: {
        accessKeyId: process.env.B4YOU_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.B4YOU_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_DEFAULT_REGION,
    };
    const client = new DynamoDBClient(config);
    const docClient = DynamoDBDocumentClient.from(client);

    const fetchPagarmeBalances = async (r) => {
      r.pagarme_balance_pending = 0;
      r.pagarme_balance_available = 0;

      try {
        const params = {
          TableName: 'pagarme-balances',
          KeyConditionExpression: 'id_user = :id_user',
          ExpressionAttributeValues: {
            ':id_user': r.id.toString(),
          },
        };
        const command = new QueryCommand(params);
        const response = await docClient.send(command);
        if (response.Count > 0) {
          const item = response.Items[0];
          let totalWaiting = 0;
          let totalAvailable = 0;
          for (const key in item.data) {
            totalWaiting += Number(item.data[key].waiting_funds_amount);
            totalAvailable += Number(item.data[key].available_amount);
          }
          r.pagarme_balance_pending = totalWaiting;
          r.pagarme_balance_available = totalAvailable;
        }
      } catch (error) {
        console.log('error while getting dynamodb data -> ', error);
      }
      return r;
    };

    const allResultsWithPagarme = await Promise.all(
      allResultsForCount.map(async (row) => {
        const r = { id: row.id, balance: row.balance, pending: row.pending };
        return fetchPagarmeBalances(r);
      }),
    );

    const resultWithPagarme = await Promise.all(
      result.map(fetchPagarmeBalances),
    );

    const filterFn = (r) =>
      Number(r.balance) !== 0 ||
      Number(r.pending) !== 0 ||
      Number(r.pagarme_balance_pending) !== 0 ||
      Number(r.pagarme_balance_available) !== 0;

    const correctCount = allResultsWithPagarme.filter(filterFn).length;

    const filteredResult = resultWithPagarme.filter(filterFn);

    const response = {
      count: correctCount,
      rows: filteredResult.map(
        ({
          uuid,
          full_name,
          email,
          balance,
          pending,
          pagarme_balance_pending,
          pagarme_balance_available,
        }) => ({
          uuid,
          email,
          full_name: capitalizeName(full_name),
          balance,
          pending,
          pagarme_balance_pending,
          pagarme_balance_available,
        }),
      ),
    };

    await redis.set(cacheKey, response, 180);

    return res.send(response);
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

// eslint-disable-next-line consistent-return
module.exports.exportUsersBalances = async (req, res, next) => {
  const {
    query: { search = '', start_date = null, end_date = null },
  } = req;

  try {
    const cacheKey = `exportUsersBalances:${JSON.stringify({
      search,
      start_date,
      end_date,
    })}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      const filename = `saldo_usuarios_${moment().format('YYYY-MM-DD')}.xlsx`;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.send(Buffer.from(cached, 'base64'));
    }

    const filename = `saldo_usuarios_${moment().format('YYYY-MM-DD')}.xlsx`;

    const workbook = new exceljs.Workbook();

    const worksheet = workbook.addWorksheet('Saldos');
    worksheet.columns = usersColumns;

    const config = {
      credentials: {
        accessKeyId: process.env.B4YOU_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.B4YOU_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_DEFAULT_REGION,
    };

    const client = new DynamoDBClient(config);
    const docClient = DynamoDBDocumentClient.from(client);

    let whereClause = '';
    const replacements = {};

    if (search) {
      whereClause += ' AND (u.full_name LIKE :search OR u.email LIKE :search)';
      replacements.search = `%${search}%`;
    }

    if (start_date && end_date) {
      whereClause += ' AND (u.created_at BETWEEN :start_date AND :end_date)';
      replacements.start_date = start_date;
      replacements.end_date = end_date;
    }

    const querySql = `
      SELECT
        id,
        full_name,
        email,
        pending,
        paid,
        withdrawals,
        activity,
        (paid - withdrawals + activity) AS balance
      FROM
      (
        SELECT
          u.id AS id,
          u.full_name AS full_name,
          u.email AS email,
          IFNULL((SELECT SUM(amount) FROM commissions WHERE id_status = 2 AND id_user = u.id), 0) AS pending,
          IFNULL((SELECT SUM(amount) FROM commissions WHERE id_status = 3 AND id_user = u.id), 0) AS paid,
          IFNULL((SELECT SUM(withdrawal_total) FROM transactions WHERE id_status IN (1, 2) AND id_type = 1 AND id_user = u.id), 0) AS withdrawals,
          IFNULL((SELECT SUM(ua.amount) FROM user_activity ua WHERE ua.id_user = u.id), 0) AS activity
        FROM users u
        LEFT JOIN user_activity ua ON ua.id_user = u.id
        WHERE 1=1 ${whereClause}
      ) AS subquery
      WHERE (paid - withdrawals + activity) != 0 OR pending != 0
      ORDER BY balance DESC
    `;

    const [usersList] = await models.sequelize.query(querySql, {
      replacements,
    });

    if (!usersList || usersList.length === 0) {
      worksheet.addRow({
        full_name: 'Nenhum usuário com saldo encontrado',
        email: '',
        amount: 0,
        pending: 0,
        total: 0,
        pagarme_balance_pending: 0,
        pagarme_balance_available: 0,
      });
    }

    const batchSize = 50;
    for (let i = 0; i < usersList.length; i += batchSize) {
      const batch = usersList.slice(i, i + batchSize);

      const batchWithPagarme = await Promise.all(
        batch.map(async (r) => {
          let pagarme_balance_pending = 0;
          let pagarme_balance_available = 0;

          try {
            const params = {
              TableName: 'pagarme-balances',
              KeyConditionExpression: 'id_user = :id_user',
              ExpressionAttributeValues: {
                ':id_user': String(r.id),
              },
            };

            const command = new QueryCommand(params);
            const response = await docClient.send(command);

            if (response?.Items?.length) {
              const item = response.Items[0];
              for (const key in item.data) {
                pagarme_balance_pending += Number(
                  item.data[key]?.waiting_funds_amount || 0,
                );
                pagarme_balance_available += Number(
                  item.data[key]?.available_amount || 0,
                );
              }
            }
          } catch (err) {
            console.error('Erro DynamoDB:', err);
          }

          return {
            ...r,
            pagarme_balance_pending,
            pagarme_balance_available,
          };
        }),
      );

      const filteredBatch = batchWithPagarme.filter(
        (r) =>
          Number(r.balance) !== 0 ||
          Number(r.pending) !== 0 ||
          Number(r.pagarme_balance_pending) !== 0 ||
          Number(r.pagarme_balance_available) !== 0,
      );

      for (const r of filteredBatch) {
        worksheet.addRow({
          full_name: r.full_name ?? '',
          email: r.email ?? '',
          amount: Number(r.balance) || 0,
          pending: Number(r.pending) || 0,
          total: (Number(r.balance) || 0) + (Number(r.pending) || 0),
          pagarme_balance_pending:
            (Number(r.pagarme_balance_pending) || 0) / 100,
          pagarme_balance_available:
            (Number(r.pagarme_balance_available) || 0) / 100,
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();

    await redis.set(cacheKey, buffer.toString('base64'), 300);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
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

const serializeUsers = ({
  created_at,
  full_name,
  whatsapp,
  document_number,
  email,
}) => ({
  created_at: date(created_at).format(FRONTEND_DATE),
  full_name: capitalizeName(full_name),
  whatsapp,
  document_number,
  email,
});
// eslint-disable-next-line consistent-return
module.exports.exportUsers = async (req, res, next) => {
  const {
    query: { start_date, end_date },
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
      filename,
      stream: res,
    });

    const worksheet = workbook.addWorksheet();
    worksheet.columns = [
      {
        header: 'EMAIL',
        key: 'email',
        width: 50,
      },
      {
        header: 'NOME',
        key: 'full_name',
        width: 50,
      },
      {
        header: 'DOCUMENTO',
        key: 'document_number',
        width: 30,
      },
      {
        header: 'TELEFONE',
        key: 'whatsapp',
        width: 30,
      },
      {
        header: 'CRIADO EM',
        key: 'created_at',
        width: 30,
      },
    ];

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const users = await UsersRepository.findToExport({
        start_date,
        end_date,
        offset,
      });

      if (users.length === 0) break;
      offset += 200;
      for (const user of users) {
        worksheet.addRow(serializeUsers(user));
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

module.exports.updateUsersFees = async (req, res, next) => {
  const {
    params: { userUuid },
    body,
    user: { id: id_user_backoffice },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    let old_values = await SalesSettings.findOne({
      raw: true,
      where: {
        id_user: user.id,
      },
    });
    await SalesSettings.update(body, { where: { id_user: user.id } });
    const { withheld_balance_percentage = null, use_highest_sale = false } =
      body;
    if (withheld_balance_percentage !== null || use_highest_sale !== null) {
      const oldWithdrawalValues = await Withdrawals_settings.findOne({
        raw: true,
        where: {
          id_user: user.id,
        },
        attributes: ['use_highest_sale', 'withheld_balance_percentage'],
      });
      const fields = {};
      if (withheld_balance_percentage !== null) {
        fields.withheld_balance_percentage = withheld_balance_percentage;
      }

      if (use_highest_sale !== null) {
        fields.use_highest_sale = use_highest_sale;
      }
      old_values = {
        ...old_values,
        ...oldWithdrawalValues,
      };
      await Withdrawals_settings.update(fields, {
        where: { id_user: user.id },
      });
    }
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findRoleTypeByKey('update-sales-settings').id,
      params: {
        user_agent,
        old_values,
      },
      ip_address,
      id_user: user.id,
    });
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

module.exports.updateUser = async (req, res, next) => {
  const {
    params: { userUuid },
    body,
    user: { id: id_user_backoffice },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    await UsersRepository.update(
      { id: user.id },
      {
        follow_up: body.follow_up,
      },
    );
    await createLogBackoffice({
      id_user_backoffice,
      id_event: body.follow_up
        ? findRoleTypeByKey('alert-true').id
        : findRoleTypeByKey('alert-false').id,
      params: {
        user_agent,
      },
      ip_address,
      id_user: user.id,
    });
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

module.exports.blockAwardEligibility = async (req, res, next) => {
  const {
    params: { userUuid },
    user: { id: id_user_backoffice },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    await UsersRepository.update({ id: user.id }, { award_eligible: false });
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findRoleTypeByKey('update-data').id,
      params: { user_agent },
      ip_address,
      id_user: user.id,
    });
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

module.exports.unblockAwardEligibility = async (req, res, next) => {
  const {
    params: { userUuid },
    user: { id: id_user_backoffice },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    await UsersRepository.update({ id: user.id }, { award_eligible: true });
    await createLogBackoffice({
      id_user_backoffice,
      id_event: findRoleTypeByKey('update-data').id,
      params: { user_agent },
      ip_address,
      id_user: user.id,
    });
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

module.exports.getUpsellNative = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;

  try {
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    return res.json({
      upsell_native_enabled: Boolean(user.upsell_native_enabled),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalservererror(
        `Erro ao buscar dados do Upsell Nativo`,
        error,
      ),
    );
  }
};

module.exports.enableUpsellNative = async (req, res, next) => {
  const {
    params: { userUuid },
    user: { id: id_user_backoffice },
  } = req;

  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');

    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    await UsersRepository.update(
      { id: user.id },
      { upsell_native_enabled: true },
    );

    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('upsell-native-enabled').id,
      params: { user_agent },
      ip_address,
      id_user: user.id,
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalservererror(
        `Erro ao habilitar Upsell Nativo`,
        error,
      ),
    );
  }
};

module.exports.disableUpsellNative = async (req, res, next) => {
  const {
    params: { userUuid },
    user: { id: id_user_backoffice },
  } = req;

  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');

    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');

    await UsersRepository.update(
      { id: user.id },
      { upsell_native_enabled: false },
    );

    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('upsell-native-disabled').id,
      params: { user_agent },
      ip_address,
      id_user: user.id,
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalservererror(
        `Erro ao desabilitar Upsell Nativo`,
        error,
      ),
    );
  }
};

const metricResponse = (metricCount, totalCount, amount) => {
  const response = {};
  response.total = metricCount ?? 0;
  response.amount = amount ?? 0;
  response.percentage = totalCount
    ? ((metricCount ?? 0) / totalCount) * 100
    : 0;
  return response;
};

module.exports.getMetrics = async (req, res, next) => {
  const {
    params: { userUuid },
    query: { start_date, end_date },
  } = req;
  try {
    const user = await UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const [metrics] = await SalesMetricsDaily.findAll({
      logging: false,
      raw: true,
      where: {
        id_user: user.id,
        time: {
          [Op.between]: [
            date(start_date).startOf('day').utc(),
            date(end_date).endOf('day').utc(),
          ],
        },
      },
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('pending_total')), 'pending_total'],
        [Sequelize.fn('sum', Sequelize.col('paid_total')), 'paid_total'],
        [
          Sequelize.fn('sum', Sequelize.col('refunded_total')),
          'refunded_total',
        ],
        [
          Sequelize.fn('sum', Sequelize.col('chargeback_total')),
          'chargeback_total',
        ],
        [Sequelize.fn('sum', Sequelize.col('denied_total')), 'denied_total'],
        [Sequelize.fn('sum', Sequelize.col('pending_count')), 'pending_count'],
        [Sequelize.fn('sum', Sequelize.col('paid_count')), 'paid_count'],
        [
          Sequelize.fn('sum', Sequelize.col('refunded_count')),
          'refunded_count',
        ],
        [
          Sequelize.fn('sum', Sequelize.col('chargeback_count')),
          'chargeback_count',
        ],
        [Sequelize.fn('sum', Sequelize.col('denied_count')), 'denied_count'],
      ],
    });
    const {
      pending_total,
      pending_count,
      paid_total,
      paid_count,
      refunded_total,
      refunded_count,
      chargeback_total,
      chargeback_count,
      denied_total,
      denied_count,
    } = metrics;
    const total =
      (pending_count ?? 0) +
      (paid_count ?? 0) +
      (refunded_count ?? 0) +
      (chargeback_count ?? 0) +
      (denied_count ?? 0);
    return res.send({
      pending: metricResponse(pending_count, total, pending_total),
      paid: metricResponse(paid_count, total, paid_total),
      refunded: metricResponse(refunded_count, total, refunded_total),
      chargeback: metricResponse(chargeback_count, total, chargeback_total),
      denied: metricResponse(denied_count, total, denied_total),
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

exports.listReactivationProducers = async (req, res, next) => {
  try {
    const { status, name, email, page, size } = req.query;
    const { rows, count } = await UsersRepository.findReactivationList({
      status,
      name,
      email,
      page: parseInt(page, 10) || 0,
      size: parseInt(size, 10) || 10,
    });
    return res.json({ rows, count });
  } catch (err) {
    next(ApiError.internalservererror('Erro ao listar reativação', err));
  }
};

exports.updateReactivationStatus = async (req, res, next) => {
  try {
    const { userUuid } = req.params;
    const { status } = req.body;
    const current = await UsersRepository.getStatusByUuid(userUuid);
    if (!['not_contacted', 'contacting'].includes(current)) {
      return next(
        ApiError.badrequest(
          'Só é permitido mudar status de not_contacted ou contacting',
        ),
      );
    }
    await UsersRepository.updateReactivationStatus(userUuid, status);
    return res.sendStatus(204);
  } catch (err) {
    next(ApiError.internalservererror('Erro ao atualizar status', err));
  }
};

exports.generateReactivationReport = async (_req, res, next) => {
  try {
    console.info('[ReactivationReport] Iniciando geração de relatório');
    const rows = await UsersRepository.getCurrentMonthReactivationReport();
    console.info(`[ReactivationReport] Encontrados ${rows.length} registros`);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reativação de Produtores');
    sheet.columns = [
      { header: 'UUID', key: 'uuid', width: 36 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'E-mail', key: 'email', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Vendas Mês Ant.', key: 'lastMonthSales', width: 15 },
      { header: 'Última Venda', key: 'lastSaleDate', width: 20 },
    ];

    const statusMap = {
      contacting: 'em_contato',
      not_contacted: 'não_contatado',
      success: 'sucesso',
    };

    for (const r of rows) {
      sheet.addRow({
        uuid: r.uuid,
        name: r.name,
        email: r.email,
        status: statusMap[r.reactivation_status] || 'desconhecido',
        lastMonthSales: r.lastMonthSales,
        lastSaleDate: r.lastSaleDate
          ? DateHelper(r.lastSaleDate).format('DD/MM/YYYY')
          : null,
      });
    }
    console.info('[ReactivationReport] Planilha populada');

    // streaming direto
    res.status(200).set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reativacao_produtores_${DateHelper()
        .utc()
        .format('YYYY_MM')}.xlsx"`,
    });
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('[ReactivationReport] Erro ao gerar relatório:', err);
    next(
      ApiError.internalservererror(
        'Erro ao gerar relatório de reativação',
        err,
      ),
    );
  }
};

exports.resetReactivationStatuses = async (_req, res, next) => {
  try {
    await UsersRepository.resetAllReactivationStatuses();
    await UsersRepository.assignNotContactedToPrevMonth();
    return res.sendStatus(204);
  } catch (err) {
    return next(ApiError.internalservererror('Erro no reset mensal', err));
  }
};

module.exports.findUsersWithStats = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      blocked_withdrawal = null,
      follow_up = null,
      negative_balance = null,
    },
  } = req;
  try {
    const { rows, count } = await UsersRepository.findUsersWithStatsWithSQL({
      input,
      page,
      size,
      blocked_withdrawal,
      follow_up,
      negative_balance,
    });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows: new SerializeUsers(rows).adapt(),
      },
      status: 200,
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

module.exports.findUserInfo = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;
  try {
    const user = await UsersRepository.findByUUIDWithSQL(userUuid);
    return res.send(new SerializeUsers(user).adapt());
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

module.exports.findAverageSales = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, start_date, end_date },
  } = req;
  try {
    const { rows, count } = await new FindAverageSales(
      UsersRepository,
    ).executeWithSQL({
      page,
      size,
      start_date,
      end_date,
    });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows,
      },
      status: 200,
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

module.exports.getUserBlockNotes = async (req, res, next) => {
  try {
    const { userUuid } = req.params;

    const user = await Users.findOne({
      where: { uuid: userUuid },
      attributes: ['id'],
    });

    if (!user) {
      return res.status(200).json({
        blockNotes: [],
      });
    }

    const withdrawal_notes = await Withdrawal_notes.findAll({
      where: { id_user: user.id },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'text', 'created_at', 'updated_at', 'id_type'],
      include: [
        {
          model: Users_backoffice,
          as: 'user_backoffice',
          attributes: ['full_name'],
          required: false,
        },
      ],
    });

    return res.status(200).json({
      blockNotes: withdrawal_notes,
    });
  } catch (error) {
    console.error('Error in getUserBlockNotes:', error);
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

module.exports.findUserBankAccounts = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      status = 'pending',
      start_date = null,
      end_date = null,
    },
  } = req;
  try {
    const filteredCompany = [];
    const filteredIndividual = [];
    const { rows, count } = await userBankAccounts.executeWithSQL({
      input,
      page,
      size,
      status,
      start_date,
      end_date,
    });
    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        count,
        rows,
      },
      filteredCompany,
      filteredIndividual,
      status: 200,
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

module.exports.approveUserBankAccount = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    await userBankAccounts.approveById({ id });

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

module.exports.rejectUserBankAccount = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');
  try {
    const user = await userBankAccounts.rejectById({ id });
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

module.exports.getPagarmeBalance = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;
  try {
    const user = await Users.findOne({
      raw: true,
      where: { uuid: userUuid },
      attributes: ['id'],
    });

    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    const config = {
      credentials: {
        accessKeyId: process.env.B4YOU_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.B4YOU_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_DEFAULT_REGION,
    };
    const client = new DynamoDBClient(config);
    const docClient = DynamoDBDocumentClient.from(client);

    const params = {
      TableName: 'pagarme-balances',
      KeyConditionExpression: 'id_user = :id_user',
      ExpressionAttributeValues: {
        ':id_user': user.id.toString(),
      },
    };

    const command = new QueryCommand(params);
    const response = await docClient.send(command);

    const defaultBalanceData = {
      available_amount: '0',
      waiting_funds_amount: '0',
      transferred_amount: '0',
    };

    const pagarmeBalance = {
      key_2_cpf: { ...defaultBalanceData },
      key_3_cpf: { ...defaultBalanceData },
      key_2_cnpj: { ...defaultBalanceData },
      key_3_cnpj: { ...defaultBalanceData },
      totals: {
        available: 0,
        waiting_funds: 0,
        transferred: 0,
        total: 0,
      },
      updated_at: null,
    };

    if (response.Count > 0 && response.Items && response.Items.length > 0) {
      const item = response.Items[0];

      // Extract updated_at from item
      if (item.updated_at) {
        // Handle DynamoDB Document Client format (already deserialized)
        if (
          typeof item.updated_at === 'string' ||
          typeof item.updated_at === 'number'
        ) {
          pagarmeBalance.updated_at = item.updated_at;
        } else if (item.updated_at.S) {
          // Handle DynamoDB native format (String)
          pagarmeBalance.updated_at = item.updated_at.S;
        } else if (item.updated_at.N) {
          // Handle DynamoDB native format (Number)
          pagarmeBalance.updated_at = item.updated_at.N;
        }
      }

      if (item.data) {
        const extractValue = (obj, key) => {
          if (obj && obj.M && obj.M[key] && obj.M[key].S) {
            return obj.M[key].S;
          }

          if (obj && obj[key]) {
            return obj[key];
          }
          return '0';
        };

        const extractBalanceObject = (obj) => {
          if (obj && obj.M) {
            return {
              available_amount: extractValue(obj, 'available_amount') || '0',
              waiting_funds_amount:
                extractValue(obj, 'waiting_funds_amount') || '0',
              transferred_amount:
                extractValue(obj, 'transferred_amount') || '0',
            };
          }

          if (obj && typeof obj === 'object') {
            return {
              available_amount: obj.available_amount || '0',
              waiting_funds_amount: obj.waiting_funds_amount || '0',
              transferred_amount: obj.transferred_amount || '0',
            };
          }
          return { ...defaultBalanceData };
        };

        const data = item.data.M || item.data;

        pagarmeBalance.key_2_cpf = extractBalanceObject(data.key_2_cpf);
        pagarmeBalance.key_3_cpf = extractBalanceObject(data.key_3_cpf);
        pagarmeBalance.key_2_cnpj = extractBalanceObject(data.key_2_cnpj);
        pagarmeBalance.key_3_cnpj = extractBalanceObject(data.key_3_cnpj);

        const allKeys = [
          pagarmeBalance.key_2_cpf,
          pagarmeBalance.key_3_cpf,
          pagarmeBalance.key_2_cnpj,
          pagarmeBalance.key_3_cnpj,
        ];

        pagarmeBalance.totals = allKeys.reduce(
          (acc, key) => {
            const available = parseInt(key.available_amount || '0', 10);
            const waiting = parseInt(key.waiting_funds_amount || '0', 10);
            const transferred = parseInt(key.transferred_amount || '0', 10);

            acc.available += available;
            acc.waiting_funds += waiting;
            acc.transferred += transferred;
            acc.total += available + waiting + transferred;

            return acc;
          },
          { available: 0, waiting_funds: 0, transferred: 0, total: 0 },
        );
      }
    }
    return res.json({
      success: true,
      data: pagarmeBalance,
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

module.exports.getRecipientBalances = async (req, res, next) => {
  const {
    params: { userUuid },
  } = req;
  try {
    const user = await Users.findOne({
      where: { uuid: userUuid },
      raw: true,
      attributes: [
        'id',
        'pagarme_recipient_id',
        'pagarme_recipient_id_cnpj',
        'pagarme_recipient_id_3',
        'pagarme_recipient_id_cnpj_3',
      ],
    });
    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    const {
      pagarme_recipient_id,
      pagarme_recipient_id_cnpj,
      pagarme_recipient_id_3,
      pagarme_recipient_id_cnpj_3,
    } = user;

    const pagarmeKey2 = new Pagarme('B4YOU_PAGARME_2');
    const pagarmeKey3 = new Pagarme('B4YOU_PAGARME_3');

    const accounts = [];

    if (pagarme_recipient_id) {
      accounts.push({
        recipient_id: pagarme_recipient_id,
        instance: pagarmeKey2,
        type: 'key_2_cpf',
      });
    }

    if (pagarme_recipient_id_cnpj) {
      accounts.push({
        recipient_id: pagarme_recipient_id_cnpj,
        instance: pagarmeKey2,
        type: 'key_2_cnpj',
      });
    }

    if (pagarme_recipient_id_3) {
      accounts.push({
        recipient_id: pagarme_recipient_id_3,
        instance: pagarmeKey3,
        type: 'key_3_cpf',
      });
    }

    if (pagarme_recipient_id_cnpj_3) {
      accounts.push({
        recipient_id: pagarme_recipient_id_cnpj_3,
        instance: pagarmeKey3,
        type: 'key_3_cnpj',
      });
    }

    const promises = accounts.map((account) =>
      account.instance
        .getRecipientBalance(account.recipient_id)
        .then((balance) => ({
          type: account.type,
          recipient_id: account.recipient_id,
          balance,
          success: true,
        }))
        .catch((error) => ({
          type: account.type,
          recipient_id: account.recipient_id,
          balance: null,
          success: false,
          error: error.message,
        })),
    );

    const results = await Promise.all(promises);
    const balances = {
      key_2_cpf: null,
      key_2_cnpj: null,
      key_3_cpf: null,
      key_3_cnpj: null,
    };

    results.forEach((result) => {
      if (result.success && result.balance) {
        balances[result.type] = {
          recipient_id: result.recipient_id,
          ...result.balance,
        };
      } else {
        balances[result.type] = {
          recipient_id: result.recipient_id,
          error: result.error || 'Balance not found',
        };
      }
    });

    const newData = {
      key_2_cpf: {
        available_amount: (
          balances.key_2_cpf?.available_amount ?? '0'
        ).toString(),
        waiting_funds_amount: (
          balances.key_2_cpf?.waiting_funds_amount ?? '0'
        ).toString(),
        transferred_amount: (
          balances.key_2_cpf?.transferred_amount ?? '0'
        ).toString(),
      },
      key_3_cpf: {
        available_amount: (
          balances.key_3_cpf?.available_amount ?? '0'
        ).toString(),
        waiting_funds_amount: (
          balances.key_3_cpf?.waiting_funds_amount ?? '0'
        ).toString(),
        transferred_amount: (
          balances.key_3_cpf?.transferred_amount ?? '0'
        ).toString(),
      },
      key_2_cnpj: {
        available_amount: (
          balances.key_2_cnpj?.available_amount ?? '0'
        ).toString(),
        waiting_funds_amount: (
          balances.key_2_cnpj?.waiting_funds_amount ?? '0'
        ).toString(),
        transferred_amount: (
          balances.key_2_cnpj?.transferred_amount ?? '0'
        ).toString(),
      },
      key_3_cnpj: {
        available_amount: (
          balances.key_3_cnpj?.available_amount ?? '0'
        ).toString(),
        waiting_funds_amount: (
          balances.key_3_cnpj?.waiting_funds_amount ?? '0'
        ).toString(),
        transferred_amount: (
          balances.key_3_cnpj?.transferred_amount ?? '0'
        ).toString(),
      },
    };
    const config = {
      credentials: {
        accessKeyId: process.env.B4YOU_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.B4YOU_AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_DEFAULT_REGION,
    };
    const client = new DynamoDBClient(config);
    const docClient = DynamoDBDocumentClient.from(client);

    const params = {
      TableName: 'pagarme-balances',
      Item: {
        id_user: user.id.toString(),
        data: newData,
        updated_at: new Date().toISOString(),
      },
    };

    const command = new PutCommand(params);
    await docClient.send(command);

    return res.json({
      success: true,
      data: balances,
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

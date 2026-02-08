const { Op, Sequelize } = require('sequelize');
const ApiError = require('../error/ApiError');
const Logs_backoffice = require('../database/models/Logs_backoffice');
const Users_backoffice = require('../database/models/Users_backoffice');
const { findUserEventTypeByKey } = require('../types/userEvents');
const dateHelper = require('../utils/helpers/date');

module.exports.listLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      event_type = null,
      start_date = null,
      end_date = null,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};
    const rbacEventIds = [
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
    ];
    whereClause.id_event = { [Op.in]: rbacEventIds };

    if (event_type) {
      const event = findUserEventTypeByKey(event_type);
      if (event) {
        whereClause.id_event = event.id;
      }
    }

    if (start_date && end_date) {
      const startDate = dateHelper(start_date).startOf('day').utc().toDate();
      const endDate = dateHelper(end_date).endOf('day').utc().toDate();
      whereClause.created_at = {
        [Op.between]: [startDate, endDate],
      };
    } else if (start_date) {
      const startDate = dateHelper(start_date).startOf('day').utc().toDate();
      whereClause.created_at = {
        [Op.gte]: startDate,
      };
    } else if (end_date) {
      const endDate = dateHelper(end_date).endOf('day').utc().toDate();
      whereClause.created_at = {
        [Op.lte]: endDate,
      };
    }

    let userWhereClause = {};
    if (search && search.trim() !== '') {
      userWhereClause = {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.full_name')),
            Op.like,
            `%${search.toLowerCase()}%`,
          ),
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('user.email')),
            Op.like,
            `%${search.toLowerCase()}%`,
          ),
        ],
      };
    }

    const { count, rows: logs } = await Logs_backoffice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Users_backoffice,
          as: 'user',
          attributes: ['id', 'full_name', 'email'],
          where: userWhereClause,
          required: true,
        },
      ],
      attributes: [
        'id',
        'id_user_backoffice',
        'id_user',
        'id_event',
        'params',
        'ip_address',
        'created_at',
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    const logsWithEventInfo = logs.map((log) => {
      let eventInfo = { label: 'Evento desconhecido', key: 'unknown' };

      const rbacEvents = [
        {
          id: 28,
          key: 'update-user-role',
          label: 'Atualizou role de usuário do backoffice',
        },
        {
          id: 29,
          key: 'update-user-status',
          label: 'Atualizou status de usuário do backoffice',
        },
        { id: 30, key: 'create-role', label: 'Criou nova role' },
        { id: 31, key: 'update-role', label: 'Atualizou role' },
        { id: 32, key: 'delete-role', label: 'Removeu role' },
        { id: 33, key: 'update-role-menus', label: 'Atualizou menus da role' },
        { id: 34, key: 'create-menu-item', label: 'Criou item de menu' },
        { id: 35, key: 'update-menu-item', label: 'Atualizou item de menu' },
        { id: 36, key: 'delete-menu-item', label: 'Removeu item de menu' },
      ];

      const foundEvent = rbacEvents.find((event) => event.id === log.id_event);
      if (foundEvent) {
        eventInfo = foundEvent;
      }

      return {
        ...log.toJSON(),
        event_label: eventInfo.label,
        event_key: eventInfo.key,
        formatted_created_at: dateHelper(log.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(log.created_at).valueOf(),
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        logs: logsWithEventInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error in listLogs:', error);
    next(new ApiError('Erro ao listar logs', 500, error.message));
  }
};

module.exports.getEventTypes = async (req, res, next) => {
  try {
    const rbacEventTypes = [
      {
        id: 28,
        key: 'update-user-role',
        label: 'Atualizou role de usuário do backoffice',
      },
      {
        id: 29,
        key: 'update-user-status',
        label: 'Atualizou status de usuário do backoffice',
      },
      { id: 30, key: 'create-role', label: 'Criou nova role' },
      { id: 31, key: 'update-role', label: 'Atualizou role' },
      { id: 32, key: 'delete-role', label: 'Removeu role' },
      { id: 33, key: 'update-role-menus', label: 'Atualizou menus da role' },
      { id: 34, key: 'create-menu-item', label: 'Criou item de menu' },
      { id: 35, key: 'update-menu-item', label: 'Atualizou item de menu' },
      { id: 36, key: 'delete-menu-item', label: 'Removeu item de menu' },
      { id: 37, key: 'create-user', label: 'Criou novo usuário do backoffice' },
      { id: 38, key: 'form-create', label: 'Criação de Formulário' },
      { id: 39, key: 'form-update', label: 'Atualização de Formulário' },
      { id: 40, key: 'form-delete', label: 'Exclusão de Formulário' },
      { id: 41, key: 'form-publish', label: 'Publicação de Versão' },
      { id: 42, key: 'form-activate', label: 'Ativação de Formulário' },
      { id: 43, key: 'form-deactivate', label: 'Desativação de Formulário' },
      { id: 44, key: 'question-create', label: 'Criação de Pergunta' },
      { id: 45, key: 'question-update', label: 'Atualização de Pergunta' },
      { id: 46, key: 'question-delete', label: 'Exclusão de Pergunta' },
      { id: 47, key: 'question-reorder', label: 'Reordenação de Perguntas' },
    ];

    res.json({
      success: true,
      data: rbacEventTypes,
    });
  } catch (error) {
    next(new ApiError('Erro ao listar tipos de eventos', 500, error.message));
  }
};

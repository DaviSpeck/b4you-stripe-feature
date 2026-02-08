const { buildMonitoringParams } = require('../utils/helpers/monitoringParams');
const MonitoringRepository = require('../repositories/sequelize/MonitoringRepository');
const { managerStatusContactTypes } = require('../types/manager_status_contact');
const {
  dateHelperTZ,
  getPeriodParams
} = require('../utils/helpers/date-tz');
const moment = require('moment-timezone');
const { buildDateRangePayload } = require('../utils/helpers/date-range');

async function getSingleProducerStage(req, res) {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'Missing user id' });
    }

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const today = moment.tz(dateHelperTZ(new Date(), tz), tz);
    const startOfMonth = today.clone().startOf('month');

    const range = buildDateRangePayload([
      startOfMonth.toDate(),
      today.toDate(),
    ]);

    if (!range) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const params = {
      start_date: moment(range.start).format('YYYY-MM-DD'),
      end_date: moment(range.end).format('YYYY-MM-DD'),
      prev_start_date: moment(range.prevStart).format('YYYY-MM-DD'),
      prev_end_date: moment(range.prevEnd).format('YYYY-MM-DD'),
      user_id: userId,
    };

    const data = await MonitoringRepository.findSingleProducerStage(params);

    return res.status(200).json(data);

  } catch (error) {
    console.error('[getSingleProducerStage] Error:', error);
    const code = error.status || 500;
    return res.status(code).json({ message: error.message });
  }
}

async function getProducersPerformance(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user);
    const data = await MonitoringRepository.findProducersPerformance(params);
    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ message: error.message });
  }
}

async function getProducersSummary(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user);
    const data = await MonitoringRepository.findProducersSummary(params);
    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ message: error.message });
  }
}

async function getProducersKanban(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user, { size: 5 });
    const data = await MonitoringRepository.findProducersKanban(params);
    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ message: error.message });
  }
}

async function updateContactStatus(req, res) {
  try {
    const { user_id, contact_status, next_contact_date } = req.body || {};
    if (!user_id || !contact_status) {
      return res.status(400).json({ message: 'Campos obrigatórios: user_id e contact_status' });
    }

    const validStatuses = managerStatusContactTypes.map((s) => s.key);
    if (!validStatuses.includes(String(contact_status))) {
      return res.status(400).json({
        message: 'Status de contato inválido',
        valid_options: validStatuses,
      });
    }

    const result = await MonitoringRepository.updateContactStatus({
      user_id,
      contact_status,
      next_contact_date: next_contact_date || null,
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar status de contato',
      error: error.message,
    });
  }
}

async function getProducersOverview(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user);

    const [summary, performance] = await Promise.all([
      MonitoringRepository.findProducersSummary(params),
      MonitoringRepository.findProducersPerformance(params),
    ]);

    return res.status(200).json({ summary, performance });
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ message: error.message });
  }
}

async function getProducersKanbanAll(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user, { size: 5 });

    const data = await MonitoringRepository.findProducersKanbanAll(params);

    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    console.error('[MonitoringCtrl:getProducersKanbanAll]', error);
    return res.status(code).json({ message: error.message });
  }
}

async function getChurnCard(req, res) {
  try {
    const { start_date, end_date, prev_start_date, prev_end_date, manager_id } = req.query;

    if (!start_date || !end_date || !prev_start_date || !prev_end_date) {
      return res.status(400).json({
        message: 'start_date, end_date, prev_start_date e prev_end_date são obrigatórios',
      });
    }

    const params = {
      start_date,
      end_date,
      prev_start_date,
      prev_end_date,
      manager_id: manager_id || null,
    };

    const { cardCount, cardRevenueLoss } =
      await MonitoringRepository.findChurnCard(params);

    return res.status(200).json({
      churnCount: cardCount,
      churnRevenueLoss: cardRevenueLoss,
    });
  } catch (error) {
    console.error('[ChurnCtrl:getChurnCard]', error);
    return res.status(error.status || 500).json({ message: error.message });
  }
}

async function getChurnList(req, res) {
  try {
    const { start_date, end_date, prev_start_date, prev_end_date, manager_id, page = 0, size = 10 } = req.query;

    if (!start_date || !end_date || !prev_start_date || !prev_end_date) {
      return res.status(400).json({
        message: 'start_date, end_date, prev_start_date e prev_end_date são obrigatórios',
      });
    }

    const params = {
      start_date,
      end_date,
      prev_start_date,
      prev_end_date,
      manager_id: manager_id || null,
      page: Number(page),
      size: Number(size)
    };

    const result = await MonitoringRepository.findChurnPaginated(params);
    return res.status(200).json(result);

  } catch (error) {
    console.error('[ChurnCtrl:getChurnList]', error);
    return res.status(error.status || 500).json({ message: error.message });
  }
}

module.exports = {
  getSingleProducerStage,
  getProducersPerformance,
  getProducersSummary,
  getProducersKanban,
  getProducersKanbanAll,
  getProducersOverview,
  updateContactStatus,
  getChurnCard,
  getChurnList
};
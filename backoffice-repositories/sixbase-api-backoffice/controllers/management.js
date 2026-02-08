const { buildMonitoringParams } = require('../utils/helpers/monitoringParams');
const ManagementRepository = require('../repositories/sequelize/ManagementRepository');

async function getManagementKanban(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user, { size: 10 });
    const { phase } = req.query;

    if (!phase) {
      return res.status(400).json({ message: 'Parâmetro phase é obrigatório' });
    }

    const data = await ManagementRepository.findManagementKanban({
      ...params,
      phase,
    });
    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ message: error.message });
  }
}

async function getManagementKanbanAll(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user, { size: 10 });
    const data = await ManagementRepository.findManagementKanbanAll(params);
    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    console.error('[ManagementCtrl:getManagementKanbanAll]', error);
    return res.status(code).json({ message: error.message });
  }
}

async function updateManagerPhase(req, res) {
  try {
    const { user_id, phase } = req.body || {};

    if (!user_id) {
      return res.status(400).json({ message: 'Campo obrigatório: user_id' });
    }

    const result = await ManagementRepository.updateManagerPhase({
      user_id,
      phase: phase || null,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao atualizar fase do manager',
      error: error.message,
    });
  }
}

async function getManagementTable(req, res) {
  try {
    const params = buildMonitoringParams(req.query, req.user, { size: 10 });
    const { phase } = req.query;

    const data = await ManagementRepository.findManagementTable({
      ...params,
      phase: phase || null,
    });
    return res.status(200).json(data);
  } catch (error) {
    const code = error.status || 500;
    console.error('[ManagementCtrl:getManagementTable]', error);
    return res.status(code).json({ message: error.message });
  }
}

async function addClientToNovosClientes(req, res) {
  try {
    const { user_id, user_uuid, manager_id } = req.body || {};

    if (!user_id && !user_uuid) {
      return res
        .status(400)
        .json({ message: 'Campo obrigatório: user_id ou user_uuid' });
    }

    if (!manager_id) {
      return res.status(400).json({ message: 'Campo obrigatório: manager_id' });
    }

    const result = await ManagementRepository.addClientToNovosClientes({
      user_id,
      user_uuid,
      manager_id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao adicionar cliente a Novos Clientes',
      error: error.message,
    });
  }
}

async function checkUsersInWallet(req, res) {
  try {
    const { user_ids, user_uuids } = req.body || {};

    if (
      (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) &&
      (!user_uuids || !Array.isArray(user_uuids) || user_uuids.length === 0)
    ) {
      return res.status(400).json({
        message: 'Campo obrigatório: user_ids ou user_uuids (array)',
      });
    }

    const result = await ManagementRepository.checkUsersInWallet({
      user_ids: user_ids || [],
      user_uuids: user_uuids || [],
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao verificar usuários na carteira',
      error: error.message,
    });
  }
}

async function getSingleUserManagementData(req, res) {
  try {
    const { sequelize } = require('../database/models');
    const userId = req.params.id;

    console.log('[getSingleUserManagementData] Request recebido:', {
      userId,
      params: req.params,
    });

    if (!userId) {
      return res.status(400).json({ message: 'Missing user id' });
    }

    // Verificar se é UUID ou ID numérico
    function isUUID(value) {
      return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
    }

    const where = isUUID(userId) ? { uuid: userId } : { id: userId };

    const user = await sequelize.models.users.findOne({
      where,
      attributes: ['id', 'uuid', 'manager_phase', 'id_manager_status_contact'],
      raw: true,
    });

    console.log('[getSingleUserManagementData] User encontrado:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Converter id_manager_status_contact para contact_status (string key)
    const statusMap = {
      1: 'NAO_CONTATADO',
      2: 'EM_CONTATO',
      3: 'EM_ACOMPANHAMENTO',
      4: 'SEM_RETORNO',
      5: 'CONCLUIDO',
    };

    const contact_status = user.id_manager_status_contact
      ? statusMap[user.id_manager_status_contact] || 'NAO_CONTATADO'
      : 'NAO_CONTATADO';

    const result = {
      id: user.id,
      uuid: user.uuid,
      manager_phase: user.manager_phase || null,
      id_manager_status_contact: user.id_manager_status_contact || null,
      contact_status,
    };

    console.log('[getSingleUserManagementData] Retornando:', result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[getSingleUserManagementData] Error:', error);
    return res.status(500).json({
      message: 'Erro ao buscar dados do usuário',
      error: error.message,
    });
  }
}

module.exports = {
  getManagementKanban,
  getManagementKanbanAll,
  updateManagerPhase,
  getManagementTable,
  addClientToNovosClientes,
  checkUsersInWallet,
  getSingleUserManagementData,
};

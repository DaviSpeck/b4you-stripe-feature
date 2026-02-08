const cron = require('node-cron');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../database/models');
const { findManagerStatusContactTypeByKey } = require('../types/manager_status_contact');
const { dateHelperTZ } = require('../utils/helpers/date-tz');

/**
 * Cron job que roda toda segunda-feira às 00:00
 * Reseta o status de contato para "NÃO CONTATADO" para todos os clientes,
 * EXCETO aqueles que têm um próximo contato agendado após o reset
 */
cron.schedule('0 0 * * 1', async () => {
  console.info('[Cron] Iniciando reset semanal de status de contato');

  try {
    const tz = process.env.TZ || 'America/Sao_Paulo';
    const now = dateHelperTZ(undefined, tz).now();
    const startOfWeek = now.clone().startOf('week').startOf('day');

    // Buscar o ID do status "NÃO CONTATADO"
    const naoContatadoStatus = findManagerStatusContactTypeByKey('NAO_CONTATADO');
    if (!naoContatadoStatus) {
      console.error('[Cron] Status "NÃO CONTATADO" não encontrado');
      return;
    }

    const naoContatadoId = naoContatadoStatus.id;

    // Query para resetar status, exceto clientes com próximo contato agendado após o início da semana
    const startOfWeekStr = startOfWeek.format('YYYY-MM-DD HH:mm:ss');
    
    const [result] = await sequelize.query(
      `UPDATE users
       SET id_manager_status_contact = :naoContatadoId
       WHERE id_manager IS NOT NULL
         AND id_manager_status_contact != :naoContatadoId
         AND (
           next_contact_date IS NULL
           OR next_contact_date < :startOfWeek
         )`,
      {
        replacements: {
          naoContatadoId,
          startOfWeek: startOfWeekStr,
        },
        type: QueryTypes.UPDATE,
      }
    );

    const affectedRows = result || 0;
    console.info(`[Cron] Reset semanal concluído. ${affectedRows} clientes resetados para "NÃO CONTATADO"`);

    // Log de exceções (clientes que mantiveram o status)
    const exceptionQuery = `
      SELECT COUNT(*) as count
      FROM users
      WHERE id_manager IS NOT NULL
        AND id_manager_status_contact != :naoContatadoId
        AND next_contact_date IS NOT NULL
        AND next_contact_date >= :startOfWeek
    `;

    const [exceptions] = await sequelize.query(exceptionQuery, {
      replacements: {
        naoContatadoId,
        startOfWeek: startOfWeekStr,
      },
      type: QueryTypes.SELECT,
      plain: true,
    });

    const exceptionCount = exceptions?.count || 0;
    if (exceptionCount > 0) {
      console.info(`[Cron] ${exceptionCount} clientes mantiveram o status devido a próximo contato agendado`);
    }
  } catch (error) {
    console.error('[Cron] Erro no reset semanal de status de contato:', error);
  }
});

console.info('[Cron] Reset semanal de status de contato agendado (toda segunda-feira às 00:00)');


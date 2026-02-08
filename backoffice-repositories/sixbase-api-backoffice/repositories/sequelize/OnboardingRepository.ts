import { QueryTypes } from 'sequelize';
const models = require('../../database/models');

import {
  FindOnboardingPaginatedParams,
  FindOnboardingDailyCountsParams,
  OnboardingData,
  OnboardingDailyCount,
} from '../../interfaces/onboarding.interface';

export default class OnboardingRepository {

  static async findOnboardingPaginatedWithSQL({
    input,
    user_type,
    start_date,
    end_date,
    page,
    size,
  }: FindOnboardingPaginatedParams): Promise<{ count: number; rows: OnboardingData[] }> {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const replacements: any = { offset, limit };
      let where = `WHERE 1=1`;

      if (start_date && end_date) {
        where += ` AND fup.completed_at BETWEEN :start_date AND :end_date`;
        replacements.start_date = start_date;
        replacements.end_date = end_date;
      }

      if (user_type === 'creator') where += ` AND fup.form_type = 2`;
      if (user_type === 'marca') where += ` AND fup.form_type = 3`;

      if (input?.trim()) {
        replacements.input = `%${input.toLowerCase()}%`;
        where += `
          AND (
            LOWER(u.full_name) LIKE :input OR
            LOWER(u.email) LIKE :input OR
            u.document_number LIKE :input
          )
        `;
      }

      const sql = `
        SELECT 
          fup.id_user,
          fup.id_form,
          fup.form_type,
          fup.form_version,
          fup.answers AS form_answers,
          fup.completed_at AS created_at,
          f.title AS form_title,
          u.uuid,
          u.full_name,
          u.email,
          u.instagram,
          u.tiktok,
          u.document_number
        FROM form_user_profiles fup
        INNER JOIN users u ON u.id = fup.id_user
        LEFT JOIN forms f ON f.id = fup.id_form
        ${where}
        ORDER BY fup.completed_at DESC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(*) AS count
        FROM form_user_profiles fup
        INNER JOIN users u ON u.id = fup.id_user
        ${where}
      `;

      const countRes = await models.sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      });

      const formattedRows: OnboardingData[] = (rows as any[]).map((r) => ({
        created_at: r.created_at,
        user_type: r.form_type === 2 ? 'creator' : 'marca',
        form_answers: r.form_answers ?? {},
        user: {
          uuid: r.uuid,
          full_name: r.full_name,
          email: r.email,
          instagram: r.instagram,
          tiktok: r.tiktok,
          document_number: r.document_number,
        },
        form: {
          id: r.id_form,
          title: r.form_title,
          version: r.form_version,
          form_type: r.form_type,
        },
      }));

      return {
        count: Number(countRes?.count ?? 0),
        rows: formattedRows,
      };
    } catch (error) {
      console.error('Erro ao buscar onboarding via nova estrutura:', error);
      throw error;
    }
  }

  static async findOnboardingForExportWithSQL({
    input,
    user_type,
    start_date,
    end_date,
  }: Omit<FindOnboardingPaginatedParams, 'page' | 'size'>): Promise<OnboardingData[]> {
    try {
      const replacements: any = {};
      let where = `WHERE 1=1`;

      if (start_date && end_date) {
        where += ` AND fup.completed_at BETWEEN :start_date AND :end_date`;
        replacements.start_date = start_date;
        replacements.end_date = end_date;
      }

      if (user_type === 'creator') where += ` AND fup.form_type = 2`;
      if (user_type === 'marca') where += ` AND fup.form_type = 3`;

      if (input?.trim()) {
        replacements.input = `%${input.toLowerCase()}%`;
        where += `
          AND (
            LOWER(u.full_name) LIKE :input OR
            LOWER(u.email) LIKE :input OR
            u.document_number LIKE :input
          )
        `;
      }

      const sql = `
        SELECT 
          fup.id_user,
          fup.id_form,
          fup.form_type,
          fup.form_version,
          fup.answers AS form_answers,
          fup.completed_at AS created_at,
          f.title AS form_title,
          u.uuid,
          u.full_name,
          u.email,
          u.instagram,
          u.tiktok,
          u.document_number
        FROM form_user_profiles fup
        INNER JOIN users u ON u.id = fup.id_user
        LEFT JOIN forms f ON f.id = fup.id_form
        ${where}
        ORDER BY fup.completed_at DESC
      `;

      const rows = await models.sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return (rows as any[]).map((r) => ({
        created_at: r.created_at,
        user_type: r.form_type === 2 ? 'creator' : 'marca',
        form_answers: r.form_answers ?? {},
        user: {
          uuid: r.uuid,
          full_name: r.full_name,
          email: r.email,
          instagram: r.instagram,
          tiktok: r.tiktok,
          document_number: r.document_number,
        },
        form: {
          id: r.id_form,
          title: r.form_title,
          version: r.form_version,
          form_type: r.form_type,
        },
      }));
    } catch (error) {
      console.error('Erro no export com nova estrutura:', error);
      throw error;
    }
  }

  static async findOnboardingPaginated() {
    throw new Error('Legacy onboarding removido. Use findOnboardingPaginatedWithSQL.');
  }

  static async findOnboardingForExport() {
    throw new Error('Legacy onboarding removido. Use findOnboardingForExportWithSQL.');
  }

  static async findOnboardingDailyCounts({
    start_date,
    end_date,
    user_type,
    creator_version,
    marca_version,
  }: FindOnboardingDailyCountsParams): Promise<OnboardingDailyCount[]> {
    try {
      const replacements: any = {};
      let where = `WHERE 1=1`;

      if (start_date && end_date) {
        where += ` AND completed_at BETWEEN :start_date AND :end_date`;
        replacements.start_date = start_date;
        replacements.end_date = end_date;
      }

      if (creator_version !== undefined)
        where += ` AND (form_type != 2 OR form_version = :creator_version)`,
          replacements.creator_version = creator_version;

      if (marca_version !== undefined)
        where += ` AND (form_type != 3 OR form_version = :marca_version)`,
          replacements.marca_version = marca_version;

      if (user_type === 'creator') where += ` AND form_type = 2`;
      if (user_type === 'marca') where += ` AND form_type = 3`;

      const sql = `
        SELECT 
          DATE(completed_at) AS date,
          SUM(CASE WHEN form_type = 2 THEN 1 ELSE 0 END) AS creator,
          SUM(CASE WHEN form_type = 3 THEN 1 ELSE 0 END) AS marca,
          COUNT(*) AS total
        FROM form_user_profiles
        ${where}
        GROUP BY DATE(completed_at)
        ORDER BY date
      `;

      return await models.sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      console.error('Erro ao gerar daily counts (nova estrutura):', error);
      throw error;
    }
  }

  static async findVersionCombinations({ start_date, end_date }) {
    try {
      const replacements: any = {};
      let where = `WHERE 1=1`;

      if (start_date && end_date) {
        where += ` AND completed_at BETWEEN :start_date AND :end_date`;
        replacements.start_date = start_date;
        replacements.end_date = end_date;
      }

      const sql = `
        SELECT 
          form_type,
          form_version,
          COUNT(*) AS count
        FROM form_user_profiles
        ${where}
        GROUP BY form_type, form_version
        ORDER BY count DESC
      `;

      const rows = await models.sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return (rows as any[]).map((r) => ({
        creator_version: r.form_type === 2 ? r.form_version : null,
        marca_version: r.form_type === 3 ? r.form_version : null,
        label:
          r.form_type === 2
            ? `v${r.form_version} Creator`
            : `v${r.form_version} Marca`,
        count: r.count,
      }));
    } catch (error) {
      console.error('Erro ao buscar combinações de versões:', error);
      throw error;
    }
  }
}
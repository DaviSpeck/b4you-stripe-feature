import { QueryTypes } from 'sequelize';
const models = require('../../database/models');

import {
  FindOnboardingPaginatedInput,
  FindOnboardingPaginatedResult,
  OnboardingData,
  OnboardingFormData,
  OnboardingUserData,
} from '../../interfaces/onboarding.interface';

export default class FindOnboardingPaginated {
  private input?: string;
  private user_type?: string;
  private start_date?: string;
  private end_date?: string;
  private page: number;
  private size: number;
  private creator_version?: number;
  private marca_version?: number;

  constructor({
    input,
    user_type,
    start_date,
    end_date,
    page,
    size,
    creator_version,
    marca_version,
  }: FindOnboardingPaginatedInput) {
    this.input = input;
    this.user_type = user_type;
    this.start_date = start_date;
    this.end_date = end_date;
    this.page = page;
    this.size = size;
    this.creator_version = creator_version;
    this.marca_version = marca_version;
  }

  async execute(): Promise<FindOnboardingPaginatedResult> {
    throw new Error('Onboarding legacy removido. Use executeWithSQL().');
  }

  async executeWithSQL(): Promise<FindOnboardingPaginatedResult> {
    try {
      const offset = Number(this.page) * Number(this.size);
      const limit = Number(this.size);

      const replacements: Record<string, any> = { offset, limit };
      let where = `WHERE 1=1`;

      if (this.start_date && this.end_date) {
        where += ` AND fup.completed_at BETWEEN :start_date AND :end_date`;
        replacements.start_date = this.start_date;
        replacements.end_date = this.end_date;
      }

      if (this.user_type === 'creator') where += ` AND fup.form_type = 2`;
      if (this.user_type === 'marca') where += ` AND fup.form_type = 3`;

      if (this.input?.trim()) {
        const trimmed = this.input.trim().toLowerCase();
        const sanitized = trimmed.replace(/[^\d]/g, '');

        replacements.input = `%${trimmed}%`;
        if (sanitized.length > 0) replacements.doc = `%${sanitized}%`;

        where += `
          AND (
            LOWER(u.full_name) LIKE :input OR
            LOWER(u.email) LIKE :input
            ${sanitized.length > 0 ? ' OR u.document_number LIKE :doc' : ''}
          )
        `;
      }

      if (this.creator_version !== undefined) {
        replacements.creator_version = this.creator_version;
        where += ` AND (fup.form_type != 2 OR fup.form_version = :creator_version)`;
      }

      if (this.marca_version !== undefined) {
        replacements.marca_version = this.marca_version;
        where += ` AND (fup.form_type != 3 OR fup.form_version = :marca_version)`;
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

      const formattedRows: OnboardingData[] = (rows as any[]).map((row) => {
        const userType =
          row.form_type === 2
            ? 'creator'
            : row.form_type === 3
              ? 'marca'
              : '';

        const form: OnboardingFormData = {
          id: row.id_form,
          title: row.form_title,
          version: row.form_version,
          form_type: row.form_type,
        };

        const user: OnboardingUserData = {
          uuid: row.uuid,
          full_name: row.full_name,
          email: row.email,
          instagram: row.instagram,
          tiktok: row.tiktok,
          document_number: row.document_number,
        };

        return {
          created_at: row.created_at,
          user_type: userType,
          form_answers: row.form_answers ?? {},
          form,
          user,
        };
      });

      return {
        count: Number(countRes?.count ?? 0),
        rows: formattedRows,
      };
    } catch (error) {
      console.error('Erro ao buscar onboarding (nova estrutura):', error);
      throw error;
    }
  }
}
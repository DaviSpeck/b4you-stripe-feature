import { QueryTypes } from 'sequelize';
const models = require('../../database/models');

import {
  FindOnboardingForExportInput,
  FindOnboardingForExportResult,
  OnboardingData,
  OnboardingUserData,
} from '../../interfaces/onboarding.interface';

export default class FindOnboardingForExport {
  private input?: string;
  private user_type?: string;
  private start_date?: string;
  private end_date?: string;

  constructor({
    input,
    user_type,
    start_date,
    end_date,
  }: FindOnboardingForExportInput) {
    this.input = input;
    this.user_type = user_type;
    this.start_date = start_date;
    this.end_date = end_date;
  }

  async execute(): Promise<FindOnboardingForExportResult> {
    throw new Error('Onboarding legacy removido. Use executeWithSQL().');
  }

  async executeWithSQL(): Promise<FindOnboardingForExportResult> {
    try {
      const replacements: Record<string, any> = {};
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
            ${sanitized.length > 0 ? ` OR u.document_number LIKE :doc` : ''}
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

      const formattedRows: OnboardingData[] = (rows as any[]).map((row) => {
        const userType =
          row.form_type === 2
            ? 'creator'
            : row.form_type === 3
              ? 'marca'
              : '';

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
          user,
          form: {
            id: row.id_form,
            title: row.form_title,
            version: row.form_version,
            form_type: row.form_type,
          },
        };
      });

      return { rows: formattedRows };
    } catch (error) {
      console.error('Erro ao exportar onboarding (nova estrutura):', error);
      throw error;
    }
  }
}
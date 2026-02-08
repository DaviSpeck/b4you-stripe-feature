import { Op } from 'sequelize';
const db = require('../../database/models');
const { forms, form_questions, form_answers } = db.sequelize.models;
import {
  FormSummary,
  FormDetail,
  FormLog,
  FormLogsResponse,
} from '../../interfaces/forms.interface';

interface ListFormsParams {
  page?: number;
  size?: number;
  form_type?: number;
  is_active?: boolean;
}

interface CreateFormDraftParams {
  form_type: number;
  title: string;
}

interface UpdateFormMetadataParams {
  title?: string;
  form_type?: number;
  is_active?: boolean;
}

interface CreateQuestionParams {
  key: string;
  label: string;
  type: string;
  options?: any;
  required?: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
}

interface UpdateQuestionParams {
  label?: string;
  type?: string;
  options?: any;
  required?: boolean;
  order?: number;
  visible_if?: any;
  is_active?: boolean;
  help_text?: string;
  placeholder?: string;
}

interface ReorderQuestionsParams {
  questionId: number;
  order: number;
}

interface GetFormLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  event_type?: string;
  start_date?: string;
  end_date?: string;
}

export default class FormsRepository {
  static async listForms({
    page = 0,
    size = 20,
    form_type,
    is_active,
  }: ListFormsParams): Promise<{ count: number; rows: FormSummary[] }> {
    const where: any = {};
    if (form_type) where.form_type = form_type;
    if (typeof is_active === 'boolean') where.is_active = is_active;

    const { count, rows } = await forms.findAndCountAll({
      where,
      offset: page * size,
      limit: size,
      order: [['updated_at', 'DESC']],
    });

    const formsWithAnswersCount = await Promise.all(
      (rows as any[]).map(async (form) => {
        const answersCount = await form_answers.count({
          where: { id_form: form.id },
        });
        return {
          ...form.toJSON(),
          answers_count: answersCount,
        };
      }),
    );

    return { count, rows: formsWithAnswersCount as any };
  }

  static async getFormById(id: number): Promise<FormDetail | null> {
    return forms.findByPk(id, {
      include: [
        {
          model: form_questions,
          as: 'questions',
          required: false,
          separate: true,
          order: [['order', 'ASC']],
        },
      ],
    }) as any;
  }

  static async createFormDraft(
    { form_type, title }: CreateFormDraftParams,
    userId?: number,
  ): Promise<any> {
    const latest = await forms.findOne({
      where: { form_type },
      order: [['version', 'DESC']],
    });
    const nextVersion = latest ? latest.version + 1 : 1;

    const form = await forms.create({
      form_type,
      title,
      version: nextVersion,
      is_active: false,
    });
    return form;
  }

  static async updateFormMetadata(
    id: number,
    payload: UpdateFormMetadataParams,
    userId?: number,
  ): Promise<any | null> {
    const t = await db.sequelize.transaction();
    try {
      const form = await forms.findByPk(id, { transaction: t });
      if (!form) {
        await t.rollback();
        return null;
      }

      if (
        payload.form_type !== undefined &&
        payload.form_type !== form.form_type
      ) {
        const answersCount = await form_answers.count({
          where: { id_form: id },
          transaction: t,
        });

        if (answersCount > 0) {
          await t.rollback();
          throw new Error(
            `Não é possível alterar o tipo deste formulário pois ele possui ${answersCount} resposta(s) registrada(s).`,
          );
        }
      }

      const targetFormType = payload.form_type ?? form.form_type;
      const willBeActive = payload.is_active ?? form.is_active;

      if (willBeActive === true && targetFormType) {
        await forms.update(
          { is_active: false },
          {
            where: {
              form_type: targetFormType,
              id: { [Op.ne]: id },
              is_active: true,
            },
            transaction: t,
          },
        );
      }

      await form.update(payload, { transaction: t });
      await t.commit();
      return form;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async getFormAnswersCount(id: number): Promise<number> {
    return form_answers.count({
      where: { id_form: id },
    });
  }

  static async deactivateForm(id: number, userId?: number): Promise<void> {
    const form = await forms.findByPk(id);
    if (!form) return;

    const answersCount = await this.getFormAnswersCount(id);
    if (answersCount > 0) {
      throw new Error(
        `Não é possível excluir este formulário pois ele possui ${answersCount} resposta(s) registrada(s).`,
      );
    }

    await form.update({ is_active: false });
  }

  static async createQuestion(
    idForm: number,
    payload: CreateQuestionParams,
    userId?: number,
  ): Promise<any> {
    const currentMax = await form_questions.max('order', {
      where: { id_form: idForm },
    });
    const order =
      typeof payload.order === 'number'
        ? payload.order
        : Number.isFinite(currentMax)
        ? (currentMax as number) + 1
        : 0;
    const q = await form_questions.create({
      ...payload,
      id_form: idForm,
      order,
    });
    return q;
  }

  static async updateQuestion(
    id: number,
    payload: UpdateQuestionParams,
    userId?: number,
  ): Promise<any | null> {
    const q = await form_questions.findByPk(id);
    if (!q) return null;
    await q.update(payload);
    return q;
  }

  static async deactivateQuestion(id: number, userId?: number): Promise<void> {
    const q = await form_questions.findByPk(id);
    if (!q) return;
    await q.update({ is_active: false });
  }

  static async publishFormVersion(
    id: number,
    userId?: number,
  ): Promise<any | null> {
    const t = await db.sequelize.transaction();
    try {
      const current = await forms.findByPk(id, { transaction: t });
      if (!current) {
        await t.rollback();
        return null;
      }

      const latest = await forms.findOne({
        where: { form_type: current.form_type },
        order: [['version', 'DESC']],
        transaction: t,
      });
      const nextVersion = latest ? Number(latest.version || 0) + 1 : 1;

      const newForm = await forms.create(
        {
          form_type: current.form_type,
          title: current.title,
          version: nextVersion,
          is_active: true,
        },
        { transaction: t },
      );

      const existingQuestions = await form_questions.findAll({
        where: { id_form: current.id },
        order: [['order', 'ASC']],
        transaction: t,
      });

      if (existingQuestions && existingQuestions.length) {
        const payloads = existingQuestions.map((q: any) => ({
          id_form: newForm.id,
          key: q.key,
          label: q.label,
          type: q.type,
          options: q.options,
          required: q.required,
          order: q.order,
          visible_if: q.visible_if,
          is_active: q.is_active,
          help_text: q.help_text,
          placeholder: q.placeholder,
        }));
        await form_questions.bulkCreate(payloads, { transaction: t });
      }

      await forms.update(
        { is_active: false },
        {
          where: {
            form_type: current.form_type,
            id: { [Op.ne]: newForm.id },
          },
          transaction: t,
        },
      );

      await t.commit();
      return newForm;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async reorderQuestions(
    idForm: number,
    orders: ReorderQuestionsParams[],
    userId?: number,
  ): Promise<void> {
    const updates = orders.map(({ questionId, order }) =>
      form_questions.update(
        { order },
        { where: { id: questionId, id_form: idForm } },
      ),
    );
    await Promise.all(updates);
  }

  static async triggerV1Generation(userId?: number): Promise<{
    message: string;
  }> {
    return {
      message: 'Seed V1 disparado (placeholder). Integre com sixbase-api.',
    };
  }

  static async deleteForm(id: number): Promise<void> {
    await forms.destroy({ where: { id } });
  }

  static async getFormLogs(
    formId: number,
    {
      page = 1,
      limit = 10,
      search = '',
      event_type = null,
      start_date = null,
      end_date = null,
    }: GetFormLogsParams,
  ): Promise<FormLogsResponse> {
    const { Op } = require('sequelize');
    const Logs_backoffice = require('../../database/models/Logs_backoffice');
    const Users_backoffice = require('../../database/models/Users_backoffice');
    const { findUserEventTypeByKey } = require('../../types/userEvents');
    const dateHelper = require('../../utils/helpers/date');

    const offset = (page - 1) * limit;

    const formEventIds = [38, 39, 40, 41, 42, 43, 44, 45, 46, 47];

    const whereClause: any = {
      id_event: { [Op.in]: formEventIds },
    };

    if (event_type) {
      const event = findUserEventTypeByKey(event_type);
      if (event && formEventIds.includes(event.id)) {
        whereClause.id_event = event.id;
      }
    }

    const { count: totalCount, rows: allLogs } =
      await Logs_backoffice.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Users_backoffice,
            as: 'user',
            attributes: ['id', 'full_name', 'email'],
            required: false,
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
        order: [['created_at', 'DESC']],
      });

    let filteredLogs = allLogs.filter((log: any) => {
      if (!log.params) return false;
      const params =
        typeof log.params === 'string' ? JSON.parse(log.params) : log.params;
      const logFormId = params.form_id || params.id_form;
      return logFormId === formId || Number(logFormId) === Number(formId);
    });

    if (start_date || end_date) {
      filteredLogs = filteredLogs.filter((log: any) => {
        const logDate = new Date(log.created_at);
        if (start_date && end_date) {
          const startDate = dateHelper(start_date)
            .startOf('day')
            .utc()
            .toDate();
          const endDate = dateHelper(end_date).endOf('day').utc().toDate();
          return logDate >= startDate && logDate <= endDate;
        } else if (start_date) {
          const startDate = dateHelper(start_date)
            .startOf('day')
            .utc()
            .toDate();
          return logDate >= startDate;
        } else if (end_date) {
          const endDate = dateHelper(end_date).endOf('day').utc().toDate();
          return logDate <= endDate;
        }
        return true;
      });
    }

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter((log: any) => {
        if (!log.user) return false;
        const userName = (log.user.full_name || '').toLowerCase();
        const userEmail = (log.user.email || '').toLowerCase();
        return (
          userName.includes(searchLower) || userEmail.includes(searchLower)
        );
      });
    }

    const paginatedLogs = filteredLogs.slice(
      offset,
      offset + parseInt(String(limit)),
    );
    const count = filteredLogs.length;
    const logs = paginatedLogs;

    const formEvents = [
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

    const logsWithEventInfo: FormLog[] = logs.map((log: any) => {
      const foundEvent = formEvents.find((event) => event.id === log.id_event);
      const eventInfo = foundEvent || {
        label: 'Evento não encontrado',
        key: 'unknown',
      };

      let idForm = log.id_form;
      if (!idForm && log.params) {
        idForm = log.params.form_id || log.params.id_form || null;
      }

      return {
        ...log.toJSON(),
        id: log.id,
        id_user_backoffice: log.id_user_backoffice,
        id_form: idForm || formId,
        id_event: log.id_event,
        params: log.params,
        ip_address: log.ip_address,
        created_at: log.created_at,
        event_label: eventInfo.label,
        event_key: eventInfo.key,
        event: foundEvent
          ? {
              id: foundEvent.id,
              name: foundEvent.label,
              description: foundEvent.label,
            }
          : undefined,
        user: log.user
          ? {
              id: log.user.id,
              full_name: log.user.full_name,
              email: log.user.email,
            }
          : undefined,
      };
    });

    const totalPages = Math.ceil(count / limit);

    return {
      logs: logsWithEventInfo,
      pagination: {
        currentPage: parseInt(String(page)),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(String(limit)),
      },
    };
  }
}

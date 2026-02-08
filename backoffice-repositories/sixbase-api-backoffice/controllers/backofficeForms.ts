import { Request, Response, NextFunction } from 'express';
import ApiError from '../error/ApiError';
import validateDto from '../middlewares/validate-dto';
import {
  listFormsSchema,
  createFormSchema,
  updateFormSchema,
  createQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
  publishFormSchema,
} from '../schemas/forms';
import FormsRepository from '../repositories/sequelize/FormsRepository';
import { createLogBackoffice } from '../database/controllers/logs_backoffice';
import { findUserEventTypeByKey } from '../types/userEvents';
import {
  FormsRequest,
  FormRequest,
  FormLogsRequest,
  CreateFormBody,
  UpdateFormBody,
  CreateQuestionBody,
  UpdateQuestionBody,
  ReorderQuestionsBody,
  PublishFormBody,
} from '../interfaces/forms.interface';

const withValidation = (
  schema: any,
  path: 'body' | 'query' | 'params',
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => [
    validateDto(schema, path),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await handler(req, res, next);
      } catch (error) {
        next(
          ApiError.internalservererror(
            `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
            error,
          ),
        );
      }
    },
  ];

export const listForms = withValidation(
  listFormsSchema,
  'query',
  async (req: FormsRequest, res: Response): Promise<void> => {
    const { page, size, form_type, is_active } = req.query;

    const result = await FormsRepository.listForms({
      page,
      size,
      form_type,
      is_active,
    });

    res.json(result);
    return;
  },
);

export const getFormById = async (
  req: FormRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const form = await FormsRepository.getFormById(Number(id));

    if (!form) {
      res.status(404).json({ message: 'Formulário não encontrado' });
      return;
    }

    res.json(form);
    return;
  } catch (error) {
    next(
      ApiError.internalservererror(
        `Internal Server Error, GET: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const createFormDraft = withValidation(
  createFormSchema,
  'body',
  async (
    req: Request<{}, {}, CreateFormBody>,
    res: Response,
  ): Promise<void> => {
    const payload = req.body;

    const form = await FormsRepository.createFormDraft(
      payload,
      (req as any).user?.id,
    );

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('form-create').id,
      params: {
        form_id: form.id,
        form_title: form.title,
        form_type: form.form_type,
      },
      ip_address,
    });

    res.status(201).json(form);
    return;
  },
);

export const updateFormMetadata = withValidation(
  updateFormSchema,
  'body',
  async (
    req: Request<{ id: string }, {}, UpdateFormBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const oldForm = await FormsRepository.getFormById(Number(id));
      if (!oldForm) {
        res.status(404).json({ message: 'Formulário não encontrado' });
        return;
      }

      const form = await FormsRepository.updateFormMetadata(
        Number(id),
        payload,
        (req as any).user?.id,
      );

      if (!form) {
        res.status(404).json({ message: 'Formulário não encontrado' });
        return;
      }

      const ip_address =
        req.headers['x-forwarded-for'] ||
        (req.socket as any).remoteAddress ||
        'unknown';

      const logParams: Record<string, any> = {
        form_id: form.id,
        form_title: form.title,
      };

      if (payload.title && oldForm.title !== payload.title) {
        logParams.old_title = oldForm.title;
        logParams.new_title = payload.title;
      }

      if (
        payload.form_type !== undefined &&
        oldForm.form_type !== payload.form_type
      ) {
        logParams.old_form_type = oldForm.form_type;
        logParams.new_form_type = payload.form_type;
      }

      if (
        payload.is_active !== undefined &&
        oldForm.is_active !== payload.is_active
      ) {
        logParams.old_is_active = oldForm.is_active;
        logParams.new_is_active = payload.is_active;

        const eventKey = payload.is_active
          ? 'form-activate'
          : 'form-deactivate';

        await createLogBackoffice({
          id_user_backoffice: (req as any).user?.id,
          id_event: findUserEventTypeByKey(eventKey).id,
          params: logParams,
          ip_address,
        });
      } else {
        await createLogBackoffice({
          id_user_backoffice: (req as any).user?.id,
          id_event: findUserEventTypeByKey('form-update').id,
          params: logParams,
          ip_address,
        });
      }

      res.json(form);
      return;
    } catch (error: any) {
      if (error.message && error.message.includes('resposta')) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  },
);

export const deleteForm = async (
  req: FormRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const form = await FormsRepository.getFormById(Number(id));

    if (!form) {
      res.status(404).json({ message: 'Formulário não encontrado' });
      return;
    }

    await FormsRepository.deactivateForm(Number(id), (req as any).user?.id);

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('form-delete').id,
      params: {
        form_id: form.id,
        form_title: form.title,
        form_type: form.form_type,
      },
      ip_address,
    });

    res.status(204).end();
    return;
  } catch (error: any) {
    if (error.message && error.message.includes('resposta')) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(
      ApiError.internalservererror(
        `Internal Server Error, DELETE: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const createQuestion = withValidation(
  createQuestionSchema,
  'body',
  async (
    req: Request<{ id: string }, {}, CreateQuestionBody>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;

    const question = await FormsRepository.createQuestion(
      Number(id),
      req.body,
      (req as any).user?.id,
    );

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('question-create').id,
      params: {
        form_id: Number(id),
        question_id: question.id,
        question_label: question.label,
        question_key: question.key,
        question_type: question.type,
      },
      ip_address,
    });

    res.status(201).json(question);
    return;
  },
);

export const updateQuestion = withValidation(
  updateQuestionSchema,
  'body',
  async (
    req: Request<{ id: string }, {}, UpdateQuestionBody>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;

    const db = require('../database/models');
    const { form_questions } = db.sequelize.models;

    const oldQuestion = await form_questions.findByPk(Number(id));
    if (!oldQuestion) {
      res.status(404).json({ message: 'Pergunta não encontrada' });
      return;
    }

    const question = await FormsRepository.updateQuestion(
      Number(id),
      req.body,
      (req as any).user?.id,
    );

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    const logParams: Record<string, any> = {
      form_id: question.id_form,
      question_id: question.id,
      question_label: question.label,
      question_key: question.key,
    };

    if (req.body.label && oldQuestion.label !== req.body.label) {
      logParams.old_label = oldQuestion.label;
      logParams.new_label = req.body.label;
    }

    if (req.body.type && oldQuestion.type !== req.body.type) {
      logParams.old_type = oldQuestion.type;
      logParams.new_type = req.body.type;
    }

    if (req.body.options !== undefined) {
      logParams.old_options = oldQuestion.options;
      logParams.new_options = req.body.options;
    }

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('question-update').id,
      params: logParams,
      ip_address,
    });

    res.json(question);
    return;
  },
);

export const deactivateQuestion = async (
  req: FormRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const db = require('../database/models');
    const { form_questions } = db.sequelize.models;

    const question = await form_questions.findByPk(Number(id));
    if (!question) {
      res.status(404).json({ message: 'Pergunta não encontrada' });
      return;
    }

    await FormsRepository.deactivateQuestion(
      Number(id),
      (req as any).user?.id,
    );

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('question-delete').id,
      params: {
        form_id: question.id_form,
        question_id: question.id,
        question_label: question.label,
        question_key: question.key,
      },
      ip_address,
    });

    res.status(204).end();
    return;
  } catch (error) {
    next(
      ApiError.internalservererror(
        `Internal Server Error, DELETE question: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const publishFormVersion = withValidation(
  publishFormSchema,
  'body',
  async (
    req: Request<{ id: string }, {}, PublishFormBody>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;

    const result = await FormsRepository.publishFormVersion(
      Number(id),
      (req as any).user?.id,
    );

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('form-publish').id,
      params: {
        form_id: result.id,
        form_title: result.title,
        version: result.version,
      },
      ip_address,
    });

    res.json(result);
    return;
  },
);

export const reorderQuestions = withValidation(
  reorderQuestionsSchema,
  'body',
  async (
    req: Request<{ id: string }, {}, ReorderQuestionsBody>,
    res: Response,
  ): Promise<void> => {
    const formId = Number(req.params.id);

    await FormsRepository.reorderQuestions(
      formId,
      req.body.orders,
      (req as any).user?.id,
    );

    const ip_address =
      req.headers['x-forwarded-for'] ||
      (req.socket as any).remoteAddress ||
      'unknown';

    await createLogBackoffice({
      id_user_backoffice: (req as any).user?.id,
      id_event: findUserEventTypeByKey('question-reorder').id,
      params: {
        form_id: formId,
        orders: req.body.orders,
      },
      ip_address,
    });

    res.status(204).end();
    return;
  },
);

export const triggerV1Generation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await FormsRepository.triggerV1Generation(
      (req as any).user?.id,
    );

    res.json({ success: true, ...result });
    return;
  } catch (error) {
    next(
      ApiError.internalservererror(
        `Internal Server Error, TRIGGER: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getFormLogs = async (
  req: FormLogsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page, limit, search, event_type, start_date, end_date } =
      req.query;

    const result = await FormsRepository.getFormLogs(Number(id), {
      page: page || 1,
      limit: limit || 10,
      search: search || '',
      event_type: event_type || null,
      start_date: start_date || null,
      end_date: end_date || null,
    });

    res.json({
      success: true,
      data: result,
    });
    return;
  } catch (error) {
    next(
      ApiError.internalservererror(
        `Internal Server Error, GET: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
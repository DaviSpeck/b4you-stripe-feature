const db = require('../../database/models');
const ApiError = require('../../error/ApiError');

const typeMap = {
  personalizado: 1,
  custom: 1,
  creator: 2,
  creators: 2,
  afiliado: 2,
  affiliate: 2,
  marca: 3,
  brand: 3,
  brands: 3,
};

module.exports = {
  async getActiveForm(req, res, next) {
    try {
      const { user_type } = req.params;
      const typeId = Number.isNaN(Number(user_type))
        ? typeMap[String(user_type).toLowerCase()] || null
        : Number(user_type);

      if (!typeId) return res.status(404).json({ message: 'Tipo inválido' });

      const { forms, form_questions } = db.sequelize.models;
      let form = await forms.findOne({
        where: { form_type: typeId, is_active: true },
        order: [['version', 'DESC']],
        include: [
          {
            model: form_questions,
            as: 'questions',
            required: false,
            where: { is_active: true },
            separate: true,
            order: [['order', 'ASC']],
          },
        ],
      });

      if (!form) {
        form = await forms.findOne({
          where: { form_type: typeId },
          order: [['version', 'DESC']],
          include: [
            {
              model: form_questions,
              as: 'questions',
              required: false,
              where: { is_active: true },
              separate: true,
              order: [['order', 'ASC']],
            },
          ],
        });
      }

      if (!form)
        return res.status(404).json({ message: 'Form não encontrado' });
      return res.json(form);
    } catch (error) {
      return next(ApiError.internalservererror('Internal Server Error', error));
    }
  },

  async submitAnswers(req, res, next) {
    const t = await db.sequelize.transaction();

    try {
      const { id_form, answers } = req.body || {};
      if (!id_form || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Payload inválido" });
      }

      const userId = req?.user?.id || req?.session?.user?.id || null;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      const { form_answers, form_questions, forms, form_user_profiles } =
        db.sequelize.models;

      const now = new Date();

      const submittingForm = await forms.findByPk(id_form, { transaction: t });
      if (!submittingForm) {
        return res.status(404).json({ message: "Formulário não encontrado" });
      }

      const previousForms = await form_answers.findAll({
        where: { id_user: userId },
        attributes: ["id_form"],
        group: ["id_form"],
        transaction: t,
      });

      const answeredForms = previousForms.map((r) => r.id_form);

      if (answeredForms.length > 0) {
        if (!answeredForms.includes(id_form)) {
          await t.rollback();
          return res.status(400).json({
            message: "O usuário já respondeu outro formulário de onboarding.",
          });
        }

        await form_answers.destroy({
          where: { id_user: userId, id_form },
          transaction: t,
        });
      }

      const validQuestions = await form_questions.findAll({
        where: { id_form, is_active: true },
        transaction: t,
      });

      const validKeys = new Set(validQuestions.map((q) => q.key));

      const sanitizedAnswers = answers
        .filter((a) => validKeys.has(a.key))
        .map(({ key, value }) => ({
          id_user: userId,
          id_form,
          key,
          value:
            typeof value === "object"
              ? JSON.stringify(value)
              : String(value ?? ""),
          created_at: now,
          updated_at: now,
        }));

      if (sanitizedAnswers.length === 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Nenhuma resposta válida enviada." });
      }

      await form_answers.bulkCreate(sanitizedAnswers, { transaction: t });

      const answerMap = {};
      for (const a of sanitizedAnswers) {
        try {
          answerMap[a.key] = JSON.parse(a.value);
        } catch {
          answerMap[a.key] = a.value;
        }
      }

      const summary = {
        nicho: answerMap.nicho ?? null,
        faturamento: answerMap.faixa_faturamento ?? null,
        criado_em: now.toISOString(),
      };

      await form_user_profiles.upsert(
        {
          id_user: userId,
          id_form,
          form_type: submittingForm.form_type,
          form_version: submittingForm.version,
          answers: answerMap,
          summary,
          completed_at: now,
          updated_at: now,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json({ success: true });

    } catch (error) {
      await t.rollback();
      return next(ApiError.internalservererror("Internal Server Error", error));
    }
  }
};

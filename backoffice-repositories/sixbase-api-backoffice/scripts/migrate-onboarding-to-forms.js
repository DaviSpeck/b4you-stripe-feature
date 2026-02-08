const db = require('./shared/database-init');

const BATCH_SIZE = 500;
const PARALLEL_BATCHES = 4;

/* ========================================================================== */
/*                                CLEANUP                                      */
/* ========================================================================== */

async function clearFormsData() {
  console.log('\n🧹 Limpando tabelas...');

  const models = db.models;

  const Forms = models.forms;
  const FormQuestions = models.form_questions;
  const FormAnswers = models.form_answers;
  const FormUserProfiles = models.form_user_profiles;

  await FormUserProfiles.destroy({ where: {}, force: true });
  await FormAnswers.destroy({ where: {}, force: true });
  await FormQuestions.destroy({ where: {}, force: true });
  await Forms.destroy({ where: {}, force: true });

  console.log('✔ Limpeza concluída.');
}

/* ========================================================================== */
/*                         FORM STRUCTURE (ONLY CREATOR/MARCA)                */
/* ========================================================================== */

const FORM_STRUCTURE = {
  creator: {
    form_type: 2,
    title: 'Formulário Creator',
    version: 1,
    questions: [
      {
        key: 'has_experience_as_creator_or_affiliate',
        label: 'Já teve experiência como creators ou afiliados?',
        type: 'select',
        order: 1,
        options: ['Sim, como Creator', 'Sim, como Afiliado', 'Não'],
      },

      {
        key: 'nicho',
        label: 'Com quais nichos você se identifica?',
        type: 'multiselect',
        order: 2,
        options: [
          'Moda', 'Saúde e Fitness', 'Beleza', 'Casa e Acessórios',
          'Comida e Bebida', 'Viagem', 'Eletrodomésticos', 'Tecnologia',
          'Esportes', 'Jogos', 'Pet', 'Infantil', 'Adulto', 'Outros'
        ],
      },

      {
        key: 'nicho_other',
        label: 'Qual?',
        type: 'text',
        order: 2.1,
        visible_if: { nicho: 'Outros' },
      },

      {
        key: 'audience_size',
        label: 'Qual o tamanho da sua audiência (seguidores)?',
        type: 'select',
        order: 3,
        options: [
          'Até 5 mil',
          '5 a 20 mil',
          '50 a 100 mil',
          '100 a 200 mil',
          '500 a 1 milhão',
          '+1 milhão',
          'Ainda não possuo audiência',
        ],
      },

      { key: 'tiktok', label: 'Coloque o seu usuário ou link do TikTok', type: 'text', order: 4 },
      { key: 'instagram', label: 'Coloque o seu usuário ou link do Instagram', type: 'text', order: 5 },

      {
        key: 'origem',
        label: 'Como você descobriu a B4YOU?',
        type: 'select',
        order: 6,
        options: [
          'Por indicação', 'Pelo Matheus Mota', 'Perfil de alguém nas redes sociais',
          'Anúncios', 'TikTok', 'Instagram', 'Busca no Google', 'Escola Creator',
        ],
      },

      {
        key: 'origem_other',
        label: 'Qual?',
        type: 'text',
        order: 6.1,
        visible_if: { origem: 'Por indicação' },
      },
    ],
  },

  marca: {
    form_type: 3,
    title: 'Formulário Marca',
    version: 1,
    questions: [
      {
        key: 'business_model',
        label: 'Qual o seu modelo de negócio?',
        type: 'select',
        order: 1,
        options: ['Marca: Tenho uma marca própria (cosmético, suplemento, moda etc.).', 'E-commerce: Tenho uma loja virtual com vários produtos.', 'Infoproduto: Vendo cursos, mentorias ou treinamentos online.', 'Outro'],
      },

      {
        key: 'business_model_other',
        label: 'Qual?',
        type: 'text',
        order: 1.1,
        visible_if: { business_model: 'Outro' },
      },

      {
        key: 'worked_another_platform',
        label: 'Você já vende ou vendeu seu produto em alguma plataforma?',
        type: 'select',
        order: 2,
        options: ['Sim', 'Não'],
      },

      {
        key: 'origem',
        label: 'Como você descobriu a B4YOU? (marca)',
        type: 'select',
        order: 3,
        options: ['Anúncios', 'Pelo Matheus Mota', 'Por indicação', 'Instagram da B4You', 'Busca no Google'],
      },

      {
        key: 'origem_other',
        label: 'Em qual plataforma você visualizou?',
        type: 'select',
        order: 3.1,
        visible_if: { origem: 'Anúncios' },
        options: ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Google'],
      },

      {
        key: 'origem_other',
        label: 'Qual?',
        type: 'text',
        order: 3.1,
        visible_if: { origem: 'Por indicação' },
      },

      {
        key: 'revenue',
        label: 'Só pra eu entender o momento do seu negócio: qual faixa de faturamento mensal?',
        type: 'select',
        order: 4,
        options: [
          'Até R$ 10 mil / mês',
          'De R$ 10 mil a R$ 50 mil / mês',
          'De R$ 50 mil a R$ 200 mil / mês',
          'Acima de R$ 200 mil / mês',
          'Ainda não comecei a vender',
        ],
      },
    ],
  },
};

/* ========================================================================== */
/*                              VALUE MAPPINGS                                */
/* ========================================================================== */

const VALUE_MAPPINGS = {
  creator: {
    has_experience_as_creator_or_affiliate: {
      1: 'Sim, como Creator',
      2: 'Sim, como Afiliado',
      3: 'Não',
    },

    audience_size: {
      1: 'Até 5 mil',
      2: '5 a 20 mil',
      3: '50 a 100 mil',
      4: '100 a 200 mil',
      5: '500 a 1 milhão',
      6: '+1 milhão',
      7: 'Ainda não possuo audiência',
    },

    origem: {
      1: 'Por indicação',
      2: 'Pelo Matheus Mota',
      3: 'Perfil de alguém nas redes sociais',
      4: 'Anúncios',
      5: 'TikTok',
      6: 'Instagram',
      7: 'Busca no Google',
      8: 'Escola Creator',
    },
  },

  marca: {
    business_model: {
      1: 'Marca: Tenho uma marca própria (cosmético, suplemento, moda etc.).',
      2: 'E-commerce: Tenho uma loja virtual com vários produtos.',
      3: 'Infoproduto: Vendo cursos, mentorias ou treinamentos online.',
      4: 'Outro',
    },

    worked_another_platform: {
      1: 'Sim',
      2: 'Não',
    },

    origem: {
      1: 'Anúncios',
      2: 'Pelo Matheus Mota',
      4: 'Por indicação',
      6: 'Instagram da B4You',
      7: 'Busca no Google',
    },

    revenue: {
      1: 'Até R$ 10 mil / mês',
      2: 'De R$ 10 mil a R$ 50 mil / mês',
      4: 'De R$ 50 mil a R$ 200 mil / mês',
      6: 'Acima de R$ 200 mil / mês',
      7: 'Ainda não comecei a vender',
    },
  },

  shared: {
    nicho: {
      1: 'Moda', 2: 'Saúde e Fitness', 3: 'Beleza', 4: 'Casa e Acessórios',
      5: 'Comida e Bebida', 6: 'Viagem', 7: 'Eletrodomésticos',
      8: 'Tecnologia', 9: 'Esportes', 10: 'Jogos', 11: 'Pet',
      12: 'Infantil', 13: 'Adulto', 14: 'Outros',
    },
  },
};

/* ========================================================================== */
/*                          DEDUPLICAÇÃO                                      */
/* ========================================================================== */

async function getDedupedOnboarding(Onboarding) {
  console.log('📌 Carregando onboarding único por usuário...');

  const rows = await Onboarding.findAll({
    raw: true,
    attributes: { exclude: ['updated_at'] },
  });

  const map = new Map();

  for (const row of rows) {
    const existing = map.get(row.id_user);
    if (!existing || new Date(row.created_at) > new Date(existing.created_at)) {
      map.set(row.id_user, row);
    }
  }

  console.log(`✔ Deduplicação concluída. Sobrou ${map.size} usuários.`);
  return Array.from(map.values());
}

/* ========================================================================== */
/*                         VALUE CONVERSION                                   */
/* ========================================================================== */

function convertValue(key, value, userType) {
  if (value === null || value === undefined || value === '') return null;

  const mapping = VALUE_MAPPINGS[userType]?.[key] || VALUE_MAPPINGS.shared[key];
  if (!mapping) return String(value);

  if (typeof value === 'number') return mapping[value] || value;

  if (typeof value === 'string' && value.includes(',')) {
    return value
      .split(',')
      .map((v) => mapping[Number(v.trim())] || v.trim())
      .join(', ');
  }

  return mapping[value] || String(value);
}

/* ========================================================================== */
/*                                 MIGRATION                                  */
/* ========================================================================== */

async function migrateOnboardingToForms() {
  try {
    await db.initializeDatabase();

    await clearFormsData();

    const {
      forms: Forms,
      form_questions: FormQuestions,
      form_answers: FormAnswers,
      form_user_profiles: FormUserProfiles,
      onboarding: Onboarding,
    } = db.models;

    /* ---------------------------------------------------------------------- */
    /*                    1. Criar Forms e Perguntas                          */
    /* ---------------------------------------------------------------------- */

    const formIdMap = {};
    const questionsToCreate = [];

    for (const [type, config] of Object.entries(FORM_STRUCTURE)) {
      const form = await Forms.create({
        form_type: config.form_type,
        title: config.title,
        version: config.version,
        is_active: true,
      });

      formIdMap[type] = form.id;

      for (const q of config.questions) {
        questionsToCreate.push({
          id_form: form.id,
          key: q.key,
          label: q.label,
          type: q.type,
          options: q.options || null,
          order: q.order,
          required: true,
          visible_if: q.visible_if || null,
          is_active: true,
        });
      }
    }

    await FormQuestions.bulkCreate(questionsToCreate);

    /* ---------------------------------------------------------------------- */
    /*                2. Carregar onboarding sem duplicatas                   */
    /* ---------------------------------------------------------------------- */

    const onboardList = await getDedupedOnboarding(Onboarding);

    /* ---------------------------------------------------------------------- */
    /*                3. Processar em lotes                                   */
    /* ---------------------------------------------------------------------- */

    let migrated = 0;

    const makeBatch = (start) =>
      onboardList.slice(start, start + BATCH_SIZE);

    const processBatch = async (batch) => {
      const inserts = [];

      for (const record of batch) {
        const type = record.user_type;
        const config = FORM_STRUCTURE[type];

        if (!config) continue;

        const formId = formIdMap[type];

        for (const q of config.questions) {
          const raw = record[q.key];
          if (raw === null || raw === undefined || raw === '') continue;

          inserts.push({
            id_user: record.id_user,
            id_form: formId,
            key: q.key,
            value: String(convertValue(q.key, raw, type)),
            created_at: record.created_at,
            updated_at: record.created_at,
          });
        }
      }

      if (inserts.length === 0) return;

      await FormAnswers.bulkCreate(inserts, { ignoreDuplicates: true });

      const grouped = new Map();

      for (const row of inserts) {
        const key = `${row.id_user}:${row.id_form}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(row);
      }

      const profileRows = [];

      for (const [key, rows] of grouped.entries()) {
        const { id_user, id_form } = rows[0];

        const formKey = Object.entries(formIdMap).find(([, v]) => v === id_form)?.[0];
        const formConfig = FORM_STRUCTURE[formKey];

        const answerMap = {};
        for (const r of rows) answerMap[r.key] = r.value;

        const summary = {
          nicho: answerMap["nicho"] ?? null,
          origem: answerMap["origem"] ?? null,
          business_model: answerMap["business_model"] ?? null,
        };

        profileRows.push({
          id_user,
          id_form,
          form_type: formConfig.form_type,
          form_version: formConfig.version,
          answers: answerMap,
          summary,
          completed_at: rows[0].created_at,
          updated_at: rows[0].created_at,
        });
      }

      if (profileRows.length > 0) {
        await FormUserProfiles.bulkCreate(profileRows, {
          updateOnDuplicate: ['answers', 'summary', 'form_version', 'updated_at'],
        });
      }

      migrated += inserts.length;
    };

    let start = 0;
    while (start < onboardList.length) {
      const promises = [];

      for (let i = 0; i < PARALLEL_BATCHES && start < onboardList.length; i++) {
        const batch = makeBatch(start);
        start += BATCH_SIZE;
        promises.push(processBatch(batch));
      }

      await Promise.all(promises);
      console.log(`📈 Migradas até agora: ${migrated}`);
    }

    console.log('✔ Migração concluída!');
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    throw err;
  } finally {
    await db.closeDatabase();
  }
}

if (require.main === module) {
  migrateOnboardingToForms()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { migrateOnboardingToForms };
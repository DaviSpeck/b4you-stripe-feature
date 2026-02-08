/* eslint-disable no-console, no-await-in-loop */

const db = require('../database/models');

const CHUNK_SIZE = 100;
const PAUSE_MS = 200;
const MAX_RETRY = 1;

let shuttingDown = false;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const shutdown = async (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('\n[SHUTDOWN] Encerrando conexões com o banco...');
  try {
    await db.close();
  } catch (e) {
    console.error('[SHUTDOWN] Erro ao fechar conexões:', e.message);
  } finally {
    process.exit(code);
  }
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', async (err) => {
  console.error('[FATAL]', err);
  await shutdown(1);
});
process.on('unhandledRejection', async (err) => {
  console.error('[FATAL]', err);
  await shutdown(1);
});

const run = async () => {
  const {
    products: Products,
    membership_page_layouts: MembershipPageLayouts,
  } = db.sequelize.models;

  console.log('Iniciando migração de membership_page_layout...');

  const products = await Products.findAll({
    where: { content_delivery: 'membership' },
  });

  console.log(`Encontrados ${products.length} produtos.`);

  const getDefaultRowFields = (product) => ({
    version: '1.0',
    apply_membership_colors: product.apply_membership_colors || false,
    hex_color_membership_primary: product.hex_color_membership_primary || null,
    hex_color_membership_secondary: product.hex_color_membership_secondary || null,
    hex_color_membership_text: product.hex_color_membership_text || null,
    hex_color_membership_hover: product.hex_color_membership_hover || null,

    cover_custom: product.cover_custom || null,
    cover_custom_key: product.cover_custom_key || null,
    module_cover_format: product.module_cover_format || null,
    banner: product.banner || null,
    banner_key: product.banner_key || null,
    banner_mobile: product.banner_mobile || null,
    banner_mobile_key: product.banner_mobile_key || null,

    description_title: 'Sobre o Curso',
    description_use_product_description: true,
    description_content: '',
    description_show_stats: true,

    modules_title: 'Módulos do Curso',
    modules_show_progress: true,
    modules_layout: 'grid',
    modules_columns: 4,

    producer_title: 'Sobre o Produtor',
    producer_biography: product.biography || null,
    producer_show_biography: true,
    producer_show_avatar: true,
    producer_show_social_links: false,
    producer_layout: 'horizontal',

    cta_title: null,
    cta_description: null,
    cta_button_text: null,
    cta_button_link: null,
    cta_button_style: 'primary',
    cta_alignment: 'center',
    cta_background_color: null,

    faq_title: 'Perguntas Frequentes',
    faq_items: null,
    faq_allow_multiple_open: false,

    social_title: 'Me siga nas redes',
    social_alignment: 'center',
    social_style: 'icons',
    social_links: null,
  });

  const mapLayoutToRowFields = (layout, product) => {
    const getBlock = (type) =>
      (layout.layout || []).find((b) => b.type === type) || {};

    const hero = getBlock('hero').config || {};
    const description = getBlock('description').config || {};
    const modules = getBlock('modules').config || {};
    const producer = getBlock('producer').config || {};
    const cta = getBlock('cta').config || {};
    const faq = getBlock('faq').config || {};
    const social = getBlock('social').config || {};

    return {
      ...getDefaultRowFields(product),

      version: layout.version || '1.0',

      description_title:
        description.title || hero.title || 'Sobre o Curso',
      description_use_product_description:
        description.useProductDescription ?? true,
      description_content: description.content || '',
      description_show_stats: description.showStats ?? true,

      modules_title: modules.title || 'Módulos do Curso',
      modules_show_progress: modules.showProgress ?? true,
      modules_layout: modules.layout || 'grid',
      modules_columns: modules.columns || 4,

      producer_title: producer.title || 'Sobre o Produtor',
      producer_show_biography: producer.showBiography ?? true,
      producer_show_avatar: producer.showAvatar ?? true,
      producer_show_social_links: producer.showSocialLinks ?? false,
      producer_layout: producer.layout || 'horizontal',

      cta_title: cta.title || null,
      cta_description: cta.description || null,
      cta_button_text: cta.buttonText || null,
      cta_button_link: cta.buttonLink || null,
      cta_button_style: cta.buttonStyle || 'primary',
      cta_alignment: cta.alignment || 'center',
      cta_background_color: cta.backgroundColor || null,

      faq_title: faq.title || 'Perguntas Frequentes',
      faq_items: Array.isArray(faq.items) ? faq.items : null,
      faq_allow_multiple_open: faq.allowMultipleOpen ?? false,

      social_title: social.title || 'Me siga nas redes',
      social_alignment: social.alignment || 'center',
      social_style: social.style || 'icons',
      social_links: Array.isArray(social.links) ? social.links : null,
    };
  };

  let migrated = 0;

  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    const chunk = products.slice(i, i + CHUNK_SIZE);

    for (const product of chunk) {
      const layout = product.membership_page_layout;
      const fields =
        layout && Array.isArray(layout.layout)
          ? mapLayoutToRowFields(layout, product)
          : getDefaultRowFields(product);

      let attempt = 0;

      while (attempt <= MAX_RETRY) {
        try {
          const existing = await MembershipPageLayouts.findOne({
            where: { id_product: product.id },
          });

          if (existing) {
            await existing.update(fields);
          } else {
            await MembershipPageLayouts.create({
              id_product: product.id,
              ...fields,
            });
          }

          break;
        } catch (err) {
          attempt += 1;

          if (err?.original?.code === 'ETIMEDOUT' && attempt <= MAX_RETRY) {
            console.warn(
              `[RETRY] ETIMEDOUT no produto ${product.id}, retry ${attempt}`,
            );
            await sleep(500);
          } else {
            throw err;
          }
        }
      }

      migrated += 1;
    }

    console.log(
      `✔️ ${Math.min(i + CHUNK_SIZE, products.length)} / ${products.length} processados`,
    );

    await sleep(PAUSE_MS);
  }

  console.log('Migração concluída com sucesso.');
  console.log(`Total processado: ${migrated}`);

  await shutdown(0);
};

run();
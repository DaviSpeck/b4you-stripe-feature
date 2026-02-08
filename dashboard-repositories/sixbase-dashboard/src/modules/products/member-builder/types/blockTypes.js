/**
 * Block Types for Membership Page Builder
 */

export const BLOCK_TYPES = {
  TEXT: 'text',
  MODULES: 'modules',
  VIDEO: 'video',
  TESTIMONIALS: 'testimonials',
  FAQ: 'faq',
  CTA: 'cta',
  SPACER: 'spacer',
  IMAGE: 'image',
  DESCRIPTION: 'description',
  PRODUCER: 'producer',
  SOCIAL: 'social',
  STATS: 'stats',
};

export const BLOCK_CATEGORIES = {
  LAYOUT: 'layout',
  CONTENT: 'content',
  MEDIA: 'media',
  INTERACTIVE: 'interactive',
};

export const BLOCK_DEFINITIONS = [
  {
    type: BLOCK_TYPES.MODULES,
    name: 'Módulos do Curso',
    description: 'Lista de módulos do curso com progresso',
    category: BLOCK_CATEGORIES.CONTENT,
    icon: 'bx bx-book-content',
    defaultConfig: {
      title: 'Módulos do Curso',
      showProgress: true,
      layout: 'grid', // grid, list
      columns: 4, // 2, 3, 4
    },
  },
  {
    type: BLOCK_TYPES.DESCRIPTION,
    name: 'Sobre o Curso',
    description: 'Descrição do curso (usa dados do produto)',
    category: BLOCK_CATEGORIES.CONTENT,
    icon: 'bx bx-detail',
    defaultConfig: {
      title: 'Sobre o Curso',
      useProductDescription: true,
      content: '',
      showStats: true, // duration, lessons count
    },
  },
  {
    type: BLOCK_TYPES.PRODUCER,
    name: 'Sobre o Produtor',
    description: 'Informações do produtor do curso',
    category: BLOCK_CATEGORIES.CONTENT,
    icon: 'bx bx-user',
    defaultConfig: {
      title: 'Sobre o Produtor',
      showBiography: true,
      showAvatar: true,
      showSocialLinks: false,
      layout: 'horizontal', // horizontal, vertical
    },
  },
  {
    type: BLOCK_TYPES.CTA,
    name: 'Call-to-Action',
    description: 'Botão de ação com título e descrição',
    category: BLOCK_CATEGORIES.INTERACTIVE,
    icon: 'bx bx-pointer',
    defaultConfig: {
      title: 'Comece agora',
      description: '',
      buttonText: 'Iniciar',
      buttonLink: '',
      buttonStyle: 'primary', // primary, secondary, outline
      alignment: 'center', // left, center, right
      backgroundColor: 'transparent',
    },
  },
  {
    type: BLOCK_TYPES.FAQ,
    name: 'Perguntas Frequentes',
    description: 'Lista de perguntas e respostas em acordeão',
    category: BLOCK_CATEGORIES.INTERACTIVE,
    icon: 'bx bx-help-circle',
    defaultConfig: {
      title: 'Perguntas Frequentes',
      items: [],
      allowMultipleOpen: false,
    },
  },
  {
    type: BLOCK_TYPES.SPACER,
    name: 'Espaçador',
    description: 'Espaço em branco entre blocos',
    category: BLOCK_CATEGORIES.LAYOUT,
    icon: 'bx bx-minus',
    defaultConfig: {
      height: 'medium', // small, medium, large, custom
      customHeight: 60,
    },
  },
  {
    type: BLOCK_TYPES.SOCIAL,
    name: 'Redes Sociais',
    description: 'Links para redes sociais',
    category: BLOCK_CATEGORIES.CONTENT,
    icon: 'bx bx-share-alt',
    defaultConfig: {
      title: 'Me siga nas redes',
      alignment: 'center', // left, center, right
      style: 'icons', // icons, buttons
      links: [],
    },
  },
];

export const getBlockDefinition = (type) => {
  return BLOCK_DEFINITIONS.find((def) => def.type === type);
};

export const getBlocksByCategory = (category) => {
  return BLOCK_DEFINITIONS.filter((def) => def.category === category);
};

export const createDefaultBlock = (type, order = 0) => {
  const definition = getBlockDefinition(type);
  if (!definition) return null;

  return {
    id: `${type}-${Date.now()}`,
    type,
    order,
    config: { ...definition.defaultConfig },
  };
};

/**
 * Normalizes a block by merging its config with the default config for its type
 * This ensures blocks loaded from the backend have all default properties
 */
export const normalizeBlock = (block) => {
  const definition = getBlockDefinition(block.type);
  if (!definition) return block;

  return {
    ...block,
    config: {
      ...definition.defaultConfig,
      ...(block.config || {}),
    },
  };
};

/**
 * Default required blocks that cannot be removed or modified
 * These represent the fixed structure from PageCourseSingle
 */
export const REQUIRED_BLOCK_TYPES = [
  BLOCK_TYPES.DESCRIPTION,
  BLOCK_TYPES.MODULES,
  BLOCK_TYPES.PRODUCER,
];

/**
 * Checks if a block type is required (cannot be removed or duplicated)
 */
export const isRequiredBlock = (blockType) => {
  return REQUIRED_BLOCK_TYPES.includes(blockType);
};

/**
 * Creates the default layout structure based on PageCourseSingle
 * This represents the standard course page structure:
 * 1. Description block (Course Header Card equivalent)
 * 2. Modules block (Modules Section)
 * 3. Producer block (Support Section)
 *
 * These blocks are marked as required and cannot be removed or modified
 */
export const createDefaultLayout = () => {
  const descriptionBlock = createDefaultBlock(BLOCK_TYPES.DESCRIPTION, 0);
  const modulesBlock = createDefaultBlock(BLOCK_TYPES.MODULES, 1);
  const producerBlock = createDefaultBlock(BLOCK_TYPES.PRODUCER, 2);

  // Mark required blocks
  if (descriptionBlock) descriptionBlock.required = true;
  if (modulesBlock) modulesBlock.required = true;
  if (producerBlock) producerBlock.required = true;

  return [descriptionBlock, modulesBlock, producerBlock].filter(Boolean);
};

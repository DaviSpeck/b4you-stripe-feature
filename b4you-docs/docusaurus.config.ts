import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'B4You Docs',
  tagline: 'Documentação oficial do ecossistema B4You.',
  favicon: 'img/favicon.ico',

  url: 'https://docs.b4you.com.br',
  baseUrl: '/',

  organizationName: 'sixbasebr',
  projectName: 'b4you-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: 'https://github.com/sixbasebr/b4you-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'B4You Docs',
      logo: {
        alt: 'B4You Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',          // ← id que existe no sidebars.ts
          position: 'left',
          label: 'Documentação',
        },
        {
          href: 'https://github.com/sixbasebr/b4you-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Seções',
          items: [
            {
              label: 'Documentação',
              to: '/docs/welcome/seja-bem-vindo',
            },
          ],
        },
        {
          title: 'Comunidade',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
          ],
        },
        {
          title: 'Mais',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/sixbasebr',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} B4You. Desenvolvido com Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
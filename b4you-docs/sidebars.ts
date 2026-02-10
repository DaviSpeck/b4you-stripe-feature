import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: '👋 Boas vindas',
      items: [
        'welcome/seja-bem-vindo',
        'welcome/quickstart-onboarding',
      ],
    },
    {
      type: 'category',
      label: '🛠 Tecnologia',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Arquitetura',
          items: [
            'technology/architecture/overview',
            'technology/architecture/aws-overview'
          ],
        },
        {
          type: 'category',
          label: 'Serviços',
          link: { type: 'doc', id: 'technology/services/overview' },
          items: [
            {
              type: 'category',
              label: 'Checkout',
              items: [
                'technology/services/checkout/overview',
                'technology/services/checkout/architecture',
                {
                  type: 'category',
                  label: 'Contratos',
                  items: [
                    'technology/services/checkout/contracts/delivery',
                  ],
                },
                {
                  type: 'category',
                  label: 'Domínio',
                  items: [
                    'technology/services/checkout/domain/sales-model',
                  ],
                },
                {
                  type: 'category',
                  label: 'Upsell',
                  items: [
                    'technology/services/checkout/upsell/overview',
                    'technology/services/checkout/upsell/upsell-native',
                    'technology/services/checkout/upsell/upsell-one-click',
                    'technology/services/checkout/upsell/upsell-payment-rules'
                  ],
                },
                'technology/services/checkout/transparent-checkout',
                'technology/services/checkout/affiliate-attribution',
                'technology/services/checkout/coupons',
                {
                  type: 'category',
                  label: 'Tracking de Checkout',
                  items: [
                    'technology/services/checkout/tracking',
                    'technology/services/checkout/tracking-frontend',
                    'technology/services/checkout/tracking-backend',
                    'technology/services/checkout/tracking-analytics-bi',
                    'technology/services/checkout/tracking-backoffice-journey',
                  ],
                },
                'technology/services/checkout/multiacquirer-service',
                'technology/services/checkout/testing-multi-acquirer',
                {
                  type: 'category',
                  label: 'Stripe Internacional',
                  items: [
                    'technology/services/checkout/stripe-internacional/overview',
                    'technology/services/checkout/stripe-internacional/timeline-status',
                    'technology/services/checkout/stripe-internacional/governanca-pos-venda',
                    'technology/services/checkout/stripe-internacional/pendencias-proximos-passos',
                    'technology/services/checkout/stripe-internacional/glossario',
                    'technology/services/checkout/stripe-internacional/matriz-auditoria',
                    'technology/services/checkout/stripe-internacional/modelo-operacional',
                    'technology/services/checkout/stripe-internacional/runbook-governanca-incidentes',
                    'technology/services/checkout/stripe-internacional/faq-executivo-tecnico',
                    'technology/services/checkout/stripe-internacional/estado-atual-fases-finais',
                    'technology/services/checkout/stripe-internacional/rastreabilidade-execucao',
                    'technology/services/checkout/stripe-internacional/auditoria-prontidao-go-no-go',
                  ],
                },
              ],
            },
            {
              type: 'category',
              label: 'Dashboard',
              items: [
                'technology/services/dashboard/overview',
                'technology/services/dashboard/upsell-native-product',
                'technology/services/dashboard/upsell-native-offer'
              ],
            },
            {
              type: 'category',
              label: 'ECommerce',
              items: [
                'technology/services/ecommerce/overview',
                'technology/services/ecommerce/b4you-ecommerce',
                'technology/services/ecommerce/api-checkout',
                'technology/services/ecommerce/sixbase-api',
                'technology/services/ecommerce/sixbase-dashboard',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Desenvolvimento',
          link: { type: 'doc', id: 'technology/development/overview' },
          items: [
            'technology/development/organization-of-environments-b4you',
            'technology/development/cicd',
            'technology/development/gitflow_convention',
            'technology/development/pr-policy',
            'technology/development/endpoint-documentation',
            {
              type: 'category',
              label: 'Ambiente de Testes',
              items: [
                'technology/development/testing-environment/overview',
                'technology/development/testing-environment/sandbox-by-branch',
              ],
            },
            {
              type: 'category',
              label: 'Fluxos',
              items: [
                'technology/development/how-to-interpret-the-jira-documentation-standard',
                'technology/development/execution-guide-for-developers',
                'technology/development/revisao-prs',
                'technology/development/excecoes-fluxo-pr'
              ],
            },
            {
              type: 'category',
              label: 'Sustentação',
              link: { type: 'doc', id: 'technology/development/sustentacao/overview' },
              items: [
                'technology/development/sustentacao/template',
                'technology/development/sustentacao/reembolso',
                'technology/development/sustentacao/repasse-de-comissoes',
                'technology/development/sustentacao/bling',
                'technology/development/sustentacao/notazz',
                'technology/development/sustentacao/webhooks'
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Operações',
          items: [
            'technology/operations/observability-stack',
            'technology/operations/cost-optimization',
            'technology/operations/incident-response',
            'technology/operations/monitoring-and-observability-apis',
            'technology/operations/configuring-alerts-in-alertmanager',
            'technology/operations/grafana-dashboards'
          ],
        },
        {
          type: 'category',
          label: 'Lambdas',
          link: { type: 'doc', id: 'technology/lambdas/catalog' },
          items: [
            'technology/lambdas/mapping-github-aws',
            {
              type: 'category',
              label: 'Deploy',
              items: [
                'technology/lambdas/deploy-script',
              ],
            },
            'technology/lambdas/documentation-template',
            'technology/lambdas/abandonedcart',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '📚 Guias Rápidos',
      items: [
        {
          type: 'category',
          label: 'Integrações',
          items: [
            'how-to/webhooks',
          ],
        },
        'how-to/preview-error-in-vercel-with-ssr-next',
      ],
    },
    {
      type: 'category',
      label: '📄 Documentos Avulsos',
      items: [
        'single-documents/template-documento-avulso',
        'single-documents/workflow-automation-tickets-n8n-slack-jira',
        'single-documents/credentials-guide-automation-tickets-n8n-slack-jira'
      ],
    },
    {
      type: 'category',
      label: '🔖 Referências',
      items: [
        'reference/links-uteis',
        'reference/terms-glossary'
      ],
    },
  ],
};

export default sidebars;

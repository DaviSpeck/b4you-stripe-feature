const backofficeRoutes = [
    {
        id: 1,
        key: 'home',
        label: 'Home',
        route: '/home',
        subject: 'Home',
    },
    {
        id: 2,
        key: 'reports',
        label: 'Relatórios',
        route: '/reports',
        subject: 'Reports',
    },
    {
        id: 3,
        key: 'checkout-analytics',
        label: 'Analytics de Checkout',
        route: '/checkout-analytics',
        subject: 'CheckoutAnalytics',
    },
    {
        id: 4,
        key: 'sales',
        label: 'Vendas',
        route: '/sales',
        subject: 'Sales',
    },
    {
        id: 5,
        key: 'pagarme',
        label: 'Pagarme',
        route: '/pagarme',
        subject: 'Pagarme',
    },
    {
        id: 6,
        key: 'students',
        label: 'Alunos',
        route: '/students',
        subject: 'Students',
    },
    {
        id: 7,
        key: 'producers',
        label: 'Produtores',
        route: '/producers',
        subject: 'Producers',
    },
    {
        id: 8,
        key: 'onboarding',
        label: 'Onboarding',
        route: '/onboarding',
        subject: 'Onboarding',
    },
    {
        id: 9,
        key: 'products',
        label: 'Produtos',
        route: '/products',
        subject: 'Products',
    },
    {
        id: 10,
        key: 'market',
        label: 'Mercado',
        route: '/market',
        subject: 'Market',
    },
    {
        id: 11,
        key: 'market-banner',
        label: 'Banner do Mercado',
        route: '/market-banner',
        subject: 'MarketBanner',
    },
    {
        id: 12,
        key: 'events',
        label: 'Eventos',
        route: '/events',
        subject: 'Events',
    },
    {
        id: 13,
        key: 'logs',
        label: 'Logs',
        route: '/logs',
        subject: 'Logs',
    },
    {
        id: 14,
        key: 'saques',
        label: 'Saques',
        route: '/saques',
        subject: 'Withdrawals',
    },
    {
        id: 15,
        key: 'blacklist',
        label: 'Blacklist',
        route: '/blacklist',
        subject: 'Blacklist',
    },
    {
        id: 16,
        key: 'blocks',
        label: 'Bloqueios',
        route: '/blocks',
        subject: 'Blocks',
    },
    {
        id: 17,
        key: 'blocklist',
        label: 'Lista de Bloqueios',
        route: '/blocklist',
        subject: 'Blocklist',
    },
    {
        id: 18,
        key: 'sale-ip',
        label: 'Vendas por IP',
        route: '/sale-ip',
        subject: 'SaleIP',
    },
    {
        id: 19,
        key: 'commercial',
        label: 'Comercial',
        route: '/commercial',
        subject: 'Commercial',
    },
    {
        id: 20,
        key: 'change-bank-account',
        label: 'Alteração de Conta Bancária',
        route: '/change-bank-account',
        subject: 'ChangeBankAccount',
    },
    {
        id: 21,
        key: 'indique-ganhe',
        label: 'Indique e Ganhe',
        route: '/indique-ganhe',
        subject: 'IndiqueGanhe',
    },
    {
        id: 22,
        key: 'awards',
        label: 'Premiações',
        route: '/awards',
        subject: 'Awards',
    },
    {
        id: 23,
        key: 'notifications',
        label: 'Notificações',
        route: '/notifications',
        subject: 'Notifications',
    },
    {
        id: 24,
        key: 'kyc',
        label: 'KYC',
        route: '/kyc',
        subject: 'KYC',
    },
    {
        id: 25,
        key: 'client-wallet',
        label: 'Carteira de Clientes',
        route: '/client-wallet',
        subject: 'ClientWallet',
    },
    {
        id: 26,
        key: 'access_management',
        label: 'Gerenciamento de Acesso',
        route: '/admin/access',
        subject: 'AccessManagement',
    },
    {
        id: 27,
        key: 'creators',
        label: 'Creators',
        route: '/creators',
        subject: 'Creators',
    },
    {
        id: 28,
        key: 'notes',
        label: 'Notas',
        route: '/notes',
        subject: 'Notes',
    },
    {
        id: 29,
        key: 'forms-editor',
        label: 'Editor de Formulários',
        route: '/forms-editor',
        subject: 'FormsEditor',
    },
];

const findBackofficeRouteByKey = (key) => {
    if (!key) throw new Error('key must be provided');
    if (typeof key !== 'string') throw new Error('key must be string');
    return backofficeRoutes.find((s) => s.key === key);
};

const findBackofficeRouteBySubject = (subject) => {
    if (!subject) throw new Error('subject must be provided');
    if (typeof subject !== 'string') throw new Error('subject must be string');
    return backofficeRoutes.find((s) => s.subject === subject);
};

const findBackofficeRouteByPath = (route) => {
    if (!route) throw new Error('route must be provided');
    if (typeof route !== 'string') throw new Error('route must be string');
    return backofficeRoutes.find((s) => s.route === route);
};

module.exports = {
    backofficeRoutes,
    findBackofficeRouteByKey,
    findBackofficeRouteBySubject,
    findBackofficeRouteByPath,
};


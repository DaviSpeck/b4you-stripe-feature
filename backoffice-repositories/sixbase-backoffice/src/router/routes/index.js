import { lazy } from 'react';

// ** Document title
const TemplateTitle = '%s - Vuexy React Admin Template';

// ** Default Route
const DefaultRoute = '/home';

// ** Merge Routes
const Routes = [
  {
    path: '/home',
    component: lazy(() => import('../../views/Home')),
    meta: {
      action: 'manage',
      resource: 'Home',
    },
  },
  {
    path: '/reports',
    component: lazy(() => import('../../views/Reports')),
    meta: {
      action: 'manage',
      resource: 'Reports',
    },
  },
  {
    path: '/sales',
    component: lazy(() => import('../../views/Sales')),
    meta: {
      action: 'manage',
      resource: 'Sales',
    },
  },
  {
    path: '/kyc',
    component: lazy(() => import('../../views/kyc/Home')),
    meta: {
      action: 'manage',
      resource: 'KYC',
    },
  },
  {
    path: '/students',
    component: lazy(() => import('../../views/students/HomeStudents')),
    meta: {
      action: 'manage',
      resource: 'Students',
    },
  },
  {
    path: '/pagarme',
    component: lazy(() => import('../../views/pagarme/HomePagarme')),
    meta: {
      action: 'manage',
      resource: 'Pagarme',
    },
  },
  {
    path: '/student/:studentUuid',
    component: lazy(() => import('../../views/students/ViewStudentInfo')),
    meta: {
      action: 'manage',
      resource: 'Students',
    },
  },
  {
    path: '/producers',
    component: lazy(() => import('../../views/producers/HomeProducers')),
    meta: {
      action: 'manage',
      resource: 'Producers',
    },
  },
  {
    path: '/onboarding',
    component: lazy(() => import('../../views/onboarding/HomeOnboarding')),
    meta: {
      action: 'manage',
      resource: 'Onboarding',
    },
  },
  {
    path: '/producer/:userUuid',
    component: lazy(() => import('../../views/producers/ViewProducerInfo')),
    meta: {
      action: 'manage',
      resource: 'Producers',
    },
  },
  {
    path: '/producer/:userUuid/product/:productUuid',
    component: lazy(() => import('../../views/producers/ViewProductInfo')),
    meta: {
      action: 'manage',
      resource: 'Products',
    },
  },
  {
    path: '/products',
    component: lazy(() => import('../../views/products/HomeProducts')),
    meta: {
      action: 'manage',
      resource: 'Products',
    },
  },
  {
    path: '/events',
    component: lazy(() => import('../../views/events/HomeEvents')),
    meta: {
      action: 'manage',
      resource: 'Events',
    },
  },
  {
    path: '/events/product/:productUuid',
    component: lazy(() => import('../../views/events/EventsByProduct')),
    meta: {
      action: 'manage',
      resource: 'Events',
    },
  },
  {
    path: '/logs',
    component: lazy(() => import('../../views/HomeLogs')),
    meta: {
      action: 'manage',
      resource: 'Logs',
    },
  },
  {
    path: '/cloudwatch-logs',
    component: lazy(() => import('../../views/CloudWatchLogs')),
    meta: {
      action: 'manage',
      resource: 'CloudWatchLogs',
    },
  },
  {
    path: '/saques',
    component: lazy(() => import('../../views/Withdrawals')),
    meta: {
      action: 'manage',
      resource: 'Withdrawals',
    },
  },
  {
    path: '/blacklist',
    component: lazy(() => import('../../views/blacklist/Blacklists')),
    meta: {
      action: 'manage',
      resource: 'Blacklist',
    },
  },
  {
    path: '/blocks',
    component: lazy(() => import('../../views/blocks/Blocks')),
    meta: {
      action: 'manage',
      resource: 'Blocks',
    },
  },
  {
    path: '/blocklist',
    component: lazy(() => import('../../views/blacklist_check/Blacklists')),
    meta: {
      action: 'manage',
      resource: 'Blocklist',
    },
  },
  {
    path: '/sale-ip',
    component: lazy(() => import('../../views/sales_ip/SalesIp')),
    meta: {
      action: 'manage',
      resource: 'SaleIP',
    },
  },
  {
    path: '/market',
    component: lazy(() => import('../../views/Market/HomePage')),
    meta: {
      action: 'manage',
      resource: 'Market',
    },
  },
  {
    path: '/checkout-analytics',
    component: lazy(() => import('../../views/checkout_analytics/CheckoutAnalytics'),),
    meta: {
      action: 'manage',
      resource: 'CheckoutAnalytics',
    },
  },
  {
    path: '/market-banner',
    component: lazy(() => import('../../views/Market/Banner')),
    meta: {
      action: 'manage',
      resource: 'MarketBanner',
    },
  },
  {
    path: '/commercial',
    component: lazy(() => import('../../views/commercial/Commercial')),
    meta: {
      action: 'manage',
      resource: 'Commercial',
    },
  },
  {
    path: '/change-bank-account',
    component: lazy(() => import('../../views/ChangeBankAccount')),
    meta: {
      action: 'manage',
      resource: 'ChangeBankAccount',
    },
  },
  {
    path: '/indique-ganhe',
    component: lazy(() => import('../../views/IndiqueGanhe')),
    meta: {
      action: 'manage',
      resource: 'IndiqueGanhe',
    },
  },
  {
    path: '/notifications',
    component: lazy(() => import('../../views/notifications/Notifications')),
    meta: {
      action: 'manage',
      resource: 'Notifications',
    },
  },
  {
    path: '/awards',
    component: lazy(() => import('../../views/awards/awards')),
    meta: {
      action: 'manage',
      resource: 'Awards',
    },
  },
  {
    path: '/client-wallet',
    component: lazy(() => import('../../views/client_wallet/client_wallet')),
    meta: {
      action: 'manage',
      resource: 'ClientWallet',
    }
  },
  {
    path: '/admin/access',
    component: lazy(() => import('../../views/admin/AccessManagement')),
    meta: {
      action: 'manage',
      resource: 'AccessManagement',
    },
  },
  {
    path: '/creators',
    component: lazy(() => import('../../views/creators/Creators')),
    meta: {
      action: 'manage',
      resource: 'Creators',
    },
  },
  {
    path: '/forms-editor',
    component: lazy(() => import('../../views/forms_editor/Editor')),
    meta: {
      action: 'manage',
      resource: 'FormsEditor',
    },
  },
  {
    path: '/notes',
    component: lazy(() => import('../../views/notes/NotesDashboard')),
    meta: {
      action: 'manage',
      resource: 'Notes',
    },
  },
  {
    path: '/login',
    component: lazy(() => import('../../views/Login')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true,
    },
  },
  {
    path: '/error',
    component: lazy(() => import('../../views/Error')),
    layout: 'BlankLayout',
  },
];

export { DefaultRoute, TemplateTitle, Routes };
import React, { useState, useCallback, FC, Suspense } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';

const Dashboard = React.lazy(() => import('./tabs/dashboard/Dashboard'));
const Calendar = React.lazy(() => import('./tabs/calendar/Calendar'));
const Monitoring = React.lazy(() => import('./tabs/monitoring/Monitoring'));
const Management = React.lazy(() => import('./tabs/management/Management'));
const Commission = React.lazy(() => import('./tabs/commission/Commission'));

const TABS = {
  DASHBOARD: '1',
  CALENDAR: '2',
  MONITORING: '3',
  MANAGEMENT: '4',
  COMMISSION: '5',
} as const;

const ClientWallet: FC = () => {
  const [active, setActive] = useState<string>(TABS.DASHBOARD);

  const toggle = useCallback((tab: string) => {
    setActive((prev) => (prev !== tab ? tab : prev));
  }, []);

  return (
    <section id="pageClientWallet">
      <h2 className="mb-2">Carteira de Clientes</h2>

      <Nav tabs>
        {[
          { id: TABS.DASHBOARD, label: 'Dashboard' },
          { id: TABS.CALENDAR, label: 'Calendário' },
          { id: TABS.MONITORING, label: 'Acompanhamento' },
          { id: TABS.MANAGEMENT, label: 'Gerenciamento' },
          { id: TABS.COMMISSION, label: 'Comissão' },
        ].map(({ id, label }) => (
          <NavItem key={id}>
            <NavLink
              role="button"
              tabIndex={0}
              active={active === id}
              onClick={() => toggle(id)}
            >
              {label}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={active} className="mt-3">
        <Suspense fallback={<div>Carregando...</div>}>
          {active === TABS.DASHBOARD && (
            <TabPane tabId={TABS.DASHBOARD}>
              <Dashboard />
            </TabPane>
          )}
          {active === TABS.CALENDAR && (
            <TabPane tabId={TABS.CALENDAR}>
              <Calendar />
            </TabPane>
          )}
          {active === TABS.MONITORING && (
            <TabPane tabId={TABS.MONITORING}>
              <Monitoring />
            </TabPane>
          )}
          {active === TABS.MANAGEMENT && (
            <TabPane tabId={TABS.MANAGEMENT}>
              <Management />
            </TabPane>
          )}
          {active === TABS.COMMISSION && (
            <TabPane tabId={TABS.COMMISSION}>
              <Commission />
            </TabPane>
          )}
        </Suspense>
      </TabContent>
    </section>
  );
};

export default ClientWallet;

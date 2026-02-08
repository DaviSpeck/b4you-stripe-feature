import React, { FC, Suspense, useCallback, useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';

const DashboardTab = React.lazy(() => import('./tabs/DashboardTab'));
const JourneyTab = React.lazy(() => import('./tabs/JourneyTab'));

const TABS = {
  DASHBOARD: 'dashboard',
  JOURNEY_OVERVIEW: 'journey-overview',
  JOURNEY_BREAKDOWN: 'journey-breakdown',
  JOURNEY_SESSIONS: 'journey-sessions',
  JOURNEY_DOMAINS: 'journey-domains',
} as const;

type TabId = (typeof TABS)[keyof typeof TABS];

const CheckoutAnalytics: FC = () => {
  const [active, setActive] = useState<TabId>(TABS.DASHBOARD);

  const toggle = useCallback((tab: TabId) => {
    setActive((prev) => (prev !== tab ? tab : prev));
  }, []);

  return (
    <section className="checkout-analytics">
      <Nav tabs>
        <NavItem>
          <NavLink
            role="button"
            tabIndex={0}
            active={active === TABS.DASHBOARD}
            onClick={() => toggle(TABS.DASHBOARD)}
          >
            Dashboard
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            role="button"
            tabIndex={0}
            active={active === TABS.JOURNEY_OVERVIEW}
            onClick={() => toggle(TABS.JOURNEY_OVERVIEW)}
          >
            Jornada • Visão geral
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            role="button"
            tabIndex={0}
            active={active === TABS.JOURNEY_BREAKDOWN}
            onClick={() => toggle(TABS.JOURNEY_BREAKDOWN)}
          >
            Jornada • Detalhamento
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            role="button"
            tabIndex={0}
            active={active === TABS.JOURNEY_SESSIONS}
            onClick={() => toggle(TABS.JOURNEY_SESSIONS)}
          >
            Jornada • Sessões
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            role="button"
            tabIndex={0}
            active={active === TABS.JOURNEY_DOMAINS}
            onClick={() => toggle(TABS.JOURNEY_DOMAINS)}
          >
            Jornada • Domínios
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={active} className="mt-3">
        <Suspense fallback={<div>Carregando...</div>}>
          {active === TABS.DASHBOARD && (
            <TabPane tabId={TABS.DASHBOARD}>
              <DashboardTab />
            </TabPane>
          )}
          {active === TABS.JOURNEY_OVERVIEW && (
            <TabPane tabId={TABS.JOURNEY_OVERVIEW}>
              <JourneyTab mode="overview" />
            </TabPane>
          )}
          {active === TABS.JOURNEY_BREAKDOWN && (
            <TabPane tabId={TABS.JOURNEY_BREAKDOWN}>
              <JourneyTab mode="breakdown" />
            </TabPane>
          )}
          {active === TABS.JOURNEY_SESSIONS && (
            <TabPane tabId={TABS.JOURNEY_SESSIONS}>
              <JourneyTab mode="sessions" />
            </TabPane>
          )}
          {active === TABS.JOURNEY_DOMAINS && (
            <TabPane tabId={TABS.JOURNEY_DOMAINS}>
              <JourneyTab mode="domains" />
            </TabPane>
          )}
        </Suspense>
      </TabContent>
    </section>
  );
};

export default CheckoutAnalytics;

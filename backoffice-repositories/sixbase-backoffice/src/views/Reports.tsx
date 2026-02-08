import React, { useEffect, useState, FC } from 'react';
import {
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { api } from '../services/api';
import Costs from './reports/Costs';
import Sales from './reports/Sales';
import Balances from './Balances';
import Denieds from './reports/Denieds';
import Blocks from './reports/Blocks';
import { CostsData } from '../interfaces/reports.interface';

const Reports: FC = () => {
  const [active, setActive] = useState<string>('1');
  const [loading, setLoading] = useState<boolean>(false);
  const [costs, setCosts] = useState<CostsData | null>(null);

  const toggle = (tab: string): void => {
    if (active !== tab) {
      setActive(tab);
    }
  };

  const fetchCosts = (): void => {
    setLoading(true);
    api
      .get<CostsData>('/reports/costs')
      .then((r) => setCosts(r.data))
      .catch((err) => console.log(err));
    setLoading(false);
  };

  useEffect(() => {
    fetchCosts();
  }, []);

  return (
    <div>
      <Card>
        <CardBody>
          <Nav tabs>
            <NavItem>
              <NavLink
                href="#"
                active={active === '1'}
                onClick={() => {
                  toggle('1');
                }}
              >
                Geral
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                active={active === '2'}
                onClick={() => {
                  toggle('2');
                }}
              >
                Custos
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                active={active === '3'}
                onClick={() => {
                  toggle('3');
                }}
              >
                Saldos
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                active={active === '4'}
                onClick={() => {
                  toggle('4');
                }}
              >
                Recusas
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                href="#"
                active={active === '5'}
                onClick={() => {
                  toggle('5');
                }}
              >
                Bloqueios
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={active}>
            <TabPane tabId="1">{<Sales />}</TabPane>
            <TabPane tabId="2">
              {costs && <Costs costs={costs} fetchCosts={fetchCosts} />}
            </TabPane>
            <TabPane tabId="3">{<Balances />}</TabPane>
            <TabPane tabId="4">{<Denieds />}</TabPane>
            <TabPane tabId="5">{<Blocks />}</TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
} from 'reactstrap';
import { Users, Shield, Menu, FileText, Settings } from 'react-feather';
import UsersTab from '../../components/admin/UsersTab';
import RolesTab from '../../components/admin/RolesTab';
import MenusTab from '../../components/admin/MenusTab';
import LogsTab from '../../components/admin/LogsTab';
import ActionsTab from 'components/admin/ActionsTab';

const AccessManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  const toggle = (tab: string) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <div>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader>
              <CardTitle tag="h4">Gerenciamento de Acesso</CardTitle>
            </CardHeader>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    active={activeTab === '1'}
                    onClick={() => toggle('1')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Users size={16} className="me-1" />
                    Usuários
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={activeTab === '2'}
                    onClick={() => toggle('2')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Shield size={16} className="me-1" />
                    Roles
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={activeTab === '3'}
                    onClick={() => toggle('3')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Menu size={16} className="me-1" />
                    Itens de Menu
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={activeTab === '4'}
                    onClick={() => toggle('4')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Settings size={16} className="me-1" />
                    Ações
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    active={activeTab === '5'}
                    onClick={() => toggle('5')}
                    style={{ cursor: 'pointer' }}
                  >
                    <FileText size={16} className="me-1" />
                    Logs e Auditoria
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <UsersTab />
                </TabPane>
                <TabPane tabId="2">
                  <RolesTab />
                </TabPane>
                <TabPane tabId="3">
                  <MenusTab />
                </TabPane>
                <TabPane tabId="4">
                  <ActionsTab />
                </TabPane>
                <TabPane tabId="5">
                  <LogsTab />
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccessManagement;

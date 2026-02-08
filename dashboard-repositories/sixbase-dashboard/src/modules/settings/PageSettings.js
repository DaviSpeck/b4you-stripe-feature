import { Fragment, useEffect, useState } from 'react';
import { Card, Col, Nav, Row, Tab } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import Access from './form/Access';
import Address from './form/Address';
import Company from './form/Company';
import General from './form/General';
import Notifications from './form/Notifications';
import Rates from './form/Rates';
import './styles.scss';

const PageSettings = () => {
  const [userData, setUserData] = useState({
    general: null,
    access: null,
    company: null,
    address: null,
    bank_account: null,
  });

  const [fees, setFees] = useState(null);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dados gerais');

  useEffect(() => {
    // Verifica o parâmetro na URL e altera a aba ativa
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');

    if (tabParam && tabParam.toLowerCase() === 'cnpj') {
      setActiveTab('cnpj');
    }

    api
      .get('/users/profile')
      .then((response) => {
        let data = response.data;
        setUserData(data);
      })
      .catch(() => {});

    api
      .get('/users/profile/fees')
      .then((response) => {
        let data = response.data;
        setFees(data);
      })
      .catch(() => {});
  }, [location]);

  const tabData = [
    {
      name: 'Dados Gerais',
      icon: '-user',
      content: <General data={userData.general} setData={setUserData} />,
    },
    {
      name: 'Senha',
      icon: '-user',
      content: <Access data={userData.access} setData={setUserData} />,
    },
    {
      name: 'Endereço',
      icon: '-map',
      content: <Address data={userData.address} setData={setUserData} />,
    },
    {
      name: 'CNPJ',
      icon: '-building',
      content: <Company data={userData.company} setData={setUserData} />,
    },
    {
      name: 'Tarifas',
      icon: '-calculator',
      content: <Rates data={fees} setData={setUserData} />,
    },
    {
      name: 'Notificações',
      icon: '-bell',
      content: <Notifications data={userData.notifications} />,
    },
  ];

  return (
    <Fragment>
      <section id='page-settings'>
        <PageTitle activeMenu='Configurações de Usuário' motherMenu={null} />
        <Col xl={12}>
          <Card>
            <Card.Header>
              <Card.Title>Configurações de Usuário</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Tab.Container
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                >
                  <Col xl={3} className='col-xxl-4' sm={4}>
                    <Nav as='ul' className='flex-column nav-pills mb-3'>
                      {tabData.map((data) => (
                        <Nav.Item as='li' key={data.name}>
                          <Nav.Link eventKey={data.name.toLowerCase()}>
                            <i className={`bx bx${data.icon} mr-2`} />{' '}
                            {data.name}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                  </Col>
                  <Col xl={9} className='col-xxl-8' sm={8}>
                    <Tab.Content className='ml-2'>
                      {tabData.map((data) => (
                        <Tab.Pane
                          eventKey={data.name.toLowerCase()}
                          key={data.name}
                        >
                          {data.content}
                        </Tab.Pane>
                      ))}
                    </Tab.Content>{' '}
                  </Col>
                </Tab.Container>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </section>
    </Fragment>
  );
};

export default PageSettings;

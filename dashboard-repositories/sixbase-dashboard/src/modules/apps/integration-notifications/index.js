import { Fragment } from 'react';
import { Col, Row } from 'react-bootstrap';
import PageTitle from '../../../jsx/layouts/PageTitle';
import IntegrationNotifications from '../IntegrationNotifications';

const PageIntegrationNotifications = () => {
  return (
    <Fragment>
      <section id='page-integration-notifications'>
        <PageTitle title='Notificações de Integrações' />
        <Row>
          <Col xl={12}>
            <p>
              Visualize e gerencie as notificações das suas integrações.
            </p>
          </Col>
        </Row>
        <IntegrationNotifications />
      </section>
    </Fragment>
  );
};

export default PageIntegrationNotifications;


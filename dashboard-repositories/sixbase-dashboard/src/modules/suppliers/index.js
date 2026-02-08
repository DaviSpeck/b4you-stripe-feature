import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import PageTitle from '../../jsx/layouts/PageTitle';
import { MySuppliers } from './mySuppliers';
import Suppliers from './suppliers';

const index = () => {
  return (
    <>
      <section id='pageSupplier'>
        <div className='page-title-wrap'>
          <PageTitle title='Fornecedores' />
        </div>

        <Row>
          <Col>
            <Tabs
              defaultActiveKey='suppliers'
              id='uncontrolled-tab-example'
              className='mb-3'
              style={{ fontWeight: '500' }}
            >
              <Tab eventKey='suppliers' title='Produtos que sou fornecedor'>
                <div className='container-datatable card'>
                  <Suppliers />
                </div>
              </Tab>

              <Tab eventKey='my-suppliers' title='Meus fornecedores'>
                <div className='container-datatable card'>
                  <MySuppliers />
                </div>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default index;

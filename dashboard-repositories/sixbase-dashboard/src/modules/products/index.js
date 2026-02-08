import { Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import PageTitle from '../../jsx/layouts/PageTitle';
import './styles.scss';

const PageProductsHome = () => {
  const history = useHistory();

  const navigate = (destination) => {
    history.push(destination);
  };

  return (
    <>
      <section id='pageProducts'>
        <PageTitle title='Produtos' />
        <Row className='options'>
          <Col sm={4}>
            <Card
              className='card-wrapper'
              onClick={() => navigate('/produtos/listar')}
            >
              <div>
                <i className='las la-box' />
                <span className='title'>Meus Produtos</span>
              </div>
            </Card>
          </Col>
          <Col sm={4}>
            <Card
              className='card-wrapper'
              onClick={() => navigate('/coproducoes')}
            >
              <div>
                <i className='las la-handshake' />
                <span className='title'>Minhas Coproduções</span>
              </div>
            </Card>
          </Col>
          <Col sm={4}>
            <Card
              className='card-wrapper'
              onClick={() => navigate('/afiliacoes')}
            >
              <div>
                <i className='las la-user-edit' />
                <span className='title'>Minhas Afiliações</span>
              </div>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default PageProductsHome;

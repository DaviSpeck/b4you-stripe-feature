import { Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import PageTitle from '../../jsx/layouts/PageTitle';
import './style.scss';

const PageCollaboratorsHome = () => {
  const history = useHistory();

  const navigate = (destination) => {
    history.push(destination);
  };

  return (
    <>
      <section id='pageCollaboratorsHome'>
        <PageTitle title='Colaborações' />
        <Row className='options'>
          <Col sm={4}>
            <Card onClick={() => navigate('/colaboradores/meus-colaboradores')}>
              <Card.Body>
                <i className='las la-user-friends' />
                <span className='title'>Meus Colaboradores</span>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={4}>
            <Card
              onClick={() => navigate('/colaboradores/minhas-colaboracoes')}
            >
              <Card.Body>
                <i className='las la-user-tag' />
                <span className='title'>Minhas Colaborações</span>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default PageCollaboratorsHome;

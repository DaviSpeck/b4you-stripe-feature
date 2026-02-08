import { Card, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { useHistory } from 'react-router-dom';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

const MemberCustom = () => {
  const { uuidProduct } = useParams();
  const history = useHistory();

  return (
    <>
      <Row className='mb-4'>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className='mb-3'>
                <h4>Builder de Página</h4>
                <small>
                  Personalize o layout da página de membros com o builder visual. 
                  Todas as configurações de personalização (cores, banners, imagens) 
                  estão disponíveis dentro do builder.
                </small>
              </div>
              <ButtonDS
                variant='primary'
                size='sm'
                onClick={() => {
                  history.push(`/produtos/editar/${uuidProduct}/conteudo-builder`);
                }}
                className='mt-4'
              >
                <i className='bx bx-layout me-2' />
                Abrir Builder de Página
              </ButtonDS>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default MemberCustom;

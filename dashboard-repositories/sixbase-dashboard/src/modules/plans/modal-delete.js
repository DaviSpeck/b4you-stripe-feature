import { useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';

const ModalDelete = ({ uuidProduct, setShowModalDelete, activePlan }) => {
  const [requesting, setRequesting] = useState(false);

  const handleDelete = () => {
    setRequesting(true);

    api
      .delete(`/products/plans/${uuidProduct}/${activePlan.uuid}`)
      .then(() => {
        setRequesting(false);
        setShowModalDelete(false);
      })
      .catch(() => {
        setRequesting(false);
      });
  };

  return (
    <>
      <Modal.Header closeButton>
        <Modal.Title>Remover Plano</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <h4 className='mb-4'>Muita calma nessa hora!</h4>
          </Col>
        </Row>
        <Row>
          <Col>
            <p className='small'>
              Ao remover esse plano todas as assinaturas dele serão canceladas.
              <br />
              Você tem certeza que deseja continuar?
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <ButtonDS
              size='sm'
              variant='danger'
              onClick={handleDelete}
              disabled={requesting}
            >
              {!requesting ? 'Remover Plano' : 'removendo...'}
            </ButtonDS>
          </Col>
        </Row>
      </Modal.Body>
    </>
  );
};

export default ModalDelete;

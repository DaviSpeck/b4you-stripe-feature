import { useEffect, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../../../jsx/components/ModalGeneric';

export default function ModalAnchor({
  show,
  setShow,
  type = 'create',
  requesting = false,
  createAnchor,
  editAnchor,
  anchor,
  deleteAnchor,
}) {
  const [label, setLabel] = useState('');
  const isTouched = useRef(false);

  useEffect(() => {
    if (anchor) {
      setLabel(anchor.label);
    }

    return () => {
      setLabel('');
      isTouched.current = false;
    };
  }, [anchor]);

  const handleTitleChange = (e) => {
    e.preventDefault();
    if (!isTouched.current) {
      isTouched.current = true;
    }
    setLabel(e.target.value);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (type === 'create') {
      createAnchor({ label });
    } else {
      editAnchor({ ...anchor, label });
    }
  };
  return (
    <ModalGeneric
      centered
      show={show}
      setShow={setShow}
      title={type === 'create' ? 'Nova Seção' : 'Editar Seção'}
    >
      <Row>
        <Col md={12}>
          <label htmlFor=''>Título</label>

          <Form.Group>
            <Form.Control
              name='label'
              type='text'
              value={label}
              isInvalid={isTouched.current && label.length === 0}
              onChange={handleTitleChange}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className='mt-4'>
        <Col className='d-flex justify-content-between'>
          {type !== 'create' && (
            <ButtonDS
              iconLeft='bx-trash-alt'
              variant='danger'
              onClick={() => {
                deleteAnchor();
              }}
            >
              Remover seção
            </ButtonDS>
          )}
        </Col>
        <Col className='d-flex justify-content-end'>
          <ButtonDS
            size={'md'}
            iconRight={'bx-check-circle'}
            disabled={label.length === 0}
            onClick={handleClick}
          >
            <span>{requesting ? 'salvando...' : 'Salvar'}</span>
          </ButtonDS>
        </Col>
      </Row>
    </ModalGeneric>
  );
}

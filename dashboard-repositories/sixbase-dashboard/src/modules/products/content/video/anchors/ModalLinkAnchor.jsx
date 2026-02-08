import { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../../../../jsx/components/ModalGeneric';

export default function ModalLinkAnchor({
  show,
  setShow,
  requesting = false,
  linkModule,
  modules,
}) {
  const [uuid, setUuid] = useState(null);
  const handleClick = (e) => {
    e.preventDefault();
    linkModule({ uuid });
  };
  return (
    <ModalGeneric centered show={show} setShow={setShow} title='Linkar Módulo'>
      <Row>
        <Col md={12}>
          <label htmlFor=''>Módulo</label>
          <Form.Control
            name='module'
            as='select'
            className='select-input'
            onChange={(e) => setUuid(e.target.value)}
          >
            <option value='0'>Selecione...</option>
            {modules.map(({ uuid, title }, index) => {
              return (
                <option value={uuid} key={index}>
                  {title}
                </option>
              );
            })}
          </Form.Control>
        </Col>
      </Row>
      <div className='d-flex justify-content-end mt-4'>
        <ButtonDS
          size={'md'}
          iconRight={'bx-check-circle'}
          onClick={handleClick}
          disabled={!uuid}
        >
          <span>{requesting ? 'salvando...' : 'Salvar'}</span>
        </ButtonDS>
      </div>
    </ModalGeneric>
  );
}

import { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../providers/api';

const ModalPreview = ({ setShow, uuidProduct }) => {
  const { register, formState, handleSubmit } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;

  const [pending, setPending] = useState(true);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    api
      .get(`/products/classrooms/${uuidProduct}/preview`)
      .then((response) => {
        setClassrooms(response.data);
      })
      .catch(() => {})
      .finally(() => setPending(false));
  }, []);

  const onSubmit = async (d) => {
    api
      .get(`/auth/student?classroom_id=${d.classroom_id}`)
      .then((r) => {
        window.open(r.data.url, '_blank');
        setShow(false);
      })
      .catch((e) => e);
  };

  return (
    <>
      {classrooms && (
        <Modal
          show={true}
          centered
          onHide={() => {
            setShow(false);
          }}
          size='md'
          id='modal-preview'
        >
          <Modal.Header closeButton>
            <Modal.Title>Pré-visualizar curso</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Row>
                <Col md={12}>
                  <label>Selecione a turma</label>
                  <Form.Control
                    name='classroom_id'
                    as='select'
                    className='select-input'
                    ref={register({ required: true })}
                  >
                    {pending && <option>Carregando turmas...</option>}
                    {classrooms.map((item, index) => {
                      return (
                        <option key={index} value={item.uuid}>
                          {item.label}
                        </option>
                      );
                    })}
                  </Form.Control>
                </Col>
                <Col
                  md={12}
                  className='d-flex align-items-end mt-4 justify-content-end'
                >
                  <ButtonDS
                    onClick={handleSubmit(onSubmit)}
                    disabled={!isValid && pending}
                    iconRight={'bx-link-external'}
                  >
                    <span>Pré-visualizar curso</span>
                  </ButtonDS>
                </Col>
              </Row>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default ModalPreview;

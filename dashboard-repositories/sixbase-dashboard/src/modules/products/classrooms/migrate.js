import { useState } from 'react';
import { Col, Form, FormControl, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';

const Migrate = ({
  activeClassroom,
  uuidProduct,
  setShow,
  classrooms,
  notify,
}) => {
  const [requesting, setRequesting] = useState(null);

  const { register, getValues } = useForm({
    mode: 'onChange',
  });

  const availableClassrooms = classrooms.filter(
    (item) => item.uuid !== activeClassroom.uuid
  );

  const onSubmit = () => {
    setRequesting('put');

    let source = activeClassroom.uuid;
    let destination = getValues('destination');

    api
      .put(
        '/products/students/' +
          uuidProduct +
          '/migrate/all/' +
          source +
          '/' +
          destination
      )
      .then(() => {
        notify({ message: 'Alunos migrados com sucesso', type: 'success' });
        closeModal();
      })
      .catch(() => {
        notify({ message: 'Falha ao migrar os alunos', type: 'error' });
      });
  };

  const closeModal = () => {
    setShow(false);
  };

  return (
    <>
      <Form.Group as={Row} controlId='formPlaintextEmail'>
        {activeClassroom?.students_count === 0 ? (
          <Form.Label column sm='12'>
            <span>Essa turma nao possui alunos para migrar</span>
          </Form.Label>
        ) : (
          <div>
            <Form.Label column sm='12'>
              <span>
                Migrar <b>{activeClassroom?.students_count}</b> alunos da turma{' '}
                <b>{activeClassroom.label}</b> para...{' '}
              </span>
            </Form.Label>
            <Col>
              <FormControl
                as='select'
                ref={register({ required: true })}
                name='destination'
              >
                {availableClassrooms.map((item, index) => {
                  return (
                    <option value={item.uuid} key={index}>
                      {item.label}
                    </option>
                  );
                })}
              </FormControl>
            </Col>
          </div>
        )}
        {/* <Col xs={12}>
          <small className='mt-3 d-block'>
            <b>Atenção,</b> essa operação não poderá ser desfeita.
          </small>
        </Col> */}
        {/* <Col xs={12}>
          <small className='mt-4 mb-1 d-block'>
            Digite <b>"confirmo"</b> abaixo e clique em salvar para executar.
          </small>
        </Col>
        <Col xs={12}>
          <FormControl
            placeholder="digite 'confirmo'"
            onKeyUp={(e) => {
              setConfirm(e.target.value);
            }}
          />
        </Col> */}
      </Form.Group>

      {activeClassroom?.students_count === 0 ? (
        <Row>
          <Col md={12} className='d-flex justify-content-end'>
            <ButtonDS size={'sm'} onClick={closeModal} variant='primary'>
              OK
            </ButtonDS>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col md={12} className='d-flex justify-content-end'>
            <ButtonDS
              size={'sm'}
              onClick={onSubmit}
              disabled={requesting === 'put'}
              variant='primary'
            >
              {requesting === 'put' ? 'salvando...' : 'Salvar'}
            </ButtonDS>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Migrate;

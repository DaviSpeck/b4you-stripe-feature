import { useState } from 'react';
import { Col, Form, FormControl, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../../providers/api';
import regexEmail from '../../../utils/regex-email';
import { notify } from '../../functions';
import { useProduct } from '../../../providers/contextProduct';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';

const Invite = ({ setShow, uuidProduct, classrooms, onSuccess }) => {
  const [requesting, setRequesting] = useState(null);
  const { product } = useProduct();
  const { register, handleSubmit, getValues, errors } = useForm({
    mode: 'onChange',
  });

  const onSubmit = (data) => {
    setRequesting('post');

    let activeClassroom = getValues('classroom');

    let fields = { data: [data.email] };
    if (activeClassroom) {
      fields.classroom_id = activeClassroom;
    }

    api
      .post(`/products/students/${uuidProduct}/import/`, fields)
      .then(() => {
        notify({ message: 'Aluno convidado com sucesso', type: 'success' });
        if (onSuccess) onSuccess();
        setShow(false);
        setRequesting(false);
      })
      .catch(() => {
        notify({ message: 'Falha ao convidar aluno', type: 'error' });
      });
  };

  return (
    <div>
      <Row>
        {product.type === 'video' && (
          <Col md={12} className='form-group'>
            <label htmlFor=''>Turma</label>
            <FormControl
              as='select'
              ref={register({ required: true })}
              name='classroom'
            >
              {classrooms.map((item, index) => {
                return (
                  <option value={item.uuid} key={index}>
                    {item.label}
                  </option>
                );
              })}
            </FormControl>
          </Col>
        )}

        <Col md={12} className='form-group'>
          <label htmlFor=''>E-mail</label>
          <Form.Control
            id='email'
            name='email'
            ref={register({
              required: 'Campo obrigatório.',
              validate: (value) => {
                return regexEmail(value);
              },
            })}
          />
          <div className='form-error mt-2' id='password_help'>
            <span>{errors?.email?.message}</span>
          </div>
        </Col>
      </Row>
      <Row>
        <Col className='d-flex justify-content-between mt-4'>
          <ButtonDS
            size={'sm'}
            variant='light'
            onClick={() => {
              setShow(false);
            }}
          >
            Cancelar
          </ButtonDS>
          <ButtonDS
            size={'sm'}
            variant='primary'
            onClick={handleSubmit(onSubmit)}
            disabled={requesting === 'post'}
          >
            {requesting !== 'post' ? 'Enviar convite' : 'Enviando convite...'}
          </ButtonDS>
        </Col>
      </Row>
    </div>
  );
};

export default Invite;

import { useEffect, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const Access = ({ data, setData }) => {
  const [registerReturn, setRegisterReturn] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const { register, handleSubmit, errors, formState, reset, watch, setValue } =
    useForm({
      mode: 'onChange',
    });
  const new_password = useRef();
  new_password.current = watch('new_password', '');
  const { isValid } = formState;

  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data]);

  const onSubmit = (data) => {
    setRequesting(true);
    api
      .post('/auth/change-password', data)
      .then((response) => {
        notify({
          message: 'Dados salvos com sucesso',
          type: 'success',
        });
        setRequesting(false);
        setData(response.data);
        setValue('password', '');
        setValue('new_password', '');
        setValue('confirm_password', '');
      })
      .catch((err) => {
        notify({
          message: 'Falha ao salvar os dados',
          type: 'error',
        });
        setRequesting(false);
        setRegisterReturn(
          err.response.data.message
            ? err.response.data.message
            : 'Dados invalidos.'
        );
      });
  };

  return (
    <>
      <h4>Alteração de senha</h4>
      <p>Sua senha deve conter no mínimo 6 e no máximo 70 caracteres</p>
      <Row>
        <Col md={6}>
          {registerReturn && (
            <div
              className='alert alert-danger alert-xs'
              style={{
                padding: '.75rem 1.0em',
                fontSize: 14,
                border: '1px solid #f3d1d9',
              }}
            >
              {registerReturn}
            </div>
          )}
        </Col>
      </Row>
      <form
        action=''
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: '20px' }}
      >
        <Row>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='password'>Digite a senha atual</label>
              <div className='form-group-hide'>
                <Form.Control
                  ref={register({
                    required: 'Campo obrigatório.',
                    minLength: {
                      value: 6,
                      message: 'Sua senha deve conter no mínimo 6 digitos.',
                    },
                  })}
                  isInvalid={errors.password}
                  className='form-control input-default'
                  name='password'
                  type={hidePassword ? 'password' : 'text'}
                />

                <div
                  className='hide-icon'
                  onClick={() => setHidePassword(!hidePassword)}
                >
                  {hidePassword ? (
                    <i className='bx bx-hide'></i>
                  ) : (
                    <i className='bx bx-show-alt'></i>
                  )}
                </div>
              </div>
              <div className='form-error'>
                {errors.password && <span>{errors.password.message}</span>}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='password'>Nova senha</label>
              <div className='form-group-hide'>
                <Form.Control
                  ref={register({
                    required: 'Campo obrigatório.',
                    minLength: {
                      value: 6,
                      message: 'Sua senha deve conter no mínimo 6 digitos.',
                    },
                  })}
                  isInvalid={errors.new_password}
                  className='form-control input-default'
                  name='new_password'
                  type={hideNewPassword ? 'password' : 'text'}
                />
                <div
                  className='hide-icon'
                  onClick={() => setHideNewPassword(!hideNewPassword)}
                >
                  {hideNewPassword ? (
                    <i className='bx bx-hide'></i>
                  ) : (
                    <i className='bx bx-show-alt'></i>
                  )}
                </div>
              </div>
              <div className='form-error'>
                {errors.new_password && (
                  <span>{errors.new_password.message}</span>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <div className='form-group'>
              <label htmlFor='password'>Confirme a senha</label>
              <div className='form-group-hide'>
                <Form.Control
                  ref={register({
                    required: 'Campo obrigatório.',
                    validate: (value) =>
                      value === new_password.current ||
                      'As duas senhas devem ser iguais.',
                  })}
                  isInvalid={errors.confirm_password}
                  className='form-control input-default'
                  name='confirm_password'
                  type={hideConfirmPassword ? 'password' : 'text'}
                />
                <div
                  className='hide-icon'
                  onClick={() => setHideConfirmPassword(!hideConfirmPassword)}
                >
                  {hideConfirmPassword ? (
                    <i className='bx bx-hide'></i>
                  ) : (
                    <i className='bx bx-show-alt'></i>
                  )}
                </div>
              </div>
              <div className='form-error'>
                {errors.confirm_password && (
                  <span>{errors.confirm_password.message}</span>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <div className='mt-3'>
          <ButtonDS
            variant='primary'
            size='sm'
            type='submit'
            disabled={!isValid || requesting}
            outline
          >
            {!requesting ? 'Salvar e alterar senha' : 'salvando...'}
          </ButtonDS>
        </div>
      </form>
    </>
  );
};

export default Access;

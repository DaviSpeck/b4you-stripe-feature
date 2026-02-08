import { cpf } from 'cpf-cnpj-validator';
import { useEffect, useRef, useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import ReactInputMask from 'react-input-mask';
import { PatternFormat } from 'react-number-format';
import { Link, useHistory, useLocation } from 'react-router-dom';
import symbol from '../../images/logo-horizontal.png';
import ButtonDS from '../../jsx/components/design-system/ButtonDS.jsx';
import api from '../../providers/api.js';
import { useUser } from '../../providers/contextUser.js';
import './style.scss';
import { validatePhone } from '../../utils/validate-phone.js';

const Register = () => {
  const query = new URLSearchParams(useLocation().search);
  const invite = query.get('invite');

  const {
    register,
    handleSubmit,
    errors,
    watch,
    formState,
    setValue,
    control,
  } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const password = useRef();
  const email = useRef();
  password.current = watch('password', '');
  email.current = watch('email', '');
  const [requesting, setRequesting] = useState(false);
  const [registerReturn, setRegisterReturn] = useState(null);
  const [hidePassword, setHidePassword] = useState(true);

  const [checkTerms, setCheckTerms] = useState(false);

  const { setUser } = useUser();
  const history = useHistory();

  useEffect(() => {
    if (invite) {
      setValue('invite_code', invite, {
        shouldValidate: true,
      });
    }
  }, [invite]);

  const submitHandler = (data) => {
    setRequesting(true);
    const currentUrl = new URL(window.location.href);
    const type = currentUrl.searchParams.get('type');
    const url = type ? `/users?type=${encodeURIComponent(type)}` : '/users';

    api
      .post(url, data)
      .then((response) => {
        setRequesting(false);
        setUser(response.data);
        history.push('/onboarding');
      })
      .catch((err) => {
        setRequesting(false);
        setRegisterReturn(
          err.response
            ? err.response.data.message
              ? err.response.data.message
              : 'Dados inválidos.'
            : 'Dados inválidos.'
        );
      });

    return false;
  };

  const [inputHasContent, setInputHasContent] = useState({
    full_name: false,
    email: false,
    repeat_email: false,
    password: false,
    document_number: false,
    whatsapp: false,
  });

  const handleChange = (e) => {
    setInputHasContent({
      ...inputHasContent,
      [e.target.name]: e.target.value.trim().length > 0,
    });
  };

  return (
    <div className='reference1 reference2'>
      <div className='reference-bg'>
        <div className='register-image-wrapper'></div>

        <Container>
          <div id='page-register'>
            <div className='register-content'>
              <div className='row no-gutters'>
                <div className='col-xl-12'>
                  <div className='register-form'>
                    <img src={symbol} alt='symbol' className='logo' />
                    <div className='message'>Crie sua conta gratuitamente</div>
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

                    <form action='post' onSubmit={handleSubmit(submitHandler)}>
                      <div className='row'>
                        <div className='col-lg-12 form-group form-register mb-1'>
                          <label for='full_name' className='mobile-reference'>
                            Nome completo
                          </label>
                          <div
                            className={`form-group floating-label ${
                              inputHasContent.full_name ? 'input-content' : ''
                            }`}
                          >
                            <Form.Control
                              type='text'
                              className='form-control'
                              name='full_name'
                              isInvalid={errors.full_name}
                              ref={register({
                                required: 'Campo obrigatório.',
                                validate: (value) =>
                                  (value.split(' ').length > 1 &&
                                    value.split(' ')[1].length > 0) ||
                                  'Digite o nome completo',
                              })}
                              onChange={handleChange}
                            />
                            <label
                              for='full_name'
                              className='desktop-reference'
                            >
                              Nome completo
                            </label>
                            <div className='form-error'>
                              <span>{errors?.full_name?.message}</span>
                            </div>
                          </div>
                        </div>

                        <div className='col-lg-12 col-md-12 form-group form-register mb-1'>
                          <label className='mobile-reference'>E-mail</label>
                          <div
                            className={`form-group floating-label ${
                              inputHasContent.email ? 'input-content' : ''
                            }`}
                          >
                            <Form.Control
                              type='email'
                              className='form-control'
                              name='email'
                              isInvalid={errors.email}
                              aria-describedby='email_name_help'
                              ref={register({
                                required: 'Campo obrigatório.',
                                pattern: {
                                  value:
                                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                  message: 'Email incorreto.',
                                },
                              })}
                              onChange={handleChange}
                            />
                            <label className='desktop-reference'>E-mail</label>
                            <div className='form-error' id='email_name_help'>
                              {errors.email && (
                                <span>{errors.email.message}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='col-lg-12 col-md-12 form-group form-register mb-1'>
                          <label className='mobile-reference'>
                            Repetir e-mail
                          </label>

                          <div
                            className={`form-group floating-label ${
                              inputHasContent.repeat_email
                                ? 'input-content'
                                : ''
                            }`}
                          >
                            <Form.Control
                              type='text'
                              className='form-control'
                              name='repeat_email'
                              isInvalid={errors.repeat_email}
                              aria-describedby='repeat_email_name_help'
                              ref={register({
                                required: 'Campo obrigatório.',
                                validate: (value) =>
                                  value === email.current ||
                                  'Os dois e-mails devem ser iguais.',
                              })}
                              onChange={handleChange}
                            />
                            <label className='desktop-reference'>
                              Repetir e-mail
                            </label>
                          </div>

                          <div
                            className='form-error'
                            id='repeat_email_name_help'
                          >
                            {errors.repeat_email && (
                              <span>{errors.repeat_email.message}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='row'>
                        <div className='col-lg-12 col-md-12 form-group form-register mb-1'>
                          <label
                            htmlFor='password'
                            className='mobile-reference'
                          >
                            Senha
                          </label>

                          <div
                            className={`form-group form-group-hide floating-label ${
                              inputHasContent.password ? 'input-content' : ''
                            }`}
                          >
                            <Form.Control
                              type={hidePassword ? 'password' : 'text'}
                              className='form-control'
                              name='password'
                              isInvalid={errors.password}
                              aria-describedby='password_help'
                              ref={register({
                                required: 'Campo obrigatório.',
                                minLength: {
                                  value: 6,
                                  message:
                                    'Sua senha deve conter no mínimo 6 digitos.',
                                },
                              })}
                              onChange={handleChange}
                            />

                            <label
                              htmlFor='password'
                              className='desktop-reference'
                            >
                              Senha
                            </label>

                            <div
                              className='hide-icon'
                              onClick={() => setHidePassword(!hidePassword)}
                            >
                              <i
                                style={{
                                  marginBottom: `${
                                    errors.password ? '20px' : '0px'
                                  }`,
                                }}
                                className={`bx  bx-${
                                  hidePassword ? 'hide' : 'show-alt'
                                }`}
                              ></i>
                            </div>

                            <div className='form-error' id='password_help'>
                              {errors.password && (
                                <span>{errors.password.message}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='row'>
                        <div className='col-lg-12 col-md-12 form-group form-register mb-1'>
                          <label className='mobile-reference'>CPF</label>

                          <div
                            className={`form-group form-group-hide  floating-label ${
                              inputHasContent.document_number
                                ? 'input-content'
                                : ''
                            }`}
                          >
                            <ReactInputMask
                              type='text'
                              name='document_number'
                              isInvalid={errors.document_number}
                              ref={register({
                                required: 'Campo obrigatório.',
                                validate: (value) =>
                                  cpf.isValid(value) || 'CPF inválido',
                              })}
                              className={
                                !errors.document_number
                                  ? 'form-control'
                                  : 'form-control is-invalid'
                              }
                              mask='999.999.999-99'
                              onChange={handleChange}
                            />
                            <label className='desktop-reference'>CPF</label>
                            <div className='form-error'>
                              {errors.document_number && (
                                <span>{errors.document_number.message}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className='row'>
                        <div className='col-lg-12 col-md-12 form-group form-register mb-1'>
                          <label className='mobile-reference'>WhatsApp</label>
                          <div
                            className={`form-group form-group-hide  floating-label ${
                              inputHasContent.whatsapp ? 'input-content' : ''
                            }`}
                          >
                            <Controller
                              rules={{
                                required: 'Campo obrigatório.',
                                validate: (value) => {
                                  return validatePhone(value);
                                },
                              }}
                              render={({ onChange }) => (
                                <PatternFormat
                                  id='whatsapp'
                                  name='whatsapp'
                                  type='tel'
                                  onValueChange={(values) => {
                                    onChange(values.value);
                                    handleChange({
                                      target: {
                                        name: 'whatsapp',
                                        value: values.value,
                                      },
                                    });
                                  }}
                                  valueIsNumericString={true}
                                  className={
                                    errors.whatsapp
                                      ? 'form-control is-invalid'
                                      : 'form-control'
                                  }
                                  format='## ##### ####'
                                />
                              )}
                              name='whatsapp'
                              control={control}
                              defaultValue=''
                            />
                            <label className='desktop-reference'>
                              WhatsApp
                            </label>
                            {errors.whatsapp && (
                              <div className='form-error'>
                                <span>Telefone inválido.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='d-flex aling-items-center justify-content-center ml-1 terms-link'>
                        <input
                          type='checkbox'
                          id='terms'
                          name='terms'
                          value={checkTerms}
                          onClick={() => setCheckTerms(!checkTerms)}
                          className='pointer'
                        />
                        <label for='terms' className='mb-0 pointer'>
                          Eu li e aceito os
                          <a
                            href='https://b4you.com.br/termos'
                            target='_blank'
                            rel='noreferrer'
                          >
                            termos de serviço
                          </a>
                          da B4you
                        </label>
                      </div>

                      <ButtonDS
                        size='md'
                        type='submit'
                        disabled={requesting || !isValid || !checkTerms}
                        className={'m-auto btn-custom-color'}
                      >
                        {!requesting ? 'Cadastre-se' : 'aguarde...'}
                      </ButtonDS>

                      <div className='d-flex justify-content-center align-content-center mt-3'>
                        <div
                          className='custom-message mr-1'
                          style={{ marginTop: '2px' }}
                        >
                          Já tem uma conta?
                        </div>
                        <Link to='/acessar'>
                          <ButtonDS
                            size='md'
                            type='submit'
                            outline=''
                            variant='link'
                            style={{ marginTop: '2px' }}
                          >
                            Clique aqui
                          </ButtonDS>
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Register;

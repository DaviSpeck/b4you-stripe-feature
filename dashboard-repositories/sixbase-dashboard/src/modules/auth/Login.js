import { useEffect, useState } from 'react';
import { Alert, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import symbol from '../../images/logo-horizontal-header-white.svg';
import api from '../../providers/api.js';
import { useUser } from '../../providers/contextUser.js';
import useQuery from '../../providers/useQuery';
import { useCollaborator } from '../../providers/contextCollaborator.js';
import ButtonDS from '../../jsx/components/design-system/ButtonDS.jsx';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [inputHasContent, setInputHasContent] = useState({
    email: false,
    password: false,
  });
  const [requesting, setRequesting] = useState(false);
  const [loginReturn, setLoginReturn] = useState(null);
  const [forgotReturn, setForgotReturn] = useState(null);
  const [forgotEmail, setForgotEmail] = useState('');
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const { backoffice } = useQuery();

  const { setUser } = useUser();
  const { setCollaborator } = useCollaborator();
  const history = useHistory();

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setForgotReturn(null);
  };

  useEffect(() => {
    if (backoffice) {
      api.get(`/auth/backoffice?token=${backoffice}`).then((r) => {
        setUser(r.data);
        history.push('/');
      });
    }
  }, [backoffice]);

  const handleChange = (e) => {
    const newLoginData = { ...loginData };
    newLoginData[e.target.name] = e.target.value;
    setLoginData(newLoginData);

    setInputHasContent({
      ...inputHasContent,
      [e.target.name]: e.target.value.trim().length > 0,
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();

    setRequesting(true);
    setLoginReturn(null);

    let device = localStorage.getItem('device_id');

    if (!device) {
      device = crypto.randomUUID();
      localStorage.setItem('device_id', device);
    }
    
    api
      .post('/auth/login', { ...loginData, device_id: device })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem('user_token', response.data.token);
        }

        setUser(response.data);
        setCollaborator(null);
        setRequesting(false);

        setTimeout(() => {
          if (!response.data.onboarding_completed) {
            history.push('/onboarding');
            return;
          }

          let redirectPath = localStorage.getItem('redirectPath');
          if (redirectPath && redirectPath !== '/acessar') {
            localStorage.removeItem('redirectPath');
          } else {
            redirectPath = '/';
          }

          history.push(redirectPath);
        }, 0);
      })
      .catch((err) => {
        setRequesting(false);
        if (err.response && err.response.status === 429)
          return setLoginReturn(
            `Número de tentativas excedido, tente novamente em ${err.response.data.message.replace(
              /\D/g,
              ''
            )} segundos`
          );
        setLoginReturn('E-mail ou senha incorretos.');
      });
  };

  const forgotPassword = () => {
    const fields = {
      email: forgotEmail,
    };
    setForgotReturn(null);
    setIsLoading(true);
    api
      .post('auth/forgotpassword', fields)
      .then((response) => {
        setIsLoading(false);

        if (response.data.success) {
          setForgotReturn('success');
          setForgotEmail('');
        } else {
          setForgotReturn('not-found');
        }
      })
      .catch(() => {
        setIsLoading(false);

        setForgotReturn('error');
      });
  };

  const valid = () => {
    if (loginData.email.length === 0) {
      return false;
    }

    if (loginData.password.length === 0) {
      return false;
    }

    return true;
  };

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  return (
    <div id='reference' className='reference1 reference2'>
      <div className='reference-bg reference-bg-login'>
        <div className='register-image-wrapper login-image-wrapper'></div>
        <Container>
          <div id='page-register' className='authincation'>
            <div className='wrap-phrase'>
              <div>Perfeita</div>
              <div>Para o seu Produto Físico</div>
              <div>Para o seu Produto Digital</div>
              <div>
                Para <span className='bold'>VOCÊ</span>
              </div>
            </div>
            <div className='register-content'>
              <div className='row no-gutters'>
                <div className='col-xl-12'>
                  <div className='auth-form'>
                    <img className='logo' src={symbol} alt='symbol' />
                    <div className='message'>ACESSE SUA CONTA</div>
                    {loginReturn && (
                      <div
                        className='alert alert-danger alert-xs'
                        style={{
                          padding: '.75rem 1.0em',
                          fontSize: 14,
                          border: '1px solid #f3d1d9',
                        }}
                      >
                        {loginReturn}
                      </div>
                    )}
                    <form
                      action=''
                      onSubmit={submitHandler}
                      className='form-login-page'
                    >
                      <div className='desktop-reference'>
                        <div
                          className={`form-group floating-label ${inputHasContent.email ? 'input-content' : ''
                            }`}
                        >
                          <Form.Control
                            type='email'
                            name='email'
                            onChange={handleChange}
                          />
                          <label htmlFor='email'>
                            <i className='bx bxs-envelope mr-2'></i>
                            E-mail
                          </label>
                        </div>

                        <div
                          className={`form-group floating-label ${inputHasContent.password ? 'input-content' : ''
                            }`}
                        >
                          <div className='form-group-hide'>
                            <Form.Control
                              name='password'
                              onChange={handleChange}
                              type={hidePassword ? 'password' : 'text'}
                            />
                            <label htmlFor='password'>
                              <i className='bx bxs-lock-alt mr-2'></i>
                              Senha
                            </label>
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
                        </div>
                      </div>
                      <div className='mobile-reference form-input'>
                        <label htmlFor='email'>E-mail</label>
                        <div
                          className={`form-group ${inputHasContent.email ? 'input-content' : ''
                            }`}
                        >
                          <Form.Control
                            type='email'
                            name='email'
                            onChange={handleChange}
                            placeholder='Digite seu e-mail...'
                          />
                        </div>

                        <div
                          className={`form-group ${inputHasContent.password ? 'input-content' : ''
                            }`}
                        >
                          <label htmlFor='password'>Senha</label>
                          <div className='form-group-hide'>
                            <Form.Control
                              name='password'
                              onChange={handleChange}
                              type={hidePassword ? 'password' : 'text'}
                              placeholder='Digite sua senha...'
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
                        </div>
                      </div>

                      <small
                        onClick={handleShow}
                        style={{ cursor: 'pointer' }}
                        className='forget-pass'
                      >
                        Esqueceu sua senha?
                      </small>

                      <ButtonDS
                        size='md'
                        type='submit'
                        disabled={!valid() || requesting}
                        className={'m-auto btn-custom-color'}
                      >
                        {!requesting ? 'Entrar Agora' : 'Aguarde...'}
                      </ButtonDS>

                      <div className='d-flex justify-content-center align-content-center mt-3'>
                        <div
                          className='custom-message mr-1'
                          style={{ marginTop: '2px' }}
                        >
                          Ainda não tem uma conta?
                        </div>
                        <Link to='/cadastrar'>
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
        <Modal
          show={show}
          centered
          onHide={handleClose}
          id='modal-password-help'
        >
          <Modal.Header closeButton>
            <h5 className='mb-0'>Recuperar Senha</h5>
          </Modal.Header>
          <Modal.Body className=''>
            <div>
              {forgotReturn == 'success' && (
                <Alert variant='success'>
                  E-mail de recuperação enviado com sucesso.
                </Alert>
              )}
              {forgotReturn == 'not-found' && (
                <Alert variant='danger'>
                  Não encontramos um cadastro com este e-mail.
                </Alert>
              )}
              {forgotReturn == 'error' && (
                <Alert variant='danger'>
                  Erro, se o problema persistir entre em contato com o suporte.
                </Alert>
              )}
            </div>
            <p>
              Informe o seu e-mail de cadastro abaixo para que possamos lhe
              enviar um link para criar uma nova senha para sua conta.
            </p>
            <div className='d-block justify-content-center mt-4 '>
              <Form.Control
                placeholder='Seu e-mail'
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                }}
              />

              <Row className='mt-2'>
                <Col className='d-flex justify-content-end'>
                  <ButtonDS
                    variant={isLoading ? 'light' : 'primary'}
                    disabled={!validateEmail(forgotEmail) || isLoading}
                    onClick={forgotPassword}
                    size='sm'
                  >
                    {!isLoading ? (
                      'Recuperar Senha'
                    ) : (
                      <i className='bx bx-loader-alt bx-spin'></i>
                    )}
                  </ButtonDS>
                </Col>
              </Row>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Login;

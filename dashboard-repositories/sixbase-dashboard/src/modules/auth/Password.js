import { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../../providers/api';
import useQuery from '../../providers/useQuery';
import './style.scss';
import symbol from '../../images/logo-horizontal.png';

function Password() {
  const [fieldPassword, setFieldPassword] = useState('');
  const [fieldPassword2, setFieldPassword2] = useState('');
  const [passwordForce, setPasswordForce] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [warning, setWarning] = useState(null);
  const [tokenValid, setTokenValid] = useState(null);
  const [userName, setUserName] = useState(null);
  const { token } = useParams();
  const { redirect_url } = useQuery();

  const [hidePassword, setHidePassword] = useState(true);
  const [hidePassword2, setHidePassword2] = useState(true);

  const CheckPasswordStrength = (password) => {
    var password_strength = document.getElementById('password_strength');

    //if textBox is empty
    if (password.length == 0) {
      password_strength.innerHTML = '';
      return;
    }

    //Regular Expressions
    var regex = new Array();
    regex.push('[A-Z]'); //For Uppercase Alphabet
    regex.push('[a-z]'); //For Lowercase Alphabet
    regex.push('[0-9]'); //For Numeric Digits
    regex.push('[$@$!%*#?&]'); //For Special Characters

    var passed = 0;

    //Validation for each Regular Expression
    for (var i = 0; i < regex.length; i++) {
      if (new RegExp(regex[i]).test(password)) {
        passed++;
      }
    }

    //Validation for Length of Password
    if (passed > 2 && password.length > 8) {
      passed++;
    }

    //Display of Status
    let color = '';
    let passwordStrength = '';
    switch (passed) {
      case 0:
        break;
      case 1:
        passwordStrength = 'Fraca 😔';
        color = '#D33D3D';
        break;
      case 2:
        passwordStrength = 'Boa 🙂';
        color = '#D37C3D';
        break;
      case 3:
        passwordStrength = 'Forte 😁';
        color = '#3DD34C';
        break;
      case 4:
        passwordStrength = 'Muito forte 😎';
        color = '#1DA62B';
        break;
    }

    setPasswordForce({
      text: passwordStrength,
      color: color,
    });
  };

  useEffect(() => {
    api
      .get('/auth/validate/token/' + token)
      .then((response) => {
        if (response.data == false) {
          // token invalido
          setTokenValid(false);
        } else {
          setTokenValid(true);
          setUserName(response.data.full_name);
        }
      })
      .catch(() => {
        setTokenValid(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setWarning(null);

    const fields = {
      password: fieldPassword,
      token,
    };

    api
      .post('/auth/change/password', fields)
      .then(() => {
        let nextURL = window.location.origin;
        if (redirect_url) {
          nextURL = `${nextURL}${redirect_url}`;
        }
        window.location.href = nextURL;
      })
      .catch((err) => {
        setWarning(err.response.data.message);
      })
      .finally(() => setIsLoading(false));
  };

  const formValid = () => {
    if (fieldPassword.length < 6) {
      return false;
    }
    if (fieldPassword !== fieldPassword2) {
      return false;
    }

    return true;
  };

  return (
    <>
      <section id='auth'>
        <div className='authincation'>
          <div className='auth-content'>
            <div className='row no-gutters'>
              <div className='col-xl-12'>
                <div className='auth-form'>
                  <img
                    className='logo mb-3'
                    src={symbol}
                    alt='B4you'
                    style={{ width: 126 }}
                  />
                  {tokenValid && (
                    <div className='message'>
                      Olá {userName}, redefina sua senha!
                    </div>
                  )}
                  {tokenValid == null ? (
                    <div className='validating'>
                      <i className='bx bx-loader-alt bx-spin'></i>
                      <span>Aguarde...</span>
                    </div>
                  ) : (
                    <>
                      {tokenValid === false ? (
                        <div className='invalid'>
                          <p className='mb-4'>
                            <b className='text-danger '>Link Inválido</b>
                          </p>
                          <p>Este link de acesso expirou.</p>
                          <p>
                            Para acessar sua plataforma, entre em contato com o
                            suporte para requisitar um novo link de acesso.
                          </p>
                          <a href='https://ajuda.b4you.com.br'>Suporte B4you</a>
                        </div>
                      ) : (
                        <>
                          <form onSubmit={handleSubmit}>
                            <div className='uk-form-group'>
                              {warning && (
                                <Alert variant='danger'>{warning}</Alert>
                              )}
                            </div>

                            <label htmlFor='password'>Senha</label>
                            <div
                              className='form-group'
                              style={{ position: 'relative' }}
                            >
                              <Form.Control
                                type={hidePassword ? 'password' : 'text'}
                                name='password'
                                onChange={(e) => {
                                  setFieldPassword(e.target.value);
                                  CheckPasswordStrength(e.target.value);
                                }}
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

                            <label htmlFor='email'>Confirmar senha</label>
                            <div
                              className='form-group'
                              style={{ position: 'relative' }}
                            >
                              <Form.Control
                                type={hidePassword2 ? 'password' : 'text'}
                                name='password2'
                                onChange={(e) => {
                                  setFieldPassword2(e.target.value);
                                }}
                              />
                              <div
                                className='hide-icon'
                                onClick={() => setHidePassword2(!hidePassword2)}
                              >
                                {hidePassword2 ? (
                                  <i className='bx bx-hide'></i>
                                ) : (
                                  <i className='bx bx-show-alt'></i>
                                )}
                              </div>
                            </div>

                            {passwordForce && (
                              <div>
                                Força da senha:{' '}
                                <span
                                  id='password_strength'
                                  style={{
                                    color: passwordForce.color,
                                    fontWeight: 600,
                                  }}
                                >
                                  {passwordForce.text}
                                </span>
                              </div>
                            )}

                            <div className='mt-3 uk-flex-middle uk-grid uk-grid-small'>
                              <div className='uk-width-1-1@s'>
                                <Button
                                  type='submit'
                                  className='btn btn-default btn-block btn-re-register'
                                  disabled={!formValid() || isLoading}
                                >
                                  {!isLoading ? (
                                    'Registrar nova senha'
                                  ) : (
                                    <i className='bx bx-loader-alt bx-spin'></i>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </form>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Password;

import { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { useSkin } from '../utility/hooks/useSkin';
import useJwt from '@src/auth/jwt/useJwt';

import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';

import { handleLogin } from '@store/authentication';

import { AbilityContext } from '@src/utility/context/Can';

import InputPasswordToggle from '@components/input-password-toggle';

import { getHomeRouteForLoggedInUser } from '../auth/utils';

import {
  Row,
  Col,
  CardTitle,
  CardText,
  Form,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';
import themeConfig from '@configs/themeConfig';

import '@styles/react/pages/page-authentication.scss';
import loginDark from '@src/assets/images/pages/login-v2-dark.svg';
import loginLight from '@src/assets/images/pages/login-v2.svg';

const defaultValues = {
  password: '',
  email: '',
};

const LoginCover = () => {
  const { skin } = useSkin();
  const dispatch = useDispatch();
  const history = useHistory();
  const ability = useContext(AbilityContext);
  const [loginError, setLoginError] = useState('');
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const onSubmit = (data) => {
    if (Object.values(data).every((field) => field.length > 0)) {
      setLoginError('');
      useJwt
        .login({ email: data.email, password: data.password })
        .then((res) => {
          const data = { ...res.data.user, accessToken: res.data.accessToken };
          dispatch(handleLogin(data));
          ability.update(res.data.user.abilities);
          history.push(getHomeRouteForLoggedInUser('admin'));
        })
        .catch((err) => {
          console.log(err);
          if (
            err.response &&
            err.response.status === 403 &&
            err.response.data?.code === 'ACCOUNT_DEACTIVATED'
          ) {
            setLoginError(err.response.data.message);
          } else {
            setLoginError('Email ou senha inválidos. Tente novamente.');
          }
        });
    } else {
      for (const key in data) {
        if (data[key].length === 0) {
          setError(key, {
            type: 'manual',
          });
        }
      }
    }
  };

  const source = skin === 'dark' ? loginDark : loginLight;

  return (
    <div className="auth-wrapper auth-cover">
      <Row className="auth-inner m-0">
        <Link className="brand-logo" to="/" onClick={(e) => e.preventDefault()}>
          <img
            src={themeConfig.app.appLogoImage}
            alt="logo"
            style={{ maxWidth: '36px' }}
          />
          <h2 className="brand-text text-primary ms-1">B4you | Backoffice</h2>
        </Link>
        <Col className="d-none d-lg-flex align-items-center p-5" lg="8" sm="12">
          <div className="w-100 d-lg-flex align-items-center justify-content-center px-5">
            <img className="img-fluid" src={source} alt="Login Cover" />
          </div>
        </Col>
        <Col
          className="d-flex align-items-center auth-bg px-2 p-lg-5"
          lg="4"
          sm="12"
        >
          <Col className="px-xl-2 mx-auto" sm="8" md="6" lg="12">
            <CardTitle tag="h2" className="fw-bold mb-1">
              Bem vindo ao Backoffice da B4YOU! 👋
            </CardTitle>
            <CardText className="mb-2">
              Faça login na sua conta para começar a aventura!
            </CardText>
            <Form
              className="auth-login-form mt-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              {loginError && (
                <Alert color="danger" className="mb-2">
                  {loginError}
                </Alert>
              )}
              <div className="mb-1">
                <Label className="form-label" for="login-email">
                  Email
                </Label>
                <Controller
                  id="loginEmail"
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      autoFocus
                      type="email"
                      placeholder="john@example.com"
                      invalid={errors.email && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-1">
                <div className="d-flex justify-content-between">
                  <Label className="form-label" for="login-password">
                    Senha
                  </Label>
                  {/* <Link to="/pages/forgot-password-cover">
                    <small>Esqueceu sua senha?</small>
                  </Link> */}
                </div>
                <Controller
                  id="password"
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <InputPasswordToggle
                      className="input-group-merge"
                      invalid={errors.password && true}
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="form-check mb-1">
                <Input type="checkbox" id="remember-me" />
                <Label className="form-check-label" for="remember-me">
                  Lembre-me
                </Label>
              </div>
              <Button type="submit" color="primary" block>
                Entrar
              </Button>
            </Form>
          </Col>
        </Col>
      </Row>
    </div>
  );
};

export default LoginCover;

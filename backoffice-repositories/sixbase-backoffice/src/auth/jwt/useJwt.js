// ** Core JWT Import
import UseJwt from '@src/@core/auth/jwt/useJwt';

const { jwt } = UseJwt({
  loginEndpoint: `${
    process.env.REACT_APP_BASE_URL || 'https://api-backoffice.b4you.com.br'
  }/api/auth`,
});

export default jwt;

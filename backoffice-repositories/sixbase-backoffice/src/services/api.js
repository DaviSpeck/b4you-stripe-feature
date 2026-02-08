import axios from 'axios';
import jwtDefaultConfig from '@src/@core/auth/jwt/jwtDefaultConfig';
import { store } from '@store/store';
import { handleLogout } from '../redux/authentication';
const api = axios.create({
  baseURL: `${process.env.REACT_APP_BASE_URL || 'https://api-backoffice.b4you.com.br'}/api`,});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(
      jwtDefaultConfig.storageTokenKeyName,
    );

    if (accessToken) {
      config.headers.Authorization = `${
        jwtDefaultConfig.tokenType
      } ${JSON.parse(accessToken)}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      return store.dispatch(handleLogout());
    }

    return Promise.reject(error);
  },
);

export { api };

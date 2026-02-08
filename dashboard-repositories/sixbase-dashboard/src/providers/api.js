import axios from 'axios';

let endpoint = 'https://api-b4.b4you.com.br';
let host = window.location.host;

function getBaseUrl() {
  try {
    return process?.env?.REACT_APP_BASE_URL;
  } catch {
    return null;
  }
}

if (getBaseUrl()) {
  endpoint = getBaseUrl();
} else if (host.includes('sandbox')) {
  endpoint = 'https://api-b4-sandbox.b4you.com.br';
} else if (host.includes('dash.b4you.com.br')) {
  endpoint = 'https://api-b4.b4you.com.br';
} else {
  endpoint = 'https://api-b4-sandbox.b4you.com.br';
}

const api = axios.create({
  baseURL: `${endpoint}/api/dashboard`,
  withCredentials: true,
});

export const apiCheckout = axios.create({
  baseURL: `${endpoint}/api/checkout`,
  withCredentials: true,
});

export const apiMembership = axios.create({
  baseURL: `${endpoint}/api/membership`,
  withCredentials: true,
});

export const apiEndpoint = endpoint;
export default api;
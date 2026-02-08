import axios from 'axios';

let endpoint = null;
let host = window.location.host;

function getBaseUrl() {
  try {
    // eslint-disable-next-line no-undef
    return process?.env?.REACT_APP_BASE_URL;
  } catch {
    return 'http://localhost:5501';
  }
}

if (getBaseUrl()) {
  endpoint = getBaseUrl();
}else if (host.includes('sandbox')) {
  endpoint = 'https://api-checkout-sandbox.b4you.com.br';
} else if (
  host.includes('checkout.b4you.com.br') ||
  host.includes('seguro.bluuesleep.com.br') ||
  host.includes('seguro.bluue.com.br') ||
  host.includes('seguro.usebigboom.com.br') ||
  host.includes('seguro.rejuderme.com.br') ||
  host.includes('seguro.lumminagest.com.br') ||
  host.includes('seguro.multicolageno.com.br') ||
  host.includes('seguro.dreamscoffee.com.br') ||
  host.includes('seguro.greemy.com.br') ||
  host.includes('seguro.dreamsburn.com.br') ||
  host.includes('seguro.lummibrazil.com.br') ||
  host.includes('seguro.lipomonster.com.br') ||
  host.includes('checkout.avenaplus.com.br') ||
  host.includes('seguro.perfumeshopping.com.br') ||
  host.includes('seguro.nutriccionforlife.com.br') ||
  host.includes('seguro.nandaintimus.com.br') ||
  host.includes('seguro.sejaziva.com.br') ||
  host.includes('pagamento.sejaziva.com.br') ||
  host.includes('seguro.omounjaronatural.com.br')
) {
  endpoint = 'https://api-checkout.b4you.com.br';
} else {
  endpoint = 'https://api-checkout-sandbox.b4you.com.br';
}

const api = axios.create({
  baseURL: `${endpoint}/api/checkout`,
  withCredentials: true,
});

export const apiEndpoint = endpoint;
export default api;

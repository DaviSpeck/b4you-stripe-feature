import axios from 'axios';
// import pjson from '../../package.json' assert { type: 'json' };

export default async function consultarCNPJ(cnpj, token) {
  if (!cnpj) throw new Error('CNPJ não informado');

  cnpj = cnpj.replace(/[^0-9]/g, '');

  let url = token
    ? `https://comercial.cnpj.ws/cnpj/${cnpj}?token=${token}`
    : `https://publica.cnpj.ws/cnpj/${cnpj}`;

  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'consultar-cnpj/1.0.0' },
    });
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}

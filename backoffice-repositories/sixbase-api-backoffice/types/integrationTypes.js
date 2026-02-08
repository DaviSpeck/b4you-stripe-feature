const integrationTypes = [
  {
    id: 1,
    order: '1',
    name: 'Active Campaign',
    website: 'https://www.activecampaign.com/br/',
    logo: 'https://www.activecampaign.com/site/assets/logo-white.svg',
    active: true,
  },
  {
    id: 2,
    order: '2',
    name: 'LeadLovers',
    website: 'https://www.leadlovers.com/',
    logo: 'https://blob.contato.io/machine-files/all-images/leadlovers-marca.svg',
    active: true,
  },
  {
    id: 3,
    order: '3',
    name: 'eNotas',
    website: 'https://enotas.com.br/',
    logo: 'https://enotas.com.br/wp-content/themes/enotas-4.3/ativos/img/logos/enotas.png?v=2',
    active: true,
    key: 'enotas',
  },
  {
    id: 4,
    order: '4',
    name: 'MailChimp',
    website: 'https://mailchimp.com/pt-br/',
    logo: 'https://cdn.ciroapp.com/wp-content/uploads/2021/05/Mailchimp-logo.png',
    active: true,
    key: 'mailchimp',
  },
  {
    id: 5,
    order: '5',
    name: 'HotzApp',
    website: 'https://hotzapp.me/',
    logo: 'https://hotzapp.me/images/logo.png',
    active: true,
    key: 'hotzapp',
  },
  {
    id: 6,
    order: '6',
    name: 'Webhooks',
    website: 'https://hotzapp.me/',
    logo: 'https://hotzapp.me/images/logo.png',
    active: true,
    key: 'webhooks',
  },
  {
    id: 7,
    order: '7',
    name: 'Voxuy',
    website: 'https://www.voxuy.com/',
    logo: 'https://www.voxuy.com/assets/img/logo-new.svg',
    active: true,
    key: 'voxuy',
  },
];

const findIntegrationType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = integrationTypes.find((s) => s[parameter] === type);
  return selectedType;
};

const findIntegrationTypeByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = integrationTypes.find((s) => s[parameter] === type);
  return selectedType;
};

module.exports = {
  integrationTypes,
  findIntegrationType,
  findIntegrationTypeByKey,
};

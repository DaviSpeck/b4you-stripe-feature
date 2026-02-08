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
  {
    id: 8,
    order: '8',
    name: 'SellFlux',
    website: 'https://sellflux.app',
    logo: 'https://agenciars.com.br/wp-content/uploads/2022/06/Sellflux-img.jpg',
    active: true,
    key: 'sellflux',
  },
  {
    id: 9,
    order: '9',
    name: 'Cademí',
    website: 'https://cademi.com.br',
    logo: 'https://cademi.com.br/wp-content/uploads/2020/06/logo.svg',
    active: true,
    key: 'cademi',
  },
  {
    id: 10,
    order: '10',
    name: 'Bling',
    website: 'https://www.bling.com.br',
    logo: 'https://www.vancecontabil.com.br/wp-content/uploads/2021/06/logo-bling-png-1.png',
    active: true,
    key: 'bling',
  },
  {
    id: 11,
    order: '11',
    name: 'Bling Transporte',
    website: 'https://www.bling.com.br',
    logo: 'https://www.vancecontabil.com.br/wp-content/uploads/2021/06/logo-bling-png-1.png',
    active: true,
    key: 'blingshipping',
  },
  {
    id: 12,
    order: '12',
    name: 'HSDS',
    website: 'https://hsds.io/',
    logo: 'https://hsds.io/wp-content/uploads/2022/04/Co%CC%81pia-de-Co%CC%81pia-de-Co%CC%81pia-de-DS-e1649714245175.png',
    active: true,
    key: 'hsds',
  },
  {
    id: 13,
    order: '13',
    name: 'Invision',
    website: 'https://invisioncommunity.com',
    logo: 'https://play-lh.googleusercontent.com/QrU3CG-wu6vw3NX8zZVVe2wbcfRcscuF9fKKWH2z1tVgjDNiDWxekpTvH2TBeWuUjqY=w240-h480',
    active: true,
    key: 'invision',
  },
  {
    id: 14,
    order: '14',
    name: 'Memberkit',
    website: 'https://memberkit.com.br',
    logo: 'https://static.wixstatic.com/media/07fb26_b3252f9edf4e45fe8d92e77684d73f5f~mv2.png/v1/crop/x_0,y_92,w_300,h_117/fill/w_339,h_132,al_c,lg_1,q_85,enc_auto/member-kit.png',
    active: true,
    key: 'memberkit',
  },
  {
    id: 15,
    order: '15',
    name: 'Notazz',
    website: 'https://notazz.com/',
    logo: 'https://www.negociosemmente.com.br/wp-content/uploads/2022/06/Logos-Ferramentas-e-Cursos-2.png',
    active: true,
    key: 'notazz',
  },
];

export const findIntegrationType = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'name' : 'id';
  const selectedType = integrationTypes.find((s) => s[parameter] === type);
  return selectedType;
};

export const findIntegrationTypeByKey = (type) => {
  if (!type) throw new Error('type must be provided');
  if (typeof type !== 'string' && typeof type !== 'number')
    throw new Error('type must be string or number');
  const parameter = typeof type === 'string' ? 'key' : 'id';
  const selectedType = integrationTypes.find((s) => s[parameter] === type);
  return selectedType;
};

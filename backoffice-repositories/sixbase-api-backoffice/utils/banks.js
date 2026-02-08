const banks = [
  { value: '001', label: 'Banco do Brasil S.A.', ispb: '00000000' },
  { value: '003', label: 'Banco da Amazônia S.A.', ispb: '04902979' },
  {
    value: '021',
    label: 'BANESTES S.A. Banco do Estado do Espírito Santo',
    ispb: '28127603',
  },
  { value: '024', label: 'Banco Bandepe S.A.', ispb: '10866788' },
  { value: '029', label: 'Banco Itaú Consignado S.A.', ispb: '33885724' },
  { value: '033', label: 'BANCO SANTANDER (BRASIL) S.A.', ispb: '90400888' },
  { value: '036', label: 'Banco Bradesco BBI S.A.', ispb: '06271464' },
  { value: '037', label: 'Banco do Estado do Pará S.A.', ispb: '04913711' },
  {
    value: '041',
    label: 'Banco do Estado do Rio Grande do Sul S.A.',
    ispb: '92702067',
  },
  { value: '047', label: 'Banco do Estado de Sergipe S.A.', ispb: '13009717' },
  { value: '063', label: 'Banco Bradescard S.A.', ispb: '04184779' },
  { value: '070', label: 'BRB - Banco de Brasília S.A.', ispb: '00000208' },
  { value: '074', label: 'Banco J. Safra S.A.', ispb: '03017677' },
  { value: '077', label: 'Banco Inter S.A.', ispb: '00416968' },
  {
    value: '084',
    label: 'UNIPRIME DO BRASIL - COOPERATIVA DE CRéDITO LTDA.',
    ispb: '02398976',
  },
  {
    value: '085',
    label: 'Cooperativa Central de Crédito - Ailos',
    ispb: '05463212',
  },
  {
    value: '099',
    label:
      'UNIPRIME CENTRAL - CENTRAL INTERESTADUAL DE COOPERATIVAS DE CREDITO LTDA.',
    ispb: '03046391',
  },
  {
    value: '102',
    label:
      'XP INVESTIMENTOS CORRETORA DE CÂMBIO,TÍTULOS E VALORES MOBILIÁRIOS S/A',
    ispb: '2332886',
  },
  { value: '104', label: 'Caixa Econômica Federal', ispb: '00360305' },
  {
    value: '133',
    label:
      'CONFEDERAÇÃO NACIONAL DAS COOPERATIVAS CENTRAIS DE CRÉDITO E ECONOMIA FAMILIAR E',
    ispb: '10398952',
  },
  {
    value: '157',
    label: 'ICAP do Brasil Corretora de Títulos e Valores Mobiliários Ltda.',
    ispb: '09105360',
  },
  {
    value: '159',
    label: 'Casa do Crédito S.A. Sociedade de Crédito ao Microempreendedor',
    ispb: '05442029',
  },
  { value: '184', label: 'Banco Itaú BBA S.A.', ispb: '17298092' },
  { value: '197', label: 'Stone Pagamentos S.A.', ispb: '16501555' },
  { value: '208', label: 'Banco BTG Pactual S.A.', ispb: '30306294' },
  { value: '212', label: 'Banco Original S.A.', ispb: '92894922' },
  { value: '218', label: 'Banco BS2 S.A.', ispb: '71027866' },
  { value: '237', label: 'Banco Bradesco S.A.', ispb: '60746948' },
  { value: '241', label: 'BANCO CLASSICO S.A.', ispb: '31597552' },
  { value: '254', label: 'PARANÁ BANCO S.A.', ispb: '14388334' },
  {
    value: '260',
    label: 'NU PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO',
    ispb: '18236120',
  },
  { value: '290', label: 'Pagseguro Internet S.A.', ispb: '08561701' },
  { value: '318', label: 'Banco BMG S.A.', ispb: '61186680' },
  {
    value: '323',
    label: 'MERCADOPAGO.COM REPRESENTACOES LTDA.',
    ispb: '10573521',
  },
  {
    value: '332',
    label: 'Acesso Soluções de Pagamento S.A.',
    ispb: '13140088',
  },
  { value: '335', label: 'Banco Digio S.A.', ispb: '27098060' },
  { value: '336', label: 'Banco C6 S.A.', ispb: '31872495' },
  {
    value: '340',
    label: 'Super Pagamentos e Administração de Meios Eletrônicos S.A.',
    ispb: '09554480',
  },
  { value: '341', label: 'ITAÚ UNIBANCO S.A.', ispb: '60701190' },
  {
    value: '343',
    label:
      'FFA SOCIEDADE DE CRÉDITO AO MICROEMPREENDEDOR E À EMPRESA DE PEQUENO PORTE LTDA.',
    ispb: '24537861',
  },
  { value: '348', label: 'Banco XP S.A.', ispb: '33264668' },
  {
    value: '358',
    label: 'MIDWAY S.A. - CRÉDITO, FINANCIAMENTO E INVESTIMENTO',
    ispb: '09464032',
  },
  {
    value: '380',
    label: 'PICPAY INSTITUIçãO DE PAGAMENTO S.A.',
    ispb: '22896431',
  },
  {
    value: '403',
    label: 'CORA SOCIEDADE DE CRÉDITO DIRETO S.A.',
    ispb: '37880206',
  },
  {
    value: '426',
    label: 'Banco Itaucard S/A',
    ispb: '17192451',
  },
  { value: '473', label: 'Banco Caixa Geral - Brasil S.A.', ispb: '33466988' },

  { value: '623', label: 'Banco Pan S.A.', ispb: '59285411' },
  { value: '626', label: 'BANCO C6 CONSIGNADO S.A.', ispb: '61348538' },
  { value: '637', label: 'BANCO SOFISA S.A.', ispb: '60889128' },
  { value: '652', label: 'Itaú Unibanco Holding S.A.', ispb: '60872504' },
  { value: '745', label: 'Banco Citibank S.A.', ispb: '33479023' },
  { value: '746', label: 'Banco Modal S.A.', ispb: '30723886' },
  { value: '748', label: 'BANCO COOPERATIVO SICREDI S.A.', ispb: '01181521' },
  {
    value: '756',
    label: 'BANCO COOPERATIVO SICOOB S.A. - BANCO SICOOB',
    ispb: '02038232',
  },
  { value: '757', label: 'BANCO KEB HANA DO BRASIL S.A.', ispb: '02318507' },
  {
    value: '758',
    label: 'BANCO ITAUCARD S.A',
    ispb: '17192451',
  },
];

const findBank = (type) => {
  if (!type) return null;
  if (typeof type !== 'string') throw new Error('type must be string');
  return banks.find((s) => s.value === type);
};

module.exports = {
  banks,
  findBank,
};

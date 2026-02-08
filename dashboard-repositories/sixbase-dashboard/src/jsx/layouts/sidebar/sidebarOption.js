import {
  BiBarChartAlt,
  BiCustomize,
  BiFile,
  BiGroup,
  BiHelpCircle,
  BiHomeSmile,
  BiMoneyWithdraw,
  BiPurchaseTagAlt,
  BiStoreAlt,
  BiUserPlus,
  BiWalletAlt,
  BiCart
} from 'react-icons/bi';

export const SidebarOptions = [
  { label: 'Dashboard', icon: <BiHomeSmile className='icon' />, redirect: '/' },
  // {
  //   label: 'Social4You',
  //   icon: <BiUserVoice className='icon' />,
  //   children: [
  //     { label: 'Central do Produtor', redirect: '' },
  //     { label: 'Espaço Creator', redirect: '' },
  //   ],
  // },
  {
    label: 'Produtos',
    icon: <BiPurchaseTagAlt className='icon' />,
    redirect: '/produtos',
  },
  {
    label: 'Vitrine',
    icon: <BiStoreAlt className='icon' />,
    redirect: '/vitrine',
  },
  {
    label: 'Financeiro',
    icon: <BiWalletAlt className='icon' />,
    redirect: '/financeiro',
  },
  {
    label: 'Vendas',
    icon: <BiMoneyWithdraw className='icon' />,
    redirect: '/vendas',
  },
  {
    label: 'Relatórios',
    icon: <BiBarChartAlt className='icon' />,
    children: [
      { label: 'Assinaturas', redirect: '/assinaturas' },
      { label: 'Carrinho Abandonado', redirect: '/carrinho-abandonado' },
      //{ label: 'CallCenter', redirect: '/callcenter' },
      { label: 'Cupons', redirect: '/desempenho-cupons' },
      { label: 'Produtos', redirect: '/ranking-produtos' },
    ],
  },
  {
    label: 'Afiliados',
    icon: <BiGroup className='icon' />,
    children: [
      { label: 'Meus Afiliados', redirect: '/afiliados' },
      { label: 'Afiliação', redirect: '/afiliacoes' },
      { label: 'Ranking', redirect: '/ranking-afiliados' },
    ],
  },
  {
    label: 'Colaborações',
    icon: <BiUserPlus className='icon' />,
    children: [
      { label: 'Colaborações', redirect: '/colaboracoes' },
      { label: 'Colaboradores', redirect: '/colaboradores' },
      { label: 'Coproduções', redirect: '/coproducoes' },
      { label: 'Fornecedores', redirect: '/fornecedores' },
      { label: 'Gerentes', redirect: '/gerentes' },
    ],
  },
  {
    label: 'Notas Fiscais',
    icon: <BiFile className='icon' />,
    redirect: '/notas-fiscais',
  },
  { label: 'Apps', icon: <BiCustomize className='icon' />, redirect: '/apps' },
  {
    label: 'Ajuda',
    icon: <BiHelpCircle className='icon' />,
    redirect: 'https://ajuda.b4you.com.br/',
  },
];

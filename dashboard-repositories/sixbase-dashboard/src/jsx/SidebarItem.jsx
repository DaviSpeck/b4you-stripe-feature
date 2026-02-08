import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import coin from '../images/coin.gif';
import logoDark from '../images/logo-horizontal-header-dark.svg';
import { useCollaborator } from '../providers/contextCollaborator';
import { useUser } from '../providers/contextUser';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

const SidebarItem = ({ icon, label, dropdownItems }) => {
  const [isOpen, setIsOpen] = useState(false);

  const history = useHistory();
  console.log(dropdownItems);
  if (dropdownItems && dropdownItems.length > 0) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          onClick={() => setIsOpen((prevValue) => !prevValue)}
          className='sidebar-item'
        >
          <div>
            <div className='icon'>{icon}</div>
            <div className='label'>{label}</div>
          </div>
          <div>
            {isOpen ? (
              <IoChevronDown color='white' />
            ) : (
              <IoChevronUp color='white' />
            )}
          </div>
        </div>
        <div className={`item-sidebar-wrapper ${isOpen ? 'open' : ''} `}>
          {dropdownItems.map((item, index) => (
            <button
              key={index}
              onClick={() => history.push(item.link)}
              className='item-sidebar-select'
            >
              {item.label}
            </button>
          ))}
        </div>
      </>
    );
  } else {
    return (
      <div className='sidebar-item'>
        <div className='icon'>{icon}</div>
        <div className='label'>{label}</div>
      </div>
    );
  }
};

const Sidebar = ({ isMobileMode, setIsMobileMode, spacingTop }) => {
  const { collaborator } = useCollaborator();
  const { user } = useUser();

  const history = useHistory();

  const closeSidebarOnOutsideClick = (e) => {
    console.log(e.target);
    if (!isMobileMode && window.innerWidth < 998) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(e.target)) {
        setIsMobileMode(true);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeSidebarOnOutsideClick);

    return () => {
      document.removeEventListener('click', closeSidebarOnOutsideClick);
    };
  }, [isMobileMode]);

  useEffect(() => {
    // Atualiza o localStorage quando o estado de isMobileMode muda
    localStorage.setItem('isMobileMode', JSON.stringify(isMobileMode));
  }, [isMobileMode]);

  return (
    <>
      <div
        className={`sidebar-shadow ${isMobileMode ? 'mobile-mode' : ''} `}
      ></div>
      <div
        id='sidebar-menu'
        className={`sidebar ${isMobileMode ? 'mobile-mode' : ''} ${collaborator || (user && !user?.verified_id) ? ' space-top' : ''
          } ${spacingTop && ' spacing-top'}`}
      >
        <div className={`logo pointer`} onClick={() => history.push('/')}>
          <img src={logoDark} />
        </div>

        <NavLink to='/' exact aria-expanded='false' style={{ marginTop: 10 }}>
          <SidebarItem
            icon={<i className='bx bx-home-smile'></i>}
            label='Dashboard'
          />
        </NavLink>
        <NavLink to='/produtos' exact aria-expanded='false'>
          <SidebarItem
            icon={<i className='bx bx-purchase-tag-alt'></i>}
            label='Produtos'
          />
        </NavLink>
        {user !== null && user !== undefined && user.user_type !== 3 && (
          <>
            <NavLink to='/vitrine' exact aria-expanded='false'>
              <SidebarItem
                icon={<i className='bx bx-store-alt'></i>}
                label='Vitrine'
              />
            </NavLink>
          </>
        )}
        <NavLink to='/financeiro' exact aria-expanded='false'>
          <SidebarItem
            icon={<i className='bx bx-wallet-alt'></i>}
            label='Financeiro'
          />
        </NavLink>
        <NavLink to='/vendas' exact aria-expanded='false'>
          <SidebarItem
            icon={<i className='bx bx-money-withdraw'></i>}
            label='Vendas'
          />
        </NavLink>
        <SidebarItem
          icon={<i className='bx bx-bar-chart-alt' />}
          label='Relatórios'
          dropdownItems={[
            { label: 'Assinaturas', link: '/assinaturas' },
            { label: 'Carrinho Abandonado', link: '/carrinho-abandonado' },
            //{ label: 'Callcenter', link: '/callcenter' },
            { label: 'Cupons', link: '/desempenho-cupons' },
          ]}
        />
        <SidebarItem
          icon={<i className='bx bx-group' />}
          label='Afiliados'
          dropdownItems={[
            { label: 'Meus Afiliados', link: '/afiliados' },
            { label: 'Afiliações', link: '/afiliacoes' },
            { label: 'Ranking', link: '/ranking-afiliados' },
          ]}
        />
        <SidebarItem
          icon={<i className='bx bx-user-plus' />}
          label='Colaborações'
          dropdownItems={[
            { label: 'Colaborações', link: '/colaboracoes' },
            { label: 'Coproduções', link: '/coproducoes' },
            { label: 'Fornecedores', link: '/fornecedores' },
            { label: 'Gerentes', link: '/gerentes' },
          ]}
        />
        <NavLink to='/notas-fiscais' exact aria-expanded='false'>
          <SidebarItem
            icon={<i className='bx bx-file' />}
            label='Notas Fiscais'
          />
        </NavLink>
        <NavLink to='/apps' exact aria-expanded='false'>
          <SidebarItem
            icon={<i className='bx bx-customize'></i>}
            label='Apps'
          />
        </NavLink>

        <a href='https://ajuda.b4you.com.br/' target='_blank'>
          <SidebarItem
            icon={<i className='bx bx-help-circle'></i>}
            label='Ajuda'
          />
        </a>

        <div className='indique indique-2'>
          <NavLink to='/indique-e-ganhe'>
            <img src={coin} className='coin' />
            <div className='text'>Indique e ganhe</div>
            <small>Quero saber mais</small>
          </NavLink>
        </div>
        <hr class='hr'></hr>
      </div>
    </>
  );
};

export default Sidebar;

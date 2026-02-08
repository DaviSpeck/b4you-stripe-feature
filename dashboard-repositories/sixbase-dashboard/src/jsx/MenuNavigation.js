import React from 'react';
import { Nav, NavDropdown } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';

const MenuNavigation = ({ mobileNavShow, setMobileNavShow }) => {
  return (
    <nav className={mobileNavShow ? 'show' : undefined}>
      <ul>
        <li>
          <NavLink className='ai-icon' to='/' exact aria-expanded='false'>
            <i className='bx bx-home-smile'></i>
            <span className='nav-text'>Dashboard</span>
          </NavLink>
          <Nav.Link href='#link'>Link</Nav.Link>
          <NavDropdown title='Dropdown >' id='basic-nav-dropdown'>
            <NavDropdown.Item href='#action/3.1'>Action</NavDropdown.Item>
            <NavDropdown.Item href='#action/3.2'>
              Another action
            </NavDropdown.Item>
            <NavDropdown.Item href='#action/3.3'>Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href='#action/3.4'>
              Separated link
            </NavDropdown.Item>
          </NavDropdown>

          <NavLink className='ai-icon' to='/' exact aria-expanded='false'>
            <i className='bx bx-home-smile'></i>
            <span className='nav-text'>Dashboard</span>
          </NavLink>
        </li>

        <li>
          <NavLink className='ai-icon' to='/produtos' aria-expanded='false'>
            <i className='bx bx-purchase-tag-alt'></i>
            <span className='nav-text'>Produtos</span>
          </NavLink>
        </li>
        <li>
          <NavLink className='ai-icon' to='/afiliados' aria-expanded='false'>
            <i className='bx bx-user'></i>
            <span className='nav-text'>Afiliados</span>
          </NavLink>
        </li>
        <li>
          <Link to='/vitrine' aria-expanded='false' className='ai-icon'>
            <i class='bx bx-store-alt'></i>
            <span className='nav-text'>Vitrine</span>
          </Link>
        </li>
        <li>
          <NavLink className='ai-icon' to='/financeiro' aria-expanded='false'>
            <i className='bx bx-wallet'></i>
            <span className='nav-text'>Financeiro</span>
          </NavLink>
        </li>
        <li>
          <NavLink className='ai-icon' to='/vendas' aria-expanded='false'>
            <i className='bx bx-dollar-circle'></i>
            <span className='nav-text'>Vendas</span>
          </NavLink>
        </li>
        <li>
          <NavLink className='ai-icon' to='/assinaturas' aria-expanded='false'>
            <i className='bx bx-analyse'></i>
            <span className='nav-text'>Assinaturas</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            className='ai-icon'
            to='/colaboradores'
            aria-expanded='false'
          >
            <i className='bx bx-group'></i>
            <span className='nav-text'>Colaborações</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            className='ai-icon'
            to='/notas-fiscais'
            aria-expanded='false'
          >
            <i className='bx bx-copy-alt'></i>
            <span className='nav-text'>NFs</span>
          </NavLink>
        </li>
        <li>
          <NavLink className='ai-icon' to='/apps' aria-expanded='false'>
            <i className='bx bx-cube-alt'></i>
            <span className='nav-text'>Apps</span>
          </NavLink>
        </li>

        <li>
          <NavLink className='ai-icon' to='/comunidade' aria-expanded='false'>
            <i className='bx bx-comment-detail'></i>
            <span className='nav-text'>Comunidade</span>
          </NavLink>
        </li>
        <li className='hide-desktop'>
          <Link
            className='ai-icon'
            aria-expanded='false'
            to=''
            onClick={() => {
              window.location = 'https://membros.b4you.com.br';
            }}
          >
            <i className='bx bx-desktop'></i>
            <span>Área de membros</span>
          </Link>
        </li>
        <li className='hide-desktop'>
          <NavLink
            className='ai-icon'
            to='/configuracoes'
            aria-expanded='false'
          >
            <i className='bx bx-cog'></i>
            <span className='nav-text'>Configurações</span>
          </NavLink>
        </li>
        <li className='hide-desktop'>
          <NavLink className='ai-icon' to='/sair' aria-expanded='false'>
            <i className='bx bxs-door-open'></i>
            <span className='nav-text'>Sair</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default MenuNavigation;

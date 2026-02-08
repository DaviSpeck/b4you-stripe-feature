import React, { Component } from 'react';

/// NavLink
import { NavLink } from 'react-router-dom';

/// Scroll
import PerfectScrollbar from 'react-perfect-scrollbar';

/// Menu
import MetisMenu from 'metismenujs';

///
import drump from '../../../images/card/drump.png';

import '../../../scss/layout/sidebar/sidebar-icons.scss';

class MM extends Component {
  componentDidMount() {
    this.$el = this.el;
    this.mm = new MetisMenu(this.$el);
  }
  //   componentWillUnmount() {
  //     this.mm('dispose');
  //   }
  render() {
    return (
      <div className='mm-wrapper'>
        <ul className='metismenu' ref={(el) => (this.el = el)}>
          {this.props.children}
        </ul>
      </div>
    );
  }
}

class SideBar extends Component {
  /// Open menu
  componentDidMount() {
    // sidebar open/close
    var btn = document.querySelector('.nav-control');
    var aaa = document.querySelector('#main-wrapper');
    var list = document.querySelector('.metismenu');
    /*     var listItems = document.querySelectorAll('.metismenu * a');

    function handleSelect(e) {
      console.log('e target ', e.target);
      console.log('e currenttarget ', e.currentTarget);
      listItems.forEach((element) => {
        element.classList.remove('activeNavLink');
      });
      e.currentTarget.classList.add('activeNavLink');
    }
    listItems.forEach((element) => {
      element.addEventListener('click', handleSelect);
    }); */

    function toggleFunc() {
      list.classList.toggle('togglePadding');
      return aaa.classList.toggle('menu-toggle');
    }

    btn.addEventListener('click', toggleFunc);
  }
  render() {
    /// Path
    const path = window.location.pathname;

    /// Active menu
    let dashBoard = [
        '',
        'workout-statistic',
        'workout-plan',
        'distance-map',
        'diet-food-menu',
        'personal-record',
      ],
      app = [
        'app-profile',
        'app-calender',
        'email-compose',
        'email-inbox',
        'email-read',
        'ecom-product-grid',
        'ecom-product-list',
        'ecom-product-list',
        'ecom-product-order',
        'ecom-checkout',
        'ecom-invoice',
        'ecom-customers',
      ],
      charts = [
        'chart-flot',
        'chart-morris',
        'chart-chartjs',
        'chart-chartist',
        'chart-sparkline',
        'chart-peity',
      ],
      bootstrap = [
        'ui-accordion',
        'ui-badge',
        'ui-alert',
        'ui-button',
        'ui-modal',
        'ui-button-group',
        'ui-list-group',
        'ui-media-object',
        'ui-card',
        'ui-carousel',
        'ui-dropdown',
        'ui-popover',
        'ui-progressbar',
        'ui-tab',
        'ui-typography',
        'ui-pagination',
        'ui-grid',
      ],
      plugins = [
        'uc-select2',
        'uc-nestable',
        'uc-sweetalert',
        'uc-toastr',
        'uc-jqvmap',
        'uc-noui-slider',
      ],
      widget = ['widget'],
      forms = [
        'form-element',
        'form-wizard',
        'form-editor-summernote',
        'form-pickers',
        'form-validation-jquery',
      ],
      table = ['table-bootstrap-basic', 'table-datatable-basic'];

    return (
      <div id='sidebar-icons' className='deznav'>
        <PerfectScrollbar className='deznav-scroll'>
          <MM className='navbar-icons metismenu' id='menu'>
            <li>
              <NavLink className='ai-icon' to='/' exact aria-expanded='false'>
                <i className='bx bx-home-smile'></i>
                <span className='nav-text'>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink className='ai-icon' to='/vitrine' aria-expanded='false'>
                <i className='bx bx-store-alt'></i>
                <span className='nav-text'>Vitrine</span>
              </NavLink>
            </li>
            <li>
              <NavLink className='ai-icon' to='/produtos' aria-expanded='false'>
                <i className='bx bx-purchase-tag-alt'></i>
                <span className='nav-text'>Produtos</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className='ai-icon'
                to='/afiliados'
                aria-expanded='false'
              >
                <i className='bx bx-user'></i>
                <span className='nav-text'>Meus Afiliados</span>
              </NavLink>
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
              <NavLink
                className='ai-icon'
                to='/assinaturas'
                aria-expanded='false'
              >
                <i className='bx bx-analyse'></i>
                <span className='nav-text'>Assinaturas</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                className='ai-icon'
                to='/notas-fiscais'
                aria-expanded='false'
              >
                <i className='bx bx-copy-alt'></i>
                <span className='nav-text'>NFs / Recibos</span>
              </NavLink>
            </li>

            <li>
              <NavLink className='ai-icon' to='/apps' aria-expanded='false'>
                <i className='bx bx-cube-alt'></i>
                <span className='nav-text'>Apps</span>
              </NavLink>
            </li>
          </MM>
        </PerfectScrollbar>
      </div>
    );
  }
}

export default SideBar;

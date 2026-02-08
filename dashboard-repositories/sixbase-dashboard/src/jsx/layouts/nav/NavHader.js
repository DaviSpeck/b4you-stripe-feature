import React, { useState } from 'react';

/// React router dom
import { Link } from 'react-router-dom';

/// images
import logo from '../../../images/logo.png';
import logoText from '../../../images/logo-text.png';

import symbol from '../../../images/symbol-mango5.png';

const NavHader = () => {
  const [toggle, setToggle] = useState(false);
  return (
    <div className='nav-header'>
      <Link to='/' className='brand-logo'>
        {/* <div className='logo-abbr'>
          <img src={symbol} alt='' style={{ width: '45px' }} />
        </div> */}

        {/* <img className='logo-compact' src={logoText} alt='' /> */}
        {/* <img className='brand-title' src={logoText} alt='' /> */}
        {/* <div className='logo-abbr'>5</div> */}
        {toggle ? (
          <div className='logo-abbr'>
            <img src={symbol} alt='' style={{ width: '45px' }} />
          </div>
        ) : (
          <>
            <img
              src={symbol}
              alt=''
              style={{
                width: '45px',
                transform: 'translateY(2px)',
                marginRight: 5,
              }}
            />
            <div className='brand-title'>mango5</div>
          </>
        )}
      </Link>

      <div className='nav-control' onClick={() => setToggle(!toggle)}>
        <div className={`hamburger ${toggle ? 'is-active' : ''}`}>
          <span className='line'></span>
          <span className='line'></span>
          <span className='line'></span>
        </div>
      </div>
    </div>
  );
};

export default NavHader;

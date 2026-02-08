// You can customize the template with the help of this file

import { createTheme } from 'react-data-table-component';
import b4youLogo from '@src/assets/images/logo/b4you-logo.png';

createTheme('solarized', {
  text: {
    primary: 'white',
    secondary: 'white',
  },
  background: {
    default: '#283046',
  },
  striped: {
    default: 'white',
  },
});

// Tema claro para react-data-table-component
createTheme('solarizedLight', {
  text: {
    primary: '#283046',
    secondary: '#6e6b7b',
  },
  background: {
    default: '#ffffff',
  },
  striped: {
    default: '#f6f6f6',
  },
});

//Template config options
const themeConfig = {
  app: {
    appName: 'B4you',
    appLogoImage: b4youLogo,
  },
  layout: {
    isRTL: false,
    skin: 'dark', // light, dark, bordered, semi-dark
    routerTransition: 'fadeIn', // fadeIn, fadeInLeft, zoomIn, none or check this for more transition https://animate.style/
    type: 'vertical', // vertical, horizontal
    contentWidth: 'boxed', // full, boxed
    menu: {
      isHidden: false,
      isCollapsed: false,
    },
    navbar: {
      // ? For horizontal menu, navbar type will work for navMenu type
      type: 'floating', // static , sticky , floating, hidden
      backgroundColor: 'white', // BS color options [primary, success, etc]
    },
    footer: {
      type: 'static', // static, sticky, hidden
    },
    customizer: false,
    scrollTop: true, // Enable scroll to top button
  },
};

export default themeConfig;

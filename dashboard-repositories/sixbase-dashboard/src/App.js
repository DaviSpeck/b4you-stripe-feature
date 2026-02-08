/// Style
import './vendor/bootstrap-select/dist/css/bootstrap-select.min.css';
import 'react-calendar/dist/Calendar.css';
import './scss/main.scss';
import './scss/custom.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import UserProvider from './providers/contextUser';
import Routes from './modules/Routes';

const App = ({ width }) => {
  const body = document.querySelector('body');

  if (!width) {
    return (
      <UserProvider>
        <Routes />
        <ToastContainer />
      </UserProvider>
    );
  }

  width >= 1300
    ? body.setAttribute('data-sidebar-style', 'full')
    : width <= 1299 && width >= 767
    ? body.setAttribute('data-sidebar-style', 'mini')
    : body.setAttribute('data-sidebar-style', 'overlay');
  return (
    <UserProvider>
      <Routes />
      <ToastContainer />
    </UserProvider>
  );
};

export default App;

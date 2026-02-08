import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import api from '../../providers/api';
import OneSignal from 'react-onesignal';
import { useUser } from '../../providers/contextUser';

const Logout = () => {
  const history = useHistory();
  const { setUser } = useUser();

  const logout = async () => {
    try {
      await OneSignal.logout();
    } catch (e) {
      // erro silencioso
    }

    try {
      await api.get('/auth/logout');
    } catch { 
      // erro silencioso
    }

    setUser(null);
    history.push('/acessar');
  };

  useEffect(() => {
    logout();
  }, []);

  return (
    <section id='page-logout'>
      <i className='bx bx-loader-alt bx-spin' />
      <h3>Saindo...</h3>
      <h6>
        até logo <i className='bx bx-wink-smile wink'></i>
      </h6>
    </section>
  );
};

export default Logout;

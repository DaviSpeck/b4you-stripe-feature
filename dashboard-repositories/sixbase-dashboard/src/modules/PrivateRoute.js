import { useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Layout from '../jsx/Layout';
import { useUser } from '../providers/contextUser';
import { ModalTrancoso } from '../jsx/components/pop-up-trancoso';

const PrivateRoute = ({ component: Component, path, exact, hideLayout }) => {
  const { user } = useUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const redirectToLogin = () => {
    const currentUrl = window.location.pathname + window.location.search;
    localStorage.setItem('redirectPathManager', currentUrl);
    return <Redirect to='/acessar' />;
  };

  return (
    <>
      {hideLayout ? (
        <Route
          path={path}
          exact={exact}
          render={(props) =>
            user ? <Component {...props} /> : redirectToLogin()
          }
        />
      ) : (
        <Layout>
          <Route
            path={path}
            exact={exact}
            render={(props) =>
              user ? <Component {...props} /> : redirectToLogin()
            }
          />
        </Layout>
      )}
      <ModalTrancoso />
    </>
  );
};

export default PrivateRoute;

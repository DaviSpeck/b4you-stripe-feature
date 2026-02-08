import { createContext, useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const contextCreate = createContext();

const ShowHideConfigProvider = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();

  useLayoutEffect(() => {
    if (window.innerWidth <= 767) setIsMobile(true);

    addEventListener('resize', () => {
      if (window.screen.width <= 767) {
        setIsMobile(true);
      }

      if (window.screen.width > 767) {
        setIsMobile(false);
      }
    });
  }, []);

  useEffect(() => {
    if (location.pathname !== '/vendas' && isMobile) {
      localStorage.removeItem('fields-visable');
    }
  }, [location]);

  return <contextCreate.Provider value={{}} {...props} />;
};

export default ShowHideConfigProvider;

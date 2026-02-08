import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './style.scss';

const Cookie = () => {
  const { destination, uuidOffer, uuidAffiliate } = useParams();
  const [requesting, setRequesting] = useState(true);
  document.title = 'Cooooookie...';

  useEffect(() => {
    axios
      .get(
        `https://mango5.burrow.link/api/product/${destination}/${uuidOffer}/${uuidAffiliate}`
      )
      .then(() => {
        // Cookies.set('sixid', r.data.sixid);
        // window.location = r.data.redirect_link;
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  }, []);

  // const redirect = () => {
  //   window.location = sale.membership_redirect;
  // };

  return (
    <section id='cookie'>
      <div className='box'>
        {requesting === true ? <>loading</> : <>setar cookie</>}
      </div>
      <div className='logo'>B4you</div>
    </section>
  );
};

export default Cookie;

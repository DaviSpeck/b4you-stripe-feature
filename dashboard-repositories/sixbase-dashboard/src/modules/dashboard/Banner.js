import { useState, useEffect } from 'react';
import banner1 from '../../../src/images/banner.png';
import banner2 from '../../../src/images/banner-tiny.png';
import banner3 from '../../../src/images/banner-mobile.png';
import banner4 from '../../../src/images/banner-tiny-mobile.png';

const Banner = () => {
  const getLocalStorageValue = () => {
    const storedValue = localStorage.getItem('showBanner');
    return storedValue ? JSON.parse(storedValue) : true;
  };

  const [showBanner, setShowBanner] = useState(getLocalStorageValue());

  useEffect(() => {
    localStorage.setItem('showBanner', JSON.stringify(showBanner));
  }, [showBanner]);

  return (
    <>
      <div
        id='banner-wrap'
        className={`desktop ${showBanner ? 'banner' : 'banner-tiny'}`}
      >
        <img src={showBanner ? banner1 : banner2} alt='Banner' />
        <div id='button-wrap' onClick={() => setShowBanner(!showBanner)}>
          <i className='bx bx-chevron-up'></i>
        </div>
      </div>
      <div
        id='banner-wrap'
        className={`mobile ${showBanner ? 'banner' : 'banner-tiny'}`}
      >
        <img src={showBanner ? banner3 : banner4} alt='Banner' />
        <div id='button-wrap' onClick={() => setShowBanner(!showBanner)}>
          <i className='bx bx-chevron-up'></i>
        </div>
      </div>
    </>
  );
};

export default Banner;

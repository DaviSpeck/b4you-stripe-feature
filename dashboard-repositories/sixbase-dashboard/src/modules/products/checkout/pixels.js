import { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import Facebook from './facebook';
import Tiktok from './tiktok';
import Analytics from './analytics';
import Ads from './ads';
import Kwai from './kwai';
import GoogleTagManager from './googleGtm';
import Pinterest from './pinterest';

const Pixels = () => {
  const { product } = useProduct();

  const [pixels, setPixels] = useState({
    facebook: [],
    googleAds: [],
    googleAnalytics: [],
    outbrain: [],
    taboola: [],
    tiktok: [],
    kwai: [],
    pinterest: [],
  });

  const fetchData = () => {
    api
      .get(`products/pixels/${product.uuid}`)
      .then((response) => {
        setPixels(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Tabs defaultActiveKey='facebook' className='mb-4 mt-4 tabs-pixels'>
      <Tab eventKey='facebook' title='Facebook'>
        <Facebook
          title={null}
          titleModal='Facebook'
          companyId='facebook'
          rows={pixels.facebook}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='tiktok' title='Tiktok'>
        <Tiktok
          titleModal='Tiktok'
          companyId='tiktok'
          rows={pixels.tiktok}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='google-analytics' title='Google Analytics'>
        <Analytics
          titleModal='Google Analytics'
          companyId='google-analytics'
          rows={pixels.googleAnalytics.filter(
            (item) => item.settings.pixel_id.slice(0, 3) !== 'GTM'
          )}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='ads' title='Google Ads'>
        <Ads
          titleModal='Google Ads'
          companyId='google-ads'
          rows={pixels.googleAds}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='gtm' title='Google GTM'>
        <GoogleTagManager
          titleModal='Google GTM'
          companyId='google-tag-manager'
          rows={pixels.googleAds
            .concat(pixels.googleAnalytics)
            .filter((item) => item.settings.pixel_id.slice(0, 3) === 'GTM')}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='kwai' title='Kwai'>
        <Kwai
          titleModal='Kwai'
          companyId='kwai'
          rows={pixels.kwai}
          fetchData={fetchData}
        />
      </Tab>
      <Tab eventKey='Pinterest' title='Pinterest'>
        <Pinterest
          titleModal='Pinterest'
          companyId='pinterest'
          rows={pixels.pinterest}
          fetchData={fetchData}
        />
      </Tab>
    </Tabs>
  );
};

export default Pixels;

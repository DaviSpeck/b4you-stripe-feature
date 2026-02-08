import { Fragment } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import logoActiveCampaign from '../../images/apps/activecampaign.png';
import logoAstron from '../../images/apps/astron.svg';
import logoBlingShipping from '../../images/apps/bling-shipping-legacy.png';
import logoBlingShippingV3 from '../../images/apps/bling-shipping-v3.png';
import logoBling from '../../images/apps/bling.png';
import logoCademi from '../../images/apps/cademi.png';
import logoEnotas from '../../images/apps/enotas.png';
import logoHotzapp from '../../images/apps/hotzapp.png';
import logoHSDS from '../../images/apps/hsds.png';
import logoWoocommerce from '../../images/apps/woocommerce.png';
import logoShopify from '../../images/apps/shopify.png';
import logoInvision from '../../images/apps/invision.png';
import logoLeadlovers from '../../images/apps/leadlovers.png';
import logoMailChimp from '../../images/apps/mailchimp.png';
// import logoMelhorEnvio from '../../images/apps/melhor-envio.png';
import logoArco from '../../images/apps/arco.png';
import logoFrenet from '../../images/apps/frenet.png';
import logoMemberkit from '../../images/apps/memberkit.svg';
import logoNotazz from '../../images/apps/notazz.png';
import logoSellflux from '../../images/apps/sellflux.png';
import logoUTMify from '../../images/apps/utmify.png';
import logoWebhooks from '../../images/apps/webhooks.png';
import logoZarpon from '../../images/apps/zarpon.png';
import logoTiny from '../../images/apps/tiny.png';
import logoZoppy from '../../images/apps/zoppy.png';
import PageTitle from '../../jsx/layouts/PageTitle';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import './styles.scss';

const PageApps = () => {
  const history = useHistory();

  const apps = [
    {
      name: 'Webhooks',
      img: logoWebhooks,
      status: true,
      url: '/apps/webhooks',
      className: '',
    },
    {
      name: 'Leadlovers',
      img: logoLeadlovers,
      status: false,
      url: '/apps/leadlovers',
      className: '',
    },
    {
      name: 'Active Campaign',
      img: logoActiveCampaign,
      status: true,
      url: '/apps/active-campaign',
      className: '',
    },

    // {
    //   name: 'Voxuy',
    //   img: logoVoxuy,
    //   status: true,
    //   url: '/apps/voxuy',
    //   className: '',
    // },
    {
      name: 'Sellflux',
      img: logoSellflux,
      status: true,
      url: '/apps/sellflux',
      className: '',
    },

    // {
    //   name: 'Bling Notas Fiscais',
    //   img: logoBling,
    //   status: true,
    //   url: '/apps/bling',
    //   className: '',
    // },
    // {
    //   name: 'Bling Pedidos de Venda',
    //   img: logoBlingShipping,
    //   status: true,
    //   url: '/apps/bling-shipping',
    //   className: '',
    // },
    {
      name: 'Bling Pedidos de Venda V3',
      img: logoBlingShippingV3,
      status: true,
      url: '/apps/bling-shipping-v3',
      className: '',
    },
    {
      name: 'Notazz',
      img: logoNotazz,
      status: true,
      url: '/apps/notazz',
      className: '',
    },
    {
      name: 'E-notas',
      img: logoEnotas,
      status: true,
      url: '/apps/enotas',
      className: '',
    },
    {
      name: 'Mail Chimp',
      img: logoMailChimp,
      status: true,
      url: '/apps/mail-chimp',
      className: '',
    },
    {
      name: 'HotzApp',
      img: logoHotzapp,
      status: true,
      url: '/apps/hotzapp',
      className: '',
    },
    {
      name: 'Cademi',
      img: logoCademi,
      status: true,
      url: '/apps/cademi',
      className: '',
    },
    {
      name: 'HSDS',
      img: logoHSDS,
      status: true,
      url: '/apps/hsds',
      className: '',
    },
    {
      name: 'Invision',
      img: logoInvision,
      status: true,
      url: '/apps/invision',
      className: '',
    },
    {
      name: 'Memberkit',
      img: logoMemberkit,
      status: true,
      url: '/apps/memberkit',
      className: '',
    },

    {
      name: 'Astron Members',
      img: logoAstron,
      status: true,
      url: '/apps/astronmembers',
      className: '',
    },
    {
      name: 'UTMify',
      img: logoUTMify,
      status: true,
      url: '/apps/utmify',
      className: '',
    },
    // {
    //   name: 'Melhor Envio',
    //   img: logoMelhorEnvio,
    //   status: true,
    //   url: '/apps/melhor-envio',
    //   className: '',
    // },
    {
      name: 'Zarpon',
      img: logoZarpon,
      status: true,
      url: '/apps/zarpon',
      className: '',
    },
    {
      name: 'Arco',
      img: logoArco,
      status: true,
      url: '/apps/arco',
      className: '',
    },
    {
      name: 'Frenet',
      img: logoFrenet,
      status: true,
      url: '/apps/frenet',
      className: 'logo-small',
    },
    {
      name: 'Tiny',
      img: logoTiny,
      status: true,
      url: '/apps/tiny',
    },
    {
      name: 'Omie',
      img: 'https://static.omie.com.br/images/logo/logo-omie-topo.png',
      status: true,
      url: '/apps/omie',
      className: '',
    },
    {
      name: 'Spedy',
      img: 'https://blog.spedy.com.br/wp-content/uploads/2024/09/Spedy-Logo-2-e1726748486746-1024x315.png',
      status: true,
      url: '/apps/spedy',
      className: '',
    },
    {
      name: 'Zoppy',
      img: logoZoppy,
      status: true,
      url: '/apps/zoppy',
      className: '',
    },
    {
      name: 'Shopify',
      img: logoShopify,
      status: true,
      url: '/apps/shopify',
      className: '',
    },
    {
      name: 'WooCommerce',
      img: logoWoocommerce,
      status: true,
      url: '/apps/woocommerce',
      className: '',
    },
  ];

  const navigate = (destination) => {
    history.push(destination);
  };

  return (
    <Fragment>
      <section id='page-apps'>
        <PageTitle title='Apps' />
        <Row>
          <Col xl={12}>
            <div className='d-flex justify-content-between align-items-center mb-3'>
              <p className='mb-0'>
                Integre e automatize as principais funções de seu negócio
                digital.
              </p>
              <ButtonDS
                variant='primary'
                onClick={() => navigate('/apps/integration-notifications')}
                iconLeft='bx-bell'
              >
                Notificações de Integrações
              </ButtonDS>
            </div>
          </Col>
        </Row>

        <Row>
          {apps.map((item, index) => {
            return (
              <Col xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  className='gallery'
                  onClick={() => {
                    navigate(item.url);
                  }}
                >
                  <Card.Body>
                    <img
                      src={item.img}
                      alt='teste'
                      className={item.className}
                    />
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </section>
    </Fragment>
  );
};

export default PageApps;

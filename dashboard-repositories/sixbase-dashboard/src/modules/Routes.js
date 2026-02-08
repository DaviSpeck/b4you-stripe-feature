import { useEffect, useRef, useState } from 'react';
/// React router dom
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import '../jsx/chart.css';
/// Css
import '../jsx/index.css';
import api from '../providers/api';
import { useUser } from '../providers/contextUser';
import PageAffiliates from './affiliates/PageAffiliates';
import PageApps from './apps';
import PageIntegrationNotifications from './apps/integration-notifications';
import PageAppsListEnotas from './apps/enotas/list';
import PageAppsListLeadlovers from './apps/leadlovers/list';
import PageAppsListLeadloversSingle from './apps/leadlovers/single';

import PageAppsListMemberkit from './apps/memberkit/list';
import PageAppsListMemberkitSingle from './apps/memberkit/single';
import PageAppsListNotazz from './apps/notazz/list';

import PageAbandonedCart from './abandonedCart/PageAbandonedCart';
import PageAffiliateReport from './affiliateReport/PageAffiliateReport';
import PageAppsListActiveCampaign from './apps/active-campaign/list';
import PageAppsListActiveCampaignSingle from './apps/active-campaign/single';
import PageAppsArco from './apps/arco/list';
import PageAppsListAstronmembers from './apps/astronmembers/list';
import PageAppsListAstronmembersSingle from './apps/astronmembers/single';
import PageAppListBlingShippingV3 from './apps/bling-shipping-v3/list';
import PageAppListBlingShipping from './apps/bling-shipping/list';
import PageAppsListBling from './apps/bling/list';
import PageAppsListCademi from './apps/cademi/list';
import PageAppsListCademiSingle from './apps/cademi/single';
import PageAppsFrenet from './apps/frenet/list';
import PageAppsShopify from './apps/Shopify/list';
import PageAppsWoocommerce from './apps/Woocommerce/list';
import PageAppsEcommerce from './ecommerce/list';
import PageAppsListHotzApp from './apps/hotzapp/list';
import PageAppsListInvision from './apps/invision/list';
import PageAppsListInvisionSingle from './apps/invision/single';
import PageAppsListMailChimp from './apps/mail-chimp/list';
import PageAppsListMailChimpSingle from './apps/mail-chimp/single';
import PageAppsListSellflux from './apps/sellflux/list';
import PageAppsListSellfluxSingle from './apps/sellflux/single';
import PageAppListUtmify from './apps/utmify/list';
import PageAppsListUtmifySingle from './apps/utmify/single';
import PageAppsListVoxuy from './apps/voxuy/list';
import PageAppsListVoxuySingle from './apps/voxuy/single';
import PageAppsWebhooks from './apps/webhooks/list';
import PageAppSpedy from './apps/spedy/list';
import PageAppsZarpon from './apps/zarpon/list';
import Login from './auth/Login';
import Password from './auth/Password';
import Register from './auth/Register';
import Blank from './Blank';
import PageCollaborators from './collaborators/PageCollaborators';
import PageCommunity from './community/index';
import PageDashboard from './dashboard/PageDashboard';
import PageIdentity from './identity/PageIdentity';
import PageInvoices from './invoices/PageInvoices';
import Loading from './Loading';
import PageMarketAffiliate from './market/affiliate';
import PageMarket from './market/market';
import Notifications from './Notifications/Notifications';
import PrivateRoute from './PrivateRoute';
import PageProducts from './products';
import PageProductsEdit from './products/edit';
import PageProductsAffiliationList from './products/list-affiliations';
import PageProductsCoproductions from './products/list-coproductions';
import PageProductsList from './products/list-products';
import PageQuestions from './questions/PageQuestions';
import PageSales from './sales/PageSales';
import PageSettings from './settings/PageSettings';
import PageSubscriptions from './subscriptions/PageSubscriptions';
import PageWallet from './wallet/PageWallet';
import Error404 from '../jsx/pages/Error404';
import Onboarding from '../jsx/pages/Onboarding';
import ShowHideConfigProvider from '../providers/contextHideShowConfig';
import PageAppsHSDS from './apps/hsds/list';
import PageAppsMelhorEnvio from './apps/melhor-envio/list';
import PageAppsZoppy from './apps/zoppy/list';
import Logout from './auth/Logout';
import PageCallcenter from './callcenter/callcenter';
import PageMyCollaborations from './collaborators/PageMyCollaborations';
import PageRakingCoupons from './coupons';
import PageManagers from './managers';
import Certificate from './products/certificate';
import PreviewCheckout from './products/checkout/preview';
import UpsellGenerator from './products/offers/UpsellGenerator';
import PageRankingProducts from './products/ranking';
import RankingAffiliations from './products/ranking-affiliations';
import Sandbox from './Sandbox';
import PageSuppliers from './suppliers';
import PageAppsTiny from './apps/tiny/list';
import PageAppsListOmie from './apps/omie/list';
import PageAppsListOmieSingle from './apps/omie/single';
import { PageReferral } from './dashboard/Referral';
import OneSignal from 'react-onesignal';
import { syncPlayerId } from '../services/oneSignalService';
import PagePendingAffiliates from './affiliates/pendingAffiliates';

const Routes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser } = useUser();

  const didInit = useRef(false);
  const osListeners = useRef({
    subChange: null,
    permChange: null,
  });

  async function waitFor(condFn, label, timeout = 300000, interval = 250) {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const ok = await condFn();
        if (ok) {
          return ok;
        }
      } catch (err) {
        // console.warn(`[waitFor] ⚠️ erro avaliando condição: ${label}`, err);
      }
      await new Promise((r) => setTimeout(r, interval));
    }

    return null;
  }

  function getUserSnapshot() {
    const u = OneSignal.User;
    const snap = {
      onesignalId: u.onesignalId,
      externalId: u.externalId,
      optedIn: u.PushSubscription?.optedIn,
      token: u.PushSubscription?.token,
    };
    return snap;
  }

  async function waitReady(uuid) {
    await waitFor(
      () => OneSignal.User.externalId === uuid,
      'externalId == uuid'
    );

    await waitFor(() => {
      const id = OneSignal.User.onesignalId;
      return id && !String(id).startsWith('local-') ? id : null;
    }, 'onesignalId não-local');

    await waitFor(() => {
      const t = OneSignal.User.PushSubscription?.token;
      return t ? t : null;
    }, 'PushSubscription.token');
  }

  useEffect(() => {
    const deviceIdFromStorage = localStorage.getItem('device_id');

    if (!user || didInit.current) {
      return;
    }
    didInit.current = true;

    (async () => {
      try {
        await OneSignal.init({
          appId: 'c9329dee-53b1-408e-9156-d2ec4326f2f3',
          allowLocalhostAsSecureOrigin: true,
          autoRegister: false,
          autoResubscribe: true,
          welcomeNotification: { disable: true },
        });

        await OneSignal.login(user.uuid, user.token);

        const supported = await OneSignal.Notifications.isPushSupported();
        if (!supported) return;

        const perm = await OneSignal.Notifications.permission;

        osListeners.current.subChange = async (sub) => {
          if (sub.current.optedIn && sub.current.token) {
            await waitReady(user.uuid);
            const snap = getUserSnapshot();
            await syncPlayerId(
              snap.onesignalId,
              deviceIdFromStorage
            );
          }
        };

        OneSignal.User.PushSubscription.addEventListener(
          'change',
          osListeners.current.subChange
        );

        osListeners.current.permChange = async () => {
          const permNow = await OneSignal.Notifications.permission;

          if (permNow === 'granted') {
            await OneSignal.User.PushSubscription.optIn();
          }
        };

        OneSignal.Notifications.addEventListener(
          'permissionChange',
          osListeners.current.permChange
        );

        if (perm === 'default' || perm === false) {
          await OneSignal.Notifications.requestPermission();
          return;
        }

        if (perm === 'denied') {
          console.warn('[OS] permissão negada');
          return;
        }

        if (perm === 'granted' || perm === true) {
          await waitReady(user.uuid);
          const snap = getUserSnapshot();
          await syncPlayerId(
            snap.onesignalId,
            deviceIdFromStorage
          );
        }
      } catch (err) {
        // console.error('[OS] fluxo erro:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (user !== null) return;
    if (window.location.pathname === '/sair') return;

    const device_id = localStorage.getItem('device_id');

    api
      .get(`auth/me?device_id=${device_id}`)
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        // erro silencioso
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  const routes = [
    { url: '/acessar', component: Login, public: true },
    { url: '/sair', component: Logout, hideLayout: true, public: true },
    { url: '/cadastrar', component: Register, public: true },
    { url: '/cadastrar-senha/:token/new', component: Password, public: true },
    { url: '/', component: PageDashboard },
    { url: '/blank', component: Blank },
    { url: '/notificacoes', component: Notifications },
    { url: '/produtos', component: PageProducts },
    { url: '/produtos/listar', component: PageProductsList },
    { url: '/coproducoes', component: PageProductsCoproductions },
    { url: '/afiliacoes', component: PageProductsAffiliationList },
    { url: '/ranking-afiliados', component: RankingAffiliations },
    {
      url: '/produtos/editar/:uuidProduct/:subPage',
      component: PageProductsEdit,
    },
    {
      url: '/produtos/checkout/preview/:uuidProduct',
      component: PreviewCheckout,
      hideLayout: true,
    },
    { url: '/afiliados', component: PageAffiliates },
    { url: '/afiliados/pendentes', component: PagePendingAffiliates },
    {
      url: '/colaboradores',
      component: PageCollaborators,
    },
    {
      url: '/colaboracoes',
      component: PageMyCollaborations,
    },
    {
      url: '/fornecedores',
      component: PageSuppliers,
    },
    {
      url: '/gerentes',
      component: PageManagers,
    },
    { url: '/vitrine', component: PageMarket },

    { url: '/upsell-generator', component: UpsellGenerator },
    {
      url: '/vitrine/produto/:slug/:uuidProduct',
      component: PageMarketAffiliate,
    },
    { url: '/comunidade', component: PageCommunity },
    { url: '/apps', component: PageApps },
    { url: '/apps/integration-notifications', component: PageIntegrationNotifications },
    { url: '/indique-e-ganhe', component: PageReferral },
    { url: '/apps/webhooks', component: PageAppsWebhooks },
    { url: '/apps/spedy', component: PageAppSpedy },
    { url: '/apps/zarpon', component: PageAppsZarpon },
    { url: '/apps/arco', component: PageAppsArco },
    { url: '/apps/enotas', component: PageAppsListEnotas },
    { url: '/apps/leadlovers', component: PageAppsListLeadlovers },
    { url: '/apps/frenet', component: PageAppsFrenet },
    { url: '/apps/Shopify', component: PageAppsShopify },
    { url: '/apps/Woocommerce', component: PageAppsWoocommerce },
    { url: '/ecommerce', component: PageAppsEcommerce },
    { url: '/apps/zoppy', component: PageAppsZoppy },
    {
      url: '/apps/leadlovers/:uuidIntegration',
      component: PageAppsListLeadloversSingle,
    },

    { url: '/apps/memberkit', component: PageAppsListMemberkit },
    {
      url: '/apps/memberkit/:uuidIntegration',
      component: PageAppsListMemberkitSingle,
    },
    {
      url: '/apps/notazz',
      component: PageAppsListNotazz,
    },
    { url: '/apps/active-campaign', component: PageAppsListActiveCampaign },
    {
      url: '/apps/active-campaign/:uuidIntegration',
      component: PageAppsListActiveCampaignSingle,
    },
    { url: '/apps/mail-chimp', component: PageAppsListMailChimp },
    { url: '/apps/voxuy', component: PageAppsListVoxuy },
    { url: '/apps/sellflux', component: PageAppsListSellflux },
    { url: '/apps/astronmembers', component: PageAppsListAstronmembers },
    { url: '/apps/cademi', component: PageAppsListCademi },
    { url: '/apps/utmify', component: PageAppListUtmify },
    { url: '/apps/bling', component: PageAppsListBling },
    { url: '/apps/bling-shipping', component: PageAppListBlingShipping },
    { url: '/apps/bling-shipping-v3', component: PageAppListBlingShippingV3 },
    { url: '/apps/hsds', component: PageAppsHSDS },
    { url: '/apps/melhor-envio', component: PageAppsMelhorEnvio },
    { url: '/apps/omie', component: PageAppsListOmie },
    {
      url: '/apps/omie/:uuidIntegration',
      component: PageAppsListOmieSingle,
    },
    {
      url: '/apps/sellflux/:uuidIntegration',
      component: PageAppsListSellfluxSingle,
    },
    {
      url: '/apps/astronmembers/:uuidIntegration',
      component: PageAppsListAstronmembersSingle,
    },
    {
      url: '/apps/utmify/:uuidIntegration',
      component: PageAppsListUtmifySingle,
    },
    {
      url: '/apps/cademi/:uuidIntegration',
      component: PageAppsListCademiSingle,
    },
    {
      url: '/apps/mail-chimp/:uuidIntegration',
      component: PageAppsListMailChimpSingle,
    },
    {
      url: '/apps/voxuy/:uuidIntegration',
      component: PageAppsListVoxuySingle,
    },
    { url: '/apps/hotzapp', component: PageAppsListHotzApp },
    { url: '/apps/invision', component: PageAppsListInvision },
    {
      url: '/apps/invision/:uuidIntegration',
      component: PageAppsListInvisionSingle,
    },
    { url: '/apps/tiny', component: PageAppsTiny },
    //{ url: '/callcenter', component: PageCallcenter },
    { url: '/configuracoes', component: PageSettings },
    { url: '/vendas', component: PageSales },
    { url: '/carrinho-abandonado', component: PageAbandonedCart },
    { url: '/relatorio-afiliados', component: PageAffiliateReport },
    { url: '/assinaturas', component: PageSubscriptions },
    { url: '/perguntas', component: PageQuestions },
    { url: '/notas-fiscais', component: PageInvoices },
    { url: '/verificar-identidade', component: PageIdentity },
    { url: '/desempenho-cupons', component: PageRakingCoupons },
    { url: '/ranking-produtos', component: PageRankingProducts },
    { url: '/financeiro', component: PageWallet, public: false },
    { url: '/certificado', component: Certificate, public: false },
    {
      url: '/onboarding',
      component: Onboarding,
      hideLayout: true,
      public: false,
    },
    { url: '*', component: Error404, hideLayout: true },
  ];

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Sandbox />
      <Router>
        <ShowHideConfigProvider>
          <Switch>
            {routes.map((data, i) => {
              if (data.public === true) {
                return (
                  <Route
                    key={i}
                    exact
                    path={`${data.url}`}
                    component={data.component}
                  />
                );
              } else {
                return (
                  <PrivateRoute
                    key={i}
                    exact
                    path={`${data.url}`}
                    component={data.component}
                    hideLayout={data.hideLayout}
                  />
                );
              }
            })}
          </Switch>
        </ShowHideConfigProvider>
      </Router>
    </>
  );
};

export default Routes;

import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';
import { useUser } from '../../providers/contextUser';
import PageProductsEditAffiliates from './affiliates';
import PageProductsEditCheckout from './checkout';
import PageProductsEditClassrooms from './classrooms';
import PageProductsEditContent from './content';
import PageProductsEditCoproduction from './coproduction';
import PageCoupons from './coupons/MainPage';
import PageProductsEditGeneral from './general';
import Navigation from './navigation.js';
import PageProductsEditOffers from './offers';
import PageProductsEditPlans from './plans';
import PageProductsEditStudents from './students';
import PageTracking from './tracking/tracking';

import CheckoutConfig from './checkoutconfig';
import PageLinks from './links/pages';
import PageProductsEditManager from './manager.js';
import MemberConfig from './member-config';
import MemberCustom from './member-custom';
import MemberComments from './member-comments';
import MemberIntegrations from './member-integrations.js';
import MemberRecommended from './member-recommended';
import MemberBuilder from './member-builder';
import ProductMarket from './product-market';
import './styles.scss';
import PageProductEditSupplier from './supplier/index.js';
import { PageNativeUpsell } from './nativeUpsell/index.jsx';

const PageProductsEdit = () => {
  const { uuidProduct, subPage } = useParams();
  const { product, setProduct } = useProduct();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/products/product/${uuidProduct}`)
      .then((response) => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(() => { });
  }, []);

  const handleSubComponent = () => {
    if (subPage === 'geral') {
      return <PageProductsEditGeneral />;
    }
    if (subPage === 'checkout') {
      return <PageProductsEditCheckout />;
    }
    if (subPage === 'config') {
      return <CheckoutConfig />;
    }
    if (subPage === 'coproducao') {
      return <PageProductsEditCoproduction />;
    }
    if (subPage === 'gerentes') {
      return <PageProductsEditManager />;
    }
    if (subPage === 'afiliados') {
      return <PageProductsEditAffiliates />;
    }
    if (subPage === 'planos') {
      return <PageProductsEditPlans />;
    }
    if (subPage === 'ofertas') {
      return <PageProductsEditOffers />;
    }
    if (subPage === 'conteudo') {
      return <PageProductsEditContent />;
    }
    if (subPage === 'conteudo-config') {
      return <MemberConfig />;
    }
    if (subPage === 'conteudo-custom') {
      return <MemberCustom />;
    }
    if (subPage === 'conteudo-comments') {
      return <MemberComments />;
    }
    if (subPage === 'conteudo-integrations') {
      return <MemberIntegrations />;
    }
    if (subPage === 'conteudo-recommended') {
      return <MemberRecommended />;
    }
    if (subPage === 'conteudo-builder') {
      return <MemberBuilder />;
    }
    if (subPage === 'vitrine') {
      return <ProductMarket />;
    }
    if (subPage === 'turmas') {
      return <PageProductsEditClassrooms />;
    }
    if (subPage === 'alunos' || subPage === 'clientes') {
      return <PageProductsEditStudents />;
    }
    if (subPage === 'cupons') {
      return <PageCoupons />;
    }
    if (subPage === 'pages') {
      return <PageLinks product={product} />;
    }
    if (subPage === 'rastreio') {
      return <PageTracking />;
    }
    if (subPage === 'fornecedor') {
      return <PageProductEditSupplier />;
    }
    if (subPage === 'upsell-nativo') {
      if (!user?.upsell_native_enabled) {
        return (
          <div className='p-4 text-center'>
            <h5 style={{ opacity: 0.7 }}>
              Upsell Nativo desabilitado
            </h5>
            <p style={{ fontSize: 14, opacity: 0.6 }}>
              Entre em contato com o suporte para habilitar esta funcionalidade.
            </p>
          </div>
        );
      }

      return <PageNativeUpsell />;
    }
  };

  return (
    <>
      <PageTitle
        title={product?.name}
        path={[
          { url: '/produtos', text: 'Produtos' },
          { url: '/produtos/listar', text: 'Meus Produtos' },
          { url: null, text: product?.name },
        ]}
      />
      {loading ? (
        <div id='loaderProducts'>
          <i className='bx bx-loader-alt bx-spin' />
          <span>Carregando produto...</span>
        </div>
      ) : (
        <>
          <Row>
            <Col>
              <Navigation active={`/produtos/${uuidProduct}/editar`} />
            </Col>
          </Row>

          <section id='pageProductsEdit'>{handleSubComponent()}</section>
        </>
      )}
    </>
  );
};

export default PageProductsEdit;

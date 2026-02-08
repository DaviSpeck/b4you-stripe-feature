import { useEffect, useState } from 'react';
import { Card, Spinner } from 'react-bootstrap';
import ImageGallery from 'react-image-gallery';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';
import '../../scss/custom.scss';
import { currency, notify } from '../functions';
import ModalAffiliate from './ModalAffiliate';
import ModalCoupons from './ModalCoupons';
import ModalOffer from './ModalOffer';
import ModalPages from './ModalPages';
import ModalPixel from './ModalPixel';

const copyToClipboard = (element, param, text = 'Copiado com sucesso') => {
  if (element && element.select) element.select();
  navigator.clipboard.writeText(param);
  notify({
    message: text,
    type: 'success',
  });
  setTimeout(() => {}, 3000);
};

const affiliate = () => {
  const [accept, setAccept] = useState(false);
  const [requesting, setRequesting] = useState(true);
  const [showModalOffer, setShowModalOffer] = useState(false);
  const [showModalCoupons, setShowModalCoupons] = useState(false);
  const [showModalPixel, setShowModalPixel] = useState(false);
  const [showModalPages, setShowModalPages] = useState(false);
  const [showModalAffiliate, setShowModalAffiliate] = useState(false);
  const [response, setResponse] = useState(null);
  const { product, setProduct } = useProduct();
  const { uuidProduct } = useParams();
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponsRules, setCouponsRules] = useState([]);
  const [pages, setPages] = useState([]);
  const [productsGlobalAffiliation, setProductsGlobalAffiliation] = useState(
    []
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (
      product &&
      product.affiliate_status &&
      product.affiliate_status.id === 2
    ) {
      fetchCoupons();
    }
  }, [product]);

  const fetchCoupons = () => {
    api
      .get(`/market/coupons/${uuidProduct}`)
      .then((response) => {
        setCoupons(response.data.coupons);
        setCouponsRules(response.data.coupons_rules);
      })
      .catch(() => {});
    setRequesting(false);
  };

  const fetchData = () => {
    api
      .get(`/market/${uuidProduct}`)
      .then((response) => {
        setProduct(response.data);
        setOffers(response.data.offers);
        setPages(response.data.pages);
        setImages(
          response.data.affiliate_images.map((item) => ({
            ...item,
            original: item.file,
            thumbnail: item.file,
          }))
        );

        api
          .get(`/market/${response.data.id}/global`)
          .then((r) => {
            setProductsGlobalAffiliation(r.data.products);
          })
          .catch(() => {});
      })
      .catch(() => {});
    setRequesting(false);
  };

  const handleAffiliation = () => {
    api
      .post(`/market/affiliate/${uuidProduct}`)
      .then((response) => {
        if (response.data.status.id === 2) {
          notify({
            message: 'Afiliação feita com sucesso',
            type: 'success',
          });
          setResponse('success');
        } else {
          setResponse('pending');
        }
        fetchData();
      })
      .catch(() => {
        notify({
          message: 'Falha ao se afiliar',
          type: 'error',
        });
      });
    setRequesting(false);
  };

  const [images, setImages] = useState([]);

  return (
    <>
      <PageTitle
        title={`Página de afiliação`}
        path={[
          { url: '/vitrine', text: 'Vitrine' },
          { url: null, text: product?.name },
        ]}
      />
      <div id='page_market_affiliate'>
        <ModalOffer
          offers={offers}
          product={product}
          show={showModalOffer}
          setShow={setShowModalOffer}
          size='xl'
          copyToClipboard={copyToClipboard}
        />
        <ModalCoupons
          coupons={coupons}
          couponsRules={couponsRules}
          show={showModalCoupons}
          setShow={setShowModalCoupons}
          size='lg'
          copyToClipboard={copyToClipboard}
          fetchCoupons={fetchCoupons}
          productUuid={uuidProduct}
        />
        <ModalPixel
          show={showModalPixel}
          setShow={setShowModalPixel}
          size='lg'
        />
        <ModalPages
          pages={pages}
          show={showModalPages}
          setShow={setShowModalPages}
          size='xl'
          copyToClipboard={copyToClipboard}
          product={product}
        />
        <ModalAffiliate
          response={response}
          product={product}
          show={showModalAffiliate}
          setShow={setShowModalAffiliate}
          handleAffiliation={handleAffiliation}
          accept={accept}
          setAccept={setAccept}
          productsGlobalAffiliation={productsGlobalAffiliation}
        />
        <Card>
          <Card.Body>
            <div className='wrap-market'>
              <div id='left'>
                {images.length > 0 && (
                  <ImageGallery
                    items={images}
                    autoPlay={true}
                    showPlayButton={false}
                    showFullscreenButton={false}
                    showThumbnails={true}
                    thumbnailPosition={
                      window.innerWidth > 800 ? 'right' : 'bottom'
                    }
                  />
                )}

                <div className='right'>
                  <div className='left'>
                    <div>{product?.type}</div>
                    <h3>{product?.name}</h3>
                  </div>
                  {requesting ? (
                    <AlertDS
                      text={
                        <diV className='d-flex align-items-center'>
                          <div>Carregando</div>
                          <Spinner
                            animation='border'
                            role='status'
                            className='ml-2'
                            style={{
                              width: 20,
                              height: 20,
                              marginLeft: 8,
                            }}
                          ></Spinner>
                        </diV>
                      }
                      warn={''}
                      icon={''}
                      variant={'light'}
                    ></AlertDS>
                  ) : product?.is_producer ? (
                    <AlertDS
                      text={'Você é o produtor'}
                      warn={''}
                      icon={''}
                      variant='warning'
                    ></AlertDS>
                  ) : product?.is_coproducer ? (
                    <AlertDS
                      text={'Você é o coprodutor'}
                      warn={''}
                      icon={''}
                      variant='warning'
                    />
                  ) : product?.affiliate_status === null ? (
                    <ButtonDS
                      size='lg'
                      onClick={() => {
                        setShowModalAffiliate(true);
                      }}
                    >
                      Solicitar Afiliação
                    </ButtonDS>
                  ) : product?.affiliate_status?.id === 2 ? (
                    <AlertDS
                      text={'Você já é afiliado!'}
                      warn={''}
                      icon={''}
                      variant='warning'
                    ></AlertDS>
                  ) : product?.affiliate_status?.id === 1 ? (
                    <AlertDS
                      text={'Aprovação pendente...'}
                      warn={''}
                      icon={''}
                      variant='warning'
                    ></AlertDS>
                  ) : product?.affiliate_status?.id === 3 ? (
                    <AlertDS text={'Bloqueado'} warn={''} icon={''}></AlertDS>
                  ) : (
                    product === null && (
                      <AlertDS
                        text={'Produto não encontrado'}
                        warn={'danger'}
                        icon={''}
                      ></AlertDS>
                    )
                  )}
                </div>
                <div className='bottom'>
                  <div className='texts'>
                    <div className='text'>Comissões de até</div>
                    <div className='commission'>
                      {requesting ? (
                        <Spinner animation='border' role='status'></Spinner>
                      ) : product?.max_commission ? (
                        currency(product?.max_commission)
                      ) : (
                        currency(0)
                      )}
                    </div>
                  </div>
                </div>
                {/*   {
                !product &&{
                    <.

                }
              } */}
                <h4>Detalhes</h4>
                <ul className='details'>
                  {product?.click_attribution && (
                    <li>
                      <i class='bx bx-pointer mr-2'></i>
                      <span>{product?.click_attribution}</span>
                    </li>
                  )}
                  {product?.url_promotion_material && (
                    <li>
                      <i class='bx bx-package mr-2'></i>
                      <span>Material de Apoio</span>
                    </li>
                  )}
                  {product?.pages?.length > 0 && (
                    <li>
                      <i class='bx bx-layout mr-2'></i>
                      <span>Página alternativa</span>
                    </li>
                  )}
                  {product?.manual_approval ? (
                    <li>
                      <i class='bx bx-shape-circle mr-2'></i>
                      <span>Afiliação por aprovação</span>
                    </li>
                  ) : (
                    <li>
                      <i class='bx bx-shape-circle mr-2'></i>
                      <span>Afiliação automática</span>
                    </li>
                  )}
                  <li>
                    <i class='bx bx-cookie mr-2'></i>
                    {product?.cookies_validity === 0 ? (
                      <span>Cookie Eterno</span>
                    ) : (
                      <span>Cookie {product?.cookies_validity} dias</span>
                    )}
                  </li>
                  {productsGlobalAffiliation.length > 0 && (
                    <li>
                      <i class='bx bx-box mr-2'></i>
                      <span>Outros produtos da linha disponíveis</span>
                    </li>
                  )}
                </ul>
                <div className='description'>
                  <h4>Descrição do Produto</h4>
                  <p>
                    {product?.description
                      ? product.description.split('\n').map((line, idx) => (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        ))
                      : 'Este produto não tem descrição.'}
                  </p>
                  <h4>Regras do produto</h4>
                  <p>
                    {product?.general_rules ||
                      'Produto não tem regras registradas.'}
                  </p>
                </div>
              </div>

              <div id='right'>
                <h6>Sobre o produtor</h6>
                {product?.producer?.profile_picture && (
                  <img
                    src={product?.producer?.profile_picture}
                    className='mt-3'
                    style={{ maxWidth: '100px', borderRadius: '100%' }}
                  />
                )}
                <div className='created-at'>
                  Nome: {product?.producer?.name || 'Desconhecido'}
                </div>
                <div className='created-at'>
                  E-mail: {product?.support_email || <span>Não informado</span>}
                </div>
                {product?.producer?.created_at && (
                  <div className='created-at'>
                    Na B4you desde {product?.producer?.created_at}
                  </div>
                )}
                {(product?.is_producer ||
                  product?.is_coproducer ||
                  product?.affiliate_status?.id === 2) && <hr />}

                {(product?.is_producer ||
                  product?.is_coproducer ||
                  product?.affiliate_status?.id === 2) && (
                  <div className='list-buttons'>
                    <ButtonDS
                      className='w-100'
                      iconLeft='bx-cart'
                      onClick={() => setShowModalOffer(true)}
                    >
                      Ofertas
                    </ButtonDS>
                    <ButtonDS
                      className='mt-2 w-100'
                      iconLeft='bx-checkbox-minus'
                      onClick={() => setShowModalPages(true)}
                    >
                      Página de Vendas
                    </ButtonDS>
                    <ButtonDS
                      className='mt-2 w-100'
                      iconLeft='bx-purchase-tag-alt'
                      onClick={() => setShowModalPixel(true)}
                    >
                      Pixel
                    </ButtonDS>
                    {product?.url_promotion_material ? (
                      <a
                        href={product?.url_promotion_material}
                        target='_blank'
                        rel='noreferrer'
                      >
                        <ButtonDS className='mt-2 w-100' iconLeft='bx-link'>
                          Material de Apoio
                        </ButtonDS>
                      </a>
                    ) : (
                      <ButtonDS
                        className='mt-2 w-100'
                        iconLeft='bx-link'
                        disabled
                      >
                        Material de Apoio
                      </ButtonDS>
                    )}
                    {couponsRules.length > 0 && (
                      <ButtonDS
                        className='mt-2 w-100'
                        iconLeft='bx-cart'
                        onClick={() => setShowModalCoupons(true)}
                      >
                        Cupons
                      </ButtonDS>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default affiliate;

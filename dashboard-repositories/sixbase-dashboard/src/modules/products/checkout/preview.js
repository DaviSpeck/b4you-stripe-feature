import { useState } from 'react';
import { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ImgDesktop from '../../../images/checkout/desktop.png';
import ImgMobile from '../../../images/checkout/mobile.png';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import './style.scss';

const PreviewCheckout = () => {
  const [requesting, setRequesting] = useState(true);
  const [product, setProduct] = useState(null);
  const [version, setVersion] = useState('desktop');
  const { uuidProduct } = useParams();

  const goBack = () => {
    window.location =
      window.location.origin + `/produtos/editar/${uuidProduct}/checkout`;
  };

  useEffect(() => {
    api
      .get(`/products/product/${uuidProduct}`)
      .then((r) => {
        setProduct(r.data);

        setRequesting(false);

        document.body.style.backgroundColor = r.data.hex_color;
      })
      .catch(() => {});
  }, []);

  return (
    <section id='preview-checkout'>
      {requesting ? (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Loader title={'Carregando checkout preview...'} />
        </div>
      ) : (
        <>
          <nav>
            <ButtonDS
              variant='light'
              size='sm'
              onClick={goBack}
              iconLeft='bx-chevron-left'
            >
              Voltar
            </ButtonDS>
            <div className='controls'>
              <ButtonDS
                size={'sm'}
                onClick={() => setVersion('desktop')}
                variant={version !== 'desktop' ? 'light' : 'primary'}
                iconLeft='bx-desktop'
              >
                Desktop
              </ButtonDS>
              <ButtonDS
                size={'sm'}
                onClick={() => setVersion('mobile')}
                variant={version !== 'mobile' ? 'light' : 'primary'}
                iconLeft='bx-mobile'
              >
                Mobile
              </ButtonDS>
            </div>
          </nav>
          <div
            className={`${version} container-fixed`}
            style={version == 'desktop' ? {} : { width: 400 }}
          >
            {product && (
              <Row>
                <Col xs={12}>
                  <header>
                    {version == 'desktop' ? (
                      <>
                        {product.url_video_checkout ? (
                          <div
                            className={
                              product.sidebar_picture
                                ? version === 'desktop' && 'w-100'
                                : 'w-100 d-flex justify-content-center'
                            }
                          >
                            <Col
                              lg={
                                version === 'desktop'
                                  ? product.sidebar_picture
                                  : 12
                              }
                              className='p-0'
                            >
                              <div className='wrap-content-insertion wrap-content-insertion-2 mb-2'>
                                <div
                                  className='content-insertion'
                                  dangerouslySetInnerHTML={{
                                    __html: product.url_video_checkout,
                                  }}
                                ></div>
                              </div>
                            </Col>
                          </div>
                        ) : (
                          <img
                            className='img-fluid'
                            src={product.header_picture}
                            alt=''
                          />
                        )}
                        <img
                          className='img-fluid mt-2'
                          src={product.header_picture_secondary}
                          alt=''
                        />
                      </>
                    ) : (
                      <>
                        {product.url_video_checkout ? (
                          <div
                            className={
                              product.sidebar_picture
                                ? version === 'desktop' && 'w-100'
                                : 'w-100 d-flex justify-content-center'
                            }
                          >
                            <Col
                              lg={
                                version === 'desktop'
                                  ? product.sidebar_picture
                                  : 12
                              }
                              className='p-0'
                            >
                              <div className='wrap-content-insertion wrap-content-insertion-2 wrap-content-insertion-3 mb-2'>
                                <div
                                  className='content-insertion'
                                  dangerouslySetInnerHTML={{
                                    __html: product.url_video_checkout,
                                  }}
                                ></div>
                              </div>
                            </Col>
                          </div>
                        ) : (
                          <img
                            className='img-fluid'
                            src={product.header_picture_mobile}
                            alt=''
                          />
                        )}

                        {product.second_header_mobile && (
                          <img
                            className='img-fluid mt-1'
                            src={product.second_header_mobile}
                            alt=''
                          />
                        )}
                      </>
                    )}
                  </header>
                </Col>

                <div
                  className={
                    product.sidebar_picture
                      ? version === 'desktop'
                        ? 'w-75'
                        : 'w-100'
                      : 'w-100 d-flex justify-content-center'
                  }
                >
                  <Col
                    lg={
                      version === 'desktop'
                        ? product.sidebar_picture
                          ? 12
                          : 9
                        : 12
                    }
                  >
                    <main>
                      <div className='logo'>
                        {product.logo ? (
                          <img
                            src={product.logo}
                            className='img-fluid'
                            alt=''
                          />
                        ) : (
                          <h2
                            className='title'
                            style={{ color: product.hex_color }}
                          >
                            {product.name}
                          </h2>
                        )}
                      </div>
                      {version == 'desktop' ? (
                        <img
                          className='checkout-placeholder desktop'
                          src={ImgDesktop}
                          alt='checkout placeholder'
                        />
                      ) : (
                        <img
                          className='checkout-placeholder mobile'
                          src={ImgMobile}
                          alt='checkout placeholder'
                        />
                      )}
                    </main>
                  </Col>
                </div>

                <Col
                  lg={
                    version === 'desktop'
                      ? product.sidebar_picture
                        ? 3
                        : 0
                      : 12
                  }
                >
                  <aside>
                    <img
                      className='img-fluid'
                      src={product.sidebar_picture}
                      alt=''
                      style={
                        version === 'mobile'
                          ? { marginTop: 15, marginBottom: 15 }
                          : undefined
                      }
                    />
                  </aside>
                </Col>
              </Row>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default PreviewCheckout;

import { useEffect, useState } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form7';
import ReactSwitch from 'react-switch';
import ButtonDS from '../../../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../../../providers/api';
import { HtmlCopy } from './htmlCopy';
import { StyleView } from './style-view';
import { UpsellProducts } from './components/upsellProductList';
import { UpsellOffers } from './components/upsellOfferList';
import { UpsellPlanOptions } from './components/upsellPlanList';

export const UpsellExternalConfig = (props) => {
  const [upsellProduct, setUpsellProduct] = useState(null);
  const [deliveryURL, setDeliveryURL] = useState(null);
  const [isOneClick, setIsOneClick] = useState(true);

  const { offer, uuidProduct, onBack } = props;

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      textAcceptUpsell: 'Sim, eu aceito essa oferta especial!',
      textRefuseUpsell: 'Não, eu gostaria de recusar essa oferta',
      colorUpsell: '#1d1d1d',
      colorAcceptUpsell: '#ffffff',
      colorRefuseUpsell: '#000000',
      fontSizeUpsell: 20,
      fontSizeUpsellRefused: 20,
      actionAcceptUpsell: 'delivery',
      actionRefuseUpsell: 'delivery',
      isUpsellSubscription: '',
      urlAcceptUpsell: '',
      urlRefuseUpsell: '',
      deliveryURL: '',
      upsell: '',
      plan: '',
    },
  });

  const upsellData = {
    actionAcceptUpsell: form.watch('actionAcceptUpsell'),
    actionRefuseUpsell: form.watch('actionRefuseUpsell'),
    urlAcceptUpsell: form.watch('urlAcceptUpsell'),
    urlRefuseUpsell: form.watch('urlRefuseUpsell'),
    upsell: form.watch('upsell'),
    plan: form.watch('plan'),
  };

  const stylePreviewData = {
    colorUpsell: form.watch('colorUpsell'),
    colorAcceptUpsell: form.watch('colorAcceptUpsell'),
    fontSizeUpsell: form.watch('fontSizeUpsell'),
    textAcceptUpsell: form.watch('textAcceptUpsell'),
    colorRefuseUpsell: form.watch('textRefuseUpsell'),
    fontSizeUpsellRefused: form.watch('fontSizeUpsellRefused'),
    textRefuseUpsell: form.watch('textRefuseUpsell'),
  };

  const getDeliveryURL = async () => {
    try {
      const { data } = await api.get(
        `/products/offers/${uuidProduct}/delivery-url`
      );
      setDeliveryURL(data.url);
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    getDeliveryURL();
  }, []);

  return (
    <>
      <div className='d-flex justify-content-start mb-2'>
        <ButtonDS
          size='sm'
          variant='light'
          iconLeft='bxs-chevron-left'
          onClick={onBack}
        >
          Voltar
        </ButtonDS>
      </div>
      <div id='upsell-generator' style={{ paddingTop: '8px' }}>
        {uuidProduct && offer ? (
          <div className='wrap'>
            <Row>
              <Col md={12}>
                <UpsellProducts
                  uuidProduct={uuidProduct}
                  uuidOffer={offer?.uuid}
                  onChange={({ product, offerId, planId }) => {
                    setUpsellProduct(product);
                    form.setValue('upsell', offerId);
                    form.setValue('plan', planId ?? '');
                  }}
                />
              </Col>
              {upsellProduct && (
                <Col md={12}>
                  <Form.Group>
                    <div className='d-flex align-items-center mb-2'>
                      <ReactSwitch
                        className='react-switch'
                        checked={isOneClick}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor='#0f1b35'
                        onHandleColor='#fff'
                        boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                        activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                        handleDiameter={24}
                        height={30}
                        width={56}
                        onChange={() => {
                          setIsOneClick(!isOneClick);
                        }}
                      />
                      <label htmlFor='' className='ml-2 mb-0'>
                        Upsell de 1 clique
                      </label>
                    </div>
                    <UpsellOffers
                      productSelect={upsellProduct}
                      onChange={({ uuid, planId }) => {
                        form.setValue('upsell', uuid);
                        form.setValue('plan', planId ?? '');
                      }}
                    />
                  </Form.Group>
                </Col>
              )}
              {upsellProduct?.payment_type !== 'single' && (
                <Col>
                  <UpsellPlanOptions
                    offers={upsellProduct?.offers}
                    value={upsellData.upsell}
                    onChange={(e) => form.setValue('plan', e.target.value)}
                  />
                </Col>
              )}
            </Row>
            {upsellProduct && upsellData.upsell && (
              <>
                <Row>
                  <Col md={12}>
                    <Form.Group>
                      <label htmlFor=''>Ação ao aceitar Upsell</label>
                      <Form.Control
                        as='select'
                        {...form.register('actionAcceptUpsell')}
                      >
                        {upsellProduct.payment_type !== 'subscription' ? (
                          <option key='actionAcceptDelivery' value='delivery'>
                            Finalizar pedido
                          </option>
                        ) : (
                          <option key='actionAcceptDelivery' value='delivery'>
                            Redirecionar para área de membros
                          </option>
                        )}

                        <option
                          key='actionAcceptOtherOffer'
                          value='other_offer'
                        >
                          Outra Oferta
                        </option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <label htmlFor=''>Ação ao Recusar Upsell</label>
                      <Form.Control
                        as='select'
                        {...form.register('actionRefuseUpsell')}
                      >
                        {upsellProduct.payment_type !== 'subscription' ? (
                          <option key='actionRefuseDelivery' value='delivery'>
                            Finalizar pedido
                          </option>
                        ) : (
                          <option key='actionRefuseDelivery' value='delivery'>
                            Redirecionar para área de membros
                          </option>
                        )}
                        <option
                          key='actionRefuseOtherOffer'
                          value='other_offer'
                        >
                          Outra Oferta
                        </option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    {upsellData.actionAcceptUpsell &&
                      upsellData.actionAcceptUpsell === 'other_offer' && (
                        <Form.Group>
                          <label htmlFor=''>URL da Proxima Oferta</label>
                          <Form.Control
                            type='url'
                            {...form.register('urlAcceptUpsell')}
                          ></Form.Control>
                        </Form.Group>
                      )}
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <label htmlFor=''>Texto do botão Aceitar Upsell</label>
                      <Form.Control
                        type='text'
                        {...form.register('textAcceptUpsell')}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <label htmlFor=''>Texto do botão Recusar Upsell</label>
                      <Form.Control
                        type='text'
                        {...form.register('textRefuseUpsell')}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    {upsellData.actionRefuseUpsell &&
                      upsellData.actionRefuseUpsell === 'other_offer' && (
                        <Form.Group>
                          <label htmlFor=''>URL da Proxima Oferta</label>
                          <Form.Control
                            type='url'
                            {...form.register('urlRefuseUpsell')}
                          ></Form.Control>
                        </Form.Group>
                      )}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group>
                      <label htmlFor=''>Cor botão Aceitar</label>
                      <Form.Control
                        type='color'
                        style={{ height: 50, width: 80 }}
                        {...form.register('colorUpsell')}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <label htmlFor=''>Cor texto Aceitar</label>
                      <Form.Control
                        type='color'
                        style={{ height: 50, width: 80 }}
                        {...form.register('colorAcceptUpsell')}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group>
                      <label htmlFor=''>Cor texto Recusar</label>
                      <Form.Control
                        type='color'
                        style={{ height: 50, width: 80 }}
                        {...form.register('colorRefuseUpsell')}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row className='mb-4'>
                  <Col>
                    <label htmlFor=''>Tamanho fonte aceitar</label>
                    <InputGroup style={{ height: 50, width: 130 }}>
                      <Form.Control
                        type='number'
                        {...form.register('fontSizeUpsell')}
                      />
                      <InputGroup.Append>
                        <InputGroup.Text>px</InputGroup.Text>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>
                  <Col>
                    <label htmlFor=''>Tamanho fonte recusar</label>
                    <InputGroup style={{ height: 50, width: 130 }}>
                      <Form.Control
                        type='number'
                        name='fontSizeUpsellRefused'
                        {...form.register('fontSizeUpsellRefused')}
                      />
                      <InputGroup.Append>
                        <InputGroup.Text>px</InputGroup.Text>
                      </InputGroup.Append>
                    </InputGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>Prévia</Col>
                  <Col>
                    <StyleView {...stylePreviewData} />
                  </Col>
                </Row>
              </>
            )}
          </div>
        ) : (
          'Produto não encontrado.'
        )}
        <Row className='mt-1 align-items-center'>
          <Col md={12}>
            <p style={{ fontSize: 13, lineHeight: '19px', margin: 0 }}>
              Copie o código HTML clicando no botão ao lado e cole no corpo da
              sua página de vendas, no local onde você quer que o botão apareça.
            </p>
            <a
              href='https://ajuda.b4you.com.br/post/282/como-configurar-sua-pagina-de-upsell-na-sixbase'
              target='_blank'
              rel='noreferrer'
              className='d-flex align-items-center'
              style={{
                color: '#0f1b35',
                fontSize: 13,
              }}
            >
              <span
                style={{
                  textDecoration: 'underline',
                }}
              >
                Saiba mais
              </span>
              <i className='bx bx-chevron-right' style={{ fontSize: 16 }}></i>
            </a>
          </Col>
          <Col
            md={12}
            className='col-text-copy mt-2 d-flex justify-content-end'
          >
            <HtmlCopy
              {...stylePreviewData}
              {...upsellData}
              deliveryURL={deliveryURL}
              oneClickUpsel={isOneClick}
              isUpsellSubscription={
                upsellProduct?.payment_type === 'subscription'
              }
            />
          </Col>
        </Row>
      </div>
    </>
  );
};

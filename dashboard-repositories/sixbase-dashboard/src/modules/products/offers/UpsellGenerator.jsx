import { useEffect, useState } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useProduct } from '../../../providers/contextProduct';
import PropTypes from 'prop-types';
import { currency } from '../../functions';
import * as ReactDOMServer from 'react-dom/server';
import api from '../../../providers/api';
import resolveCDNURL from '../../../providers/cdnUpsell';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ReactSwitch from 'react-switch';

const UpsellGenerator = ({ activeOffer, setNav, notify, uuidProduct }) => {
  const { register, trigger, watch, getValues, reset } = useForm({
    mode: 'onChange',
  });

  const [products, setProducts] = useState([]);

  const [upsellOffers, setUpsellOffers] = useState([]);
  const [deliveryURL, setDeliveryURL] = useState(null);
  const [isUpsellSubscription, setIsUpsellSubscription] = useState(false);
  const [isProductPhysical, setIsProductPhysical] = useState(false);

  const [oneClickUpsel, setOneClickUpsel] = useState(true);

  const { product } = useProduct();
  const [preview, setPreview] = useState({
    textAcceptUpsell: 'Sim, eu aceito essa oferta especial!',
    textRefuseUpsell: 'Não, eu gostaria de recusar essa oferta',
    colorUpsell: '#1d1d1d',
    colorAcceptUpsell: '#ffffff',
    colorRefuseUpsell: '#000000',
    fontSizeUpsell: 20,
    fontSizeUpsellRefused: 20,
  });

  const actionAcceptUpsell = watch('actionAcceptUpsell');
  const actionRefuseUpsell = watch('actionRefuseUpsell');
  const upsell = watch('upsell');
  const upsell_product = watch('upsell_product');

  const updatePreview = (e) => {
    setPreview((data) => ({ ...data, [e.target.name]: e.target.value }));
  };

  const fetchUpsellOffers = (uuidProduct, productsList = products) => {
    if (uuidProduct === 'none') {
      setUpsellOffers([]);
      return false;
    }

    let selectedProduct = productsList.find(
      (item) => item.uuid === uuidProduct
    );
    if (selectedProduct) {
      if (
        selectedProduct.payment_type !== 'single' &&
        isUpsellSubscription === false
      )
        setIsUpsellSubscription(true);

      if (
        selectedProduct.payment_type === 'single' &&
        isUpsellSubscription === true
      )
        setIsUpsellSubscription(false);
      setIsProductPhysical(selectedProduct.physical_type);
      setUpsellOffers(selectedProduct.offers);
      trigger();
    }
  };

  const fetchDeliveryURL = () => {
    api
      .get(`/products/offers/${uuidProduct}/delivery-url`)
      .then((response) => {
        setDeliveryURL(response.data.url);
      })
      .catch(() => {});
  };

  const fetchProducts = () => {
    api
      .get(
        `/products/offers/${uuidProduct}/${activeOffer.uuid}/select-offers?subscriptions=true`
      )
      .then((response) => {
        setProducts(response.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    reset(preview);
    fetchDeliveryURL();
    fetchProducts();
  }, []);

  const renderPreview = (removeBorders = false) => (
    <div
      className='buttons-root'
      style={
        removeBorders
          ? {
              border: 'unset',
            }
          : {
              backgroundColor: 'rgba(240,241,245,1)',
            }
      }
    >
      <div className='buttons-container'>
        <button
          id='acceptUpsell'
          className='accept-upsell'
          style={{
            backgroundColor: `${preview.colorUpsell}`,
            color: `${preview.colorAcceptUpsell}`,
            fontSize: `${preview.fontSizeUpsell}px`,
          }}
        >
          {preview.textAcceptUpsell}
        </button>
        <div
          className='refuse-upsell'
          id='refuseUpsell'
          style={{
            color: `${preview.colorRefuseUpsell}`,
            fontSize: `${preview.fontSizeUpsellRefused}px`,
          }}
        >
          {preview.textRefuseUpsell}
        </div>
      </div>
    </div>
  );

  const [requesting, setRequesting] = useState(false);

  const generateHTML = () => {
    let html = ReactDOMServer.renderToString(renderPreview(true));
    const style = document.createElement('link');
    const cdnURL = resolveCDNURL();
    style.rel = 'stylesheet';
    style.href = `${cdnURL}/css/style.min.css`;
    html = `${style.outerHTML}\n${html}`;
    html += `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap"
    rel="stylesheet"
  />`;
    html += `
  <div id="modal-upsell-container" class="modal-container">
    <div class="modal" id="modal-upsell">
      <div class="modal-header">
        <h3 class="subtitulo">Pagamento adicional</h3>
      </div>
      <div class="border"></div>
      <div class="modal-body">
        <iframe 
          id="frameModalBody" 
          src=""
          ></iframe>
      </div>
      <div class="modal-footer">
        <div class="protected-buy">
          <div class="frame">
            <img src="${cdnURL}/css/images/bxs-check-shield.svg"/>
          </div>
          <span>Protegemos suas informações de pagamento
            usando criptografia para fornecer segurança
          </span>
        </div>
      </div>
    </div>
  </div>`;
    const scriptSource = document.createElement('script');
    scriptSource.src = `${cdnURL}/js/script.js`;
    const scriptVariables = document.createElement('script');
    scriptVariables.innerHTML = `
    let upsellOffer = "${upsell ? upsell : ''}";
    let upsellPlan = "${isUpsellSubscription ? getValues('plan') : ''}";
    let acceptUpsellURL = "${
      actionAcceptUpsell === 'other_offer' ? getValues('urlAcceptUpsell') : ''
    }";
    let refuseUpsellURL = "${
      actionRefuseUpsell === 'other_offer' ? getValues('urlRefuseUpsell') : ''
    }";
    let deliveryURL = "${deliveryURL}";
    let oneClick = ${oneClickUpsel};
  `;
    html += `\n${scriptVariables.outerHTML}`;
    html += `\n${scriptSource.outerHTML}`;
    return html;
  };

  const handleHTMLCopy = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html);
    notify({ message: 'HTML copiado!', type: 'success' });
  };

  const handleSaveHTML = () => {
    if (!activeOffer || !activeOffer.uuid) return;

    setRequesting(true);
    const html = generateHTML();

    const fields = {
      ...activeOffer,
      upsell_page: html,
      sales_page_url: '',
    };

    api
      .put(`/products/offers/${uuidProduct}/${activeOffer.uuid}`, fields)
      .then(() => {
        notify({ message: 'Salvo com sucesso', type: 'success' });

        setRequesting(false);
      })
      .catch((err) => {
        if (err.response) {
          const { message } = err.response.data;
          notify({ message, type: 'error' });
        } else {
          notify({ message: 'Falha ao salvar', type: 'error' });
        }
        setRequesting(false);
      });
  };

  return (
    <div id='upsell-generator'>
      <div
        className='d-flex justify-content-end'
        style={{ fontSize: 14, marginBottom: 20 }}
      >
        <ButtonDS
          size={'sm'}
          variant={'light'}
          onClick={() => setNav('form')}
          className='pointer'
          iconLeft={'bxs-chevron-left'}
        >
          Voltar
        </ButtonDS>
      </div>
      {product ? (
        <div className='wrap'>
          <Row>
            <Col md={12}>
              <Form.Group>
                <label htmlFor=''>Produto</label>
                <Form.Control
                  ref={register}
                  as='select'
                  name='upsell_product'
                  onChange={(e) => {
                    fetchUpsellOffers(e.target.value);
                  }}
                  defaultValue={'none'}
                >
                  <option value={'none'}>Não oferecer up-sell</option>
                  {products.some((p) => p.payment_type === 'single') ? (
                    <optgroup label='Pagamento unico'>
                      {products
                        .filter((p) => p.payment_type === 'single')
                        .map((item) => (
                          <option value={item.uuid} key={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                  {products.some((p) => p.payment_type !== 'single') ? (
                    <optgroup label='Pagamento recorrente'>
                      {products
                        .filter((p) => p.payment_type !== 'single')
                        .map((item) => (
                          <option value={item.uuid} key={item.uuid}>
                            {item.name}
                          </option>
                        ))}
                    </optgroup>
                  ) : (
                    <></>
                  )}
                </Form.Control>
              </Form.Group>
            </Col>
            {upsell_product && (
              <Col
                md={12}
                style={{
                  display:
                    getValues('upsell_product') === undefined ||
                    getValues('upsell_product') === 'none'
                      ? 'none'
                      : 'block',
                }}
              >
                <Form.Group>
                  <div className='d-flex align-items-center mb-2'>
                    <ReactSwitch
                      onChange={() => {
                        setOneClickUpsel(!oneClickUpsel);
                      }}
                      checked={oneClickUpsel}
                      checkedIcon={false}
                      uncheckedIcon={false}
                      onColor='#0f1b35'
                      onHandleColor='#fff'
                      boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                      activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                      handleDiameter={24}
                      height={30}
                      width={56}
                      className='react-switch'
                    />
                    <label htmlFor='' className='ml-2 mb-0'>
                      Upsell de 1 clique
                    </label>
                  </div>

                  <label htmlFor=''>Oferta</label>
                  <Form.Control
                    ref={register({ required: true })}
                    as='select'
                    name='upsell'
                  >
                    {upsellOffers.map((item, index) => {
                      return (
                        <option value={item.uuid} key={index}>
                          {item.label}{' '}
                          {!isUpsellSubscription
                            ? ` - ${currency(item.price)}`
                            : ''}
                        </option>
                      );
                    })}
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
            {isUpsellSubscription && (
              <Col>
                <Form.Group>
                  <Form.Label>Plano</Form.Label>
                  <Form.Control
                    ref={register({ required: true })}
                    as='select'
                    name='plan'
                  >
                    {upsellOffers.map((offer) => {
                      return offer.plans.map((item) => {
                        return (
                          <option value={item.uuid} key={item.uuid}>
                            {item.label} - {currency(item.price)} (
                            {item.frequency_label})
                          </option>
                        );
                      });
                    })}
                  </Form.Control>
                </Form.Group>
              </Col>
            )}
          </Row>
          {upsell_product && upsell && (
            <>
              <Row>
                <Col md={12}>
                  <Form.Group>
                    <label htmlFor=''>Ação ao aceitar Upsell</label>
                    <Form.Control
                      ref={register}
                      as='select'
                      name='actionAcceptUpsell'
                    >
                      {isProductPhysical ? (
                        <option key='actionAcceptDelivery' value='delivery'>
                          Finalizar pedido
                        </option>
                      ) : (
                        <option key='actionAcceptDelivery' value='delivery'>
                          Redirecionar para área de membros
                        </option>
                      )}

                      <option key='actionAcceptOtherOffer' value='other_offer'>
                        Outra Oferta
                      </option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <label htmlFor=''>Ação ao Recusar Upsell</label>
                    <Form.Control
                      ref={register}
                      as='select'
                      name='actionRefuseUpsell'
                    >
                      {isProductPhysical ? (
                        <option key='actionRefuseDelivery' value='delivery'>
                          Finalizar pedido
                        </option>
                      ) : (
                        <option key='actionRefuseDelivery' value='delivery'>
                          Redirecionar para área de membros
                        </option>
                      )}
                      <option key='actionRefuseOtherOffer' value='other_offer'>
                        Outra Oferta
                      </option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  {actionAcceptUpsell &&
                    actionAcceptUpsell === 'other_offer' && (
                      <Form.Group>
                        <label htmlFor=''>URL da Proxima Oferta</label>
                        <Form.Control
                          ref={register}
                          type='url'
                          name='urlAcceptUpsell'
                        ></Form.Control>
                      </Form.Group>
                    )}
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <label htmlFor=''>Texto do botão Aceitar Upsell</label>
                    <Form.Control
                      ref={register}
                      type='text'
                      name='textAcceptUpsell'
                      onChange={updatePreview}
                    ></Form.Control>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <label htmlFor=''>Texto do botão Recusar Upsell</label>
                    <Form.Control
                      ref={register}
                      type='text'
                      name='textRefuseUpsell'
                      onChange={updatePreview}
                    ></Form.Control>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  {actionRefuseUpsell &&
                    actionRefuseUpsell === 'other_offer' && (
                      <Form.Group>
                        <label htmlFor=''>URL da Proxima Oferta</label>
                        <Form.Control
                          ref={register}
                          type='url'
                          name='urlRefuseUpsell'
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
                      ref={register}
                      type='color'
                      name='colorUpsell'
                      defaultValue={`#1d1d1d`}
                      style={{ height: 50, width: 80 }}
                      onChange={updatePreview}
                    ></Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <label htmlFor=''>Cor texto Aceitar</label>
                    <Form.Control
                      ref={register}
                      type='color'
                      name='colorAcceptUpsell'
                      defaultValue={`${preview.colorAcceptUpsell}`}
                      style={{ height: 50, width: 80 }}
                      onChange={updatePreview}
                    ></Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <label htmlFor=''>Cor texto Recusar</label>
                    <Form.Control
                      ref={register}
                      type='color'
                      name='colorRefuseUpsell'
                      defaultValue={`${preview.colorRefuseUpsell}`}
                      style={{ height: 50, width: 80 }}
                      onChange={updatePreview}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row className='mb-4'>
                <Col>
                  <label htmlFor=''>Tamanho fonte aceitar</label>
                  <InputGroup style={{ height: 50, width: 130 }}>
                    <Form.Control
                      ref={register}
                      type='number'
                      name='fontSizeUpsell'
                      defaultValue={preview.fontSize}
                      onChange={updatePreview}
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
                      ref={register}
                      type='number'
                      name='fontSizeUpsellRefused'
                      defaultValue={preview.fontSize}
                      onChange={updatePreview}
                    />
                    <InputGroup.Append>
                      <InputGroup.Text>px</InputGroup.Text>
                    </InputGroup.Append>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col sm={12}>Prévia</Col>
                <Col>{renderPreview()}</Col>
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
            Copie o código HTML clicando no botão ao lado e cole no corpo da sua
            página de vendas, no local onde você quer que o botão apareça.
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
        <Col md={12} className='col-text-copy mt-2 d-flex justify-content-end'>
          <ButtonDS
            size={'sm'}
            variant='primary'
            onClick={handleHTMLCopy}
            iconLeft={'bx-copy-alt'}
          >
            <span>Copiar HTML</span>
          </ButtonDS>
          {/* <ButtonDS
            size={'sm'}
            variant='success'
            className='ml-2'
            onClick={handleSaveHTML}
            iconLeft={'bx-save'}
            disabled={requesting}
          >
            <span>Salvar HTML</span>
          </ButtonDS> */}
        </Col>
      </Row>
    </div>
  );
};

UpsellGenerator.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
  setNav: PropTypes.func,
  notify: PropTypes.func,
  uuidProduct: PropTypes.string,
};

export default UpsellGenerator;

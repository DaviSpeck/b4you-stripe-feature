import { useState, useEffect } from 'react';
import { Card, Col, Form, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Switch from 'react-switch';
import api from '../../providers/api';
import { notify, currency } from '../functions';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import UploadImage from '../../jsx/components/UploadImage';
import RemoveUploadImage from '../../jsx/components/RemoveUploadImage';
import regexUrl from '../../utils/regex-url';
import Loader from '../../utils/loader';

const imageFields = [
  {
    route: 'banner',
    field: 'banner',
    label: 'Imagem de cabeçalho',
    width: 1100,
    height: 350,
  },
  {
    route: 'banner-secondary',
    field: 'banner_secondary',
    label: 'Segunda imagem de cabeçalho',
    width: 1100,
    height: 350,
  },
  {
    route: 'banner-mobile',
    field: 'banner_mobile',
    label: 'Imagem de cabeçalho mobile',
    width: 1000,
    height: 500,
  },
  {
    route: 'banner-mobile-secondary',
    field: 'banner_mobile_secondary',
    label: 'Segunda imagem de cabeçalho mobile',
    width: 1000,
    height: 500,
  },
  {
    route: 'sidebar',
    field: 'sidebar',
    label: 'Imagem lateral',
    width: 280,
    height: 900,
  },
  {
    route: 'offer_image_alternative',
    field: 'offer_image',
    label: 'Imagem Alternativa',
    width: 280,
    height: 900,
  },
];

/**
 * Configuracoes de checkout para ofertas de e-commerce
 * Inclui: Contador, Contador 3 Etapas, Termos, CNPJ, Back Redirect, Video, Imagens, Popup
 */
const ModalOfferCheckoutExtras = ({ shop, embedded = false }) => {
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [offer, setOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const productUuid = shop?.container_product?.uuid;
  const offerUuid = shop?.default_offer?.uuid;

  // Counter states
  const [isCounterActive, setIsCounterActive] = useState(false);
  const [counterSeconds, setCounterSeconds] = useState(130);
  const [counterLabel, setCounterLabel] = useState('Essa é a sua única chance!');
  const [counterLabelEnd, setCounterLabelEnd] = useState('O tempo acabou.');
  const [counterColor, setCounterColor] = useState('#66FFEA');

  // Counter 3 steps states
  const [isCounterThreeStepsActive, setIsCounterThreeStepsActive] = useState(false);
  const [counterSecondsThreeSteps, setCounterSecondsThreeSteps] = useState(130);
  const [counterLabelThreeSteps, setCounterLabelThreeSteps] = useState('Essa é a sua única chance!');
  const [counterLabelEndThreeSteps, setCounterLabelEndThreeSteps] = useState('O tempo acabou.');

  // Terms states
  const [terms, setTerms] = useState(false);
  const [urlTerms, setUrlTerms] = useState('');
  const [errorTerms, setErrorTerms] = useState(false);

  // CNPJ state
  const [showCnpj, setShowCnpj] = useState(false);

  // Back redirect state
  const [backRedirect, setBackRedirect] = useState(null);

  // Video embed state
  const [embed, setEmbed] = useState('');
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);

  // Popup states
  const [activePopup, setActivePopup] = useState(false);
  const [activeMoveMouse, setActiveMoveMouse] = useState(false);
  const [activeClosePage, setActiveClosePage] = useState(false);
  const [activeAfterTime, setActiveAfterTime] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [popup, setPopup] = useState({
    popup_delay: 0,
    popup_title: '',
    popup_discount_text: '',
    popup_button_text: '',
    popup_secondary_text: '',
    hex_color_bg: '#DB0000',
    hex_color_text: '#FFFFFF',
    hex_color_button: '#51B55B',
    hex_color_button_text: '#FFFFFF',
  });

  useEffect(() => {
    if (productUuid && offerUuid) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [productUuid, offerUuid]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch offer data
      const offersResponse = await api.get(`/products/${productUuid}/offers`);
      const offersArray = Array.isArray(offersResponse.data)
        ? offersResponse.data
        : (offersResponse.data?.offers || []);

      setOffers(offersArray);

      const offerData = offersArray.find(o => o.uuid === offerUuid);
      if (offerData) {
        setOffer(offerData);

        // Set counter values
        if (offerData.counter) {
          setIsCounterActive(offerData.counter.active || false);
          setCounterSeconds(offerData.counter.seconds || 130);
          setCounterLabel(offerData.counter.label || '');
          setCounterLabelEnd(offerData.counter.label_end || '');
          setCounterColor(offerData.counter.color || '#66FFEA');
        }

        // Set counter 3 steps values
        if (offerData.counter_three_steps) {
          setIsCounterThreeStepsActive(offerData.counter_three_steps.active || false);
          setCounterSecondsThreeSteps(offerData.counter_three_steps.seconds || 130);
          setCounterLabelThreeSteps(offerData.counter_three_steps.label || '');
          setCounterLabelEndThreeSteps(offerData.counter_three_steps.label_end || '');
        }

        // Set terms values
        setTerms(offerData.terms || false);
        setUrlTerms(offerData.url_terms || '');
        setErrorTerms(offerData.url_terms ? !regexUrl(offerData.url_terms) : false);

        // Set CNPJ value
        setShowCnpj(offerData.show_cnpj || false);

        // Set back redirect
        setBackRedirect(offerData.uuid_offer_back_redirect || null);

        // Set video embed
        setEmbed(offerData.url_video_checkout || '');

        // Set popup values
        if (offerData.popup) {
          setActivePopup(offerData.popup.active || false);
          setActiveMoveMouse(offerData.popup.mouseMove || false);
          setActiveClosePage(offerData.popup.closePage || false);
          setActiveAfterTime(offerData.popup.afterTime || false);
          setSelectedCoupon(offerData.popup.coupon || null);
          setPopup({
            popup_delay: offerData.popup.popup_delay || 0,
            popup_title: offerData.popup.popup_title || '',
            popup_discount_text: offerData.popup.popup_discount_text || '',
            popup_button_text: offerData.popup.popup_button_text || '',
            popup_secondary_text: offerData.popup.popup_secondary_text || '',
            hex_color_bg: offerData.popup.hex_color_bg || '#DB0000',
            hex_color_text: offerData.popup.hex_color_text || '#FFFFFF',
            hex_color_button: offerData.popup.hex_color_button || '#51B55B',
            hex_color_button_text: offerData.popup.hex_color_button_text || '#FFFFFF',
          });
        }
      }

      // Fetch coupons
      try {
        const couponsResponse = await api.get(`/products/coupons/${productUuid}?page=0&size=99999`);
        const now = new Date();
        const couponsFiltered = couponsResponse.data.rows.filter(
          (c) => c.active && (c.expires_at === null || new Date(c.expires_at) > now)
        );
        const couponsOptions = couponsFiltered.map((c) => ({
          label: `${c.coupon} - ${c.amount ? currency(c.amount) : c.percentage + '%'}`,
          value: c.uuid,
        }));
        setCoupons(couponsOptions);
      } catch (err) {
        console.warn('Erro ao carregar cupons:', err);
      }

      // Fetch back redirect offers
      try {
        const backRedirectResponse = await api.get(
          `/products/offers/${productUuid}/${offerUuid}/back-redirect`
        );
        setOffers(backRedirectResponse.data || []);
      } catch (err) {
        console.warn('Erro ao carregar ofertas para back redirect:', err);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeUrlTerms = (e) => {
    const { value } = e.target;
    setErrorTerms(!regexUrl(value));
    setUrlTerms(value);
  };

  const handlePopUpChange = (e) => {
    const { name, value } = e.target;
    setPopup((prev) => ({ ...prev, [name]: value }));
  };

  const setImg_link = (data) => {
    setOffer((prev) => ({ ...prev, [data.name]: data.url }));
  };

  const putEmbed = () => {
    api
      .put(`/products/offers/${productUuid}/${offerUuid}/video`, { embed })
      .then(() => {
        notify({ message: 'Vídeo enviado com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({ message: err.response?.data?.message || 'Erro ao enviar vídeo', type: 'error' });
      });
  };

  const removeEmbed = () => {
    setIsRemovingVideo(true);
    api
      .delete(`/products/offers/${productUuid}/${offerUuid}/video`)
      .then(() => {
        setEmbed('');
        notify({ message: 'Vídeo removido com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({ message: err.response?.data?.message || 'Erro ao remover vídeo', type: 'error' });
      })
      .finally(() => {
        setIsRemovingVideo(false);
      });
  };

  const handleSave = async () => {
    if (terms && errorTerms) {
      notify({ message: 'URL dos termos inválida', type: 'error' });
      return;
    }

    if (activePopup && !selectedCoupon) {
      notify({ message: 'Selecione um cupom para o popup', type: 'error' });
      return;
    }

    const requiredTextFieldsFilled =
      popup.popup_title && popup.popup_discount_text && popup.popup_button_text;

    if (activePopup && !requiredTextFieldsFilled) {
      notify({ message: 'Preencha todos os campos de texto obrigatórios do popup', type: 'error' });
      return;
    }

    setRequesting(true);
    try {
      const payload = {
        terms,
        url_terms: urlTerms,
        show_cnpj: showCnpj,
        counter: {
          active: isCounterActive,
          seconds: counterSeconds,
          label: counterLabel,
          label_end: counterLabelEnd,
          color: counterColor,
        },
        counter_three_steps: {
          active: isCounterThreeStepsActive,
          seconds: counterSecondsThreeSteps,
          label: counterLabelThreeSteps,
          label_end: counterLabelEndThreeSteps,
        },
        popup: {
          ...popup,
          active: activePopup,
          mouseMove: activeMoveMouse,
          closePage: activeClosePage,
          afterTime: activeAfterTime,
          coupon: selectedCoupon || null,
        },
      };

      await api.put(`/products/${productUuid}/offers/${offerUuid}`, payload);

      // Save back redirect separately
      if (backRedirect !== offer?.uuid_offer_back_redirect) {
        await api.put(`/products/offers/${productUuid}/${offerUuid}/back/redirect`, {
          backRedirect: backRedirect === 'null' ? null : backRedirect,
        });
      }

      notify({ message: 'Configurações salvas com sucesso!', type: 'success' });
    } catch (err) {
      console.error('Erro ao salvar:', err);
      notify({ message: 'Falha ao salvar configurações', type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <Loader title='Carregando configurações de checkout...' />;
  }

  if (!productUuid || !offerUuid) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Oferta padrão não encontrada</p>
      </div>
    );
  }

  return (
    <div>
      {/* Contador */}
      <div className='mb-4'>
        <div className='d-flex mt-3 mb-2'>
          <i className='bx bx-timer mr-2' style={{ fontSize: 25, color: '#0f1b35' }}></i>
          <h4>Contador Regressivo</h4>
        </div>
        <p className='text-muted'>Adicionar contador regressivo no topo do checkout</p>
        <Card>
          <Card.Body>
            <div className='d-flex align-items-center mb-3'>
              <Switch
                onChange={() => setIsCounterActive(!isCounterActive)}
                checked={isCounterActive}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor='#0f1b35'
                onHandleColor='#fff'
                handleDiameter={24}
                height={30}
                width={56}
              />
              <span className='ml-2'>{isCounterActive && <span>Ativo</span>}</span>
            </div>
            {isCounterActive && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Tempo do contador (segundos)</Form.Label>
                      <Form.Control
                        type='number'
                        value={counterSeconds}
                        onChange={(e) => setCounterSeconds(parseInt(e.target.value) || 0)}
                        placeholder='130'
                        min={1}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Cor Primária</Form.Label>
                      <div className='d-flex align-items-center'>
                        <Form.Control
                          type='color'
                          value={counterColor}
                          onChange={(e) => setCounterColor(e.target.value)}
                          style={{ height: 50, width: 80 }}
                        />
                        <i className='bx bxs-eyedropper ml-2' style={{ fontSize: 24 }} />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Texto (aparece ao iniciar)</Form.Label>
                      <Form.Control
                        type='text'
                        value={counterLabel}
                        onChange={(e) => setCounterLabel(e.target.value)}
                        placeholder='Essa é a sua única chance!'
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Texto final (aparece ao terminar)</Form.Label>
                      <Form.Control
                        type='text'
                        value={counterLabelEnd}
                        onChange={(e) => setCounterLabelEnd(e.target.value)}
                        placeholder='O tempo acabou.'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Contador 3 Etapas */}
      <div className='mb-4'>
        <div className='d-flex mt-3 mb-2'>
          <i className='bx bx-timer mr-2' style={{ fontSize: 25, color: '#0f1b35' }}></i>
          <h4>Contador 3 Etapas</h4>
        </div>
        <p className='text-muted'>Adicionar contador regressivo no topo do checkout 3 etapas</p>
        <Card>
          <Card.Body>
            <div className='d-flex align-items-center mb-3'>
              <Switch
                onChange={() => setIsCounterThreeStepsActive(!isCounterThreeStepsActive)}
                checked={isCounterThreeStepsActive}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor='#0f1b35'
                onHandleColor='#fff'
                handleDiameter={24}
                height={30}
                width={56}
              />
              <span className='ml-2'>{isCounterThreeStepsActive && <span>Ativo</span>}</span>
            </div>
            {isCounterThreeStepsActive && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Tempo do contador (segundos)</Form.Label>
                      <Form.Control
                        type='number'
                        value={counterSecondsThreeSteps}
                        onChange={(e) => setCounterSecondsThreeSteps(parseInt(e.target.value) || 0)}
                        placeholder='130'
                        min={1}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Texto (aparece ao iniciar)</Form.Label>
                      <Form.Control
                        type='text'
                        value={counterLabelThreeSteps}
                        onChange={(e) => setCounterLabelThreeSteps(e.target.value)}
                        placeholder='Essa é a sua única chance!'
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Texto final (aparece ao terminar)</Form.Label>
                      <Form.Control
                        type='text'
                        value={counterLabelEndThreeSteps}
                        onChange={(e) => setCounterLabelEndThreeSteps(e.target.value)}
                        placeholder='O tempo acabou.'
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Termos e Condições */}
      <div className='mb-4'>
        <h4>Termos e Condições</h4>
        <p className='text-muted'>Adicionar termos e condições para aceite no checkout</p>
        <Card>
          <Card.Body>
            <div className='d-flex align-items-center mb-3'>
              <Switch
                onChange={() => setTerms(!terms)}
                checked={terms}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor='#0f1b35'
                onHandleColor='#fff'
                handleDiameter={24}
                height={30}
                width={56}
              />
              <span className='ml-2'>{terms && <span>Ativo</span>}</span>
            </div>
            {terms && (
              <Form.Group>
                <Form.Label>* URL dos termos</Form.Label>
                <Form.Control
                  type='url'
                  placeholder='https://...'
                  value={urlTerms}
                  onChange={changeUrlTerms}
                  isInvalid={errorTerms}
                />
                {errorTerms && (
                  <Form.Control.Feedback type='invalid'>
                    URL inválida
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Permitir CNPJ */}
      <div className='mb-4'>
        <h4>Permitir venda por CNPJ?</h4>
        <p className='text-muted'>Configurar permissão para exibir campo de CNPJ no checkout</p>
        <Card>
          <Card.Body>
            <div className='d-flex align-items-center'>
              <Switch
                onChange={() => setShowCnpj(!showCnpj)}
                checked={showCnpj}
                checkedIcon={false}
                uncheckedIcon={false}
                onColor='#0f1b35'
                onHandleColor='#fff'
                handleDiameter={24}
                height={30}
                width={56}
              />
              <span className='ml-2'>{showCnpj && <span>Ativo</span>}</span>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Back Redirect */}
      <div className='mb-4'>
        <h4>Back Redirect</h4>
        <p className='text-muted'>
          Caso o cliente deseje voltar ou sair da página de checkout, ele será redirecionado
          para uma oferta de sua escolha.
        </p>
        <Card>
          <Card.Body>
            <Form.Group>
              <Form.Label>Escolha uma oferta para redirecionar</Form.Label>
              <Form.Control
                as='select'
                value={backRedirect || 'null'}
                onChange={(e) => setBackRedirect(e.target.value)}
              >
                <option value='null'>Nenhum (desativado)</option>
                {offers.map((item) => (
                  <option key={item.uuid} value={item.uuid}>
                    {item.name} - {currency(item.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Card.Body>
        </Card>
      </div>

      {/* Embed do Vídeo */}
      <div className='mb-4'>
        <h4>Embed do Vídeo</h4>
        <p className='text-muted'>
          Este vídeo poderá ser visualizado na parte superior do checkout.
          Para inserir o vídeo coloque o código embed no campo abaixo.
        </p>
        <Card>
          <Card.Body>
            <Form.Group className='w-100 d-flex mb-2'>
              <Form.Control
                type='text'
                value={embed}
                placeholder='Cole seu código embed aqui...'
                onChange={(e) => setEmbed(e.target.value)}
                style={{ borderRadius: '8px 0 0 8px' }}
              />
              <ButtonDS
                variant='primary'
                className='d-flex align-items-center'
                style={{ borderRadius: '0px 8px 8px 0px', fontSize: 14 }}
                onClick={putEmbed}
              >
                Enviar
              </ButtonDS>
            </Form.Group>
            <small className='d-block mt-2'>
              Dimensões esperadas <b>100% x 100%</b>
            </small>
            {embed && (
              <div className='mt-4'>
                <div className='wrap-content-insertion'>
                  <div className='isntembed'>Este código não é embed.</div>
                  <div
                    className='content-insertion'
                    dangerouslySetInnerHTML={{ __html: embed }}
                  ></div>
                </div>
                {!isRemovingVideo ? (
                  <ButtonDS
                    type='button'
                    variant='danger'
                    onClick={removeEmbed}
                    size='icon'
                    className='mt-2'
                    outline
                  >
                    <i className='bx bx-x' style={{ fontSize: 20 }}></i>
                  </ButtonDS>
                ) : (
                  <div className='d-block mt-2'>
                    <div className='d-flex align-items-center text-danger'>
                      <i className='bx bx-loader-alt bx-spin mr-2' style={{ fontSize: 20 }} />
                      <small>Removendo...</small>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Customizar Imagens da Oferta */}
      <div className='mb-4'>
        <h4>Customizar Imagens da Oferta</h4>
        <p className='text-muted'>Substitua imagens do checkout desta oferta.</p>
        {imageFields.map((item, index) => (
          <Card key={index} className='mb-3'>
            <Card.Body>
              <Row>
                <Col className='form-group' md={12}>
                  <label htmlFor=''>{item.label}</label>
                  <UploadImage
                    route={`/products/offers/${productUuid}/${offerUuid}/${item.route}`}
                    multiple={false}
                    field={item.field}
                    update={item.field}
                    isOffer={true}
                    setImg_link={(link) => setImg_link(link)}
                  />
                  <small className='d-block mt-2'>
                    Dimensões esperadas <b>{item.width} x {item.height} px</b>
                  </small>
                </Col>
                {offer && offer[item.field] && (
                  <Col className='form-group' md={12}>
                    <div className='form-group d-flex justify-content-start'>
                      <img
                        src={offer[item.field]}
                        className='img-fluid mr-4'
                        style={{ maxWidth: 'calc(100% - 70px)', maxHeight: '170px' }}
                        alt={item.label}
                      />
                    </div>
                    <RemoveUploadImage
                      route={`/products/offers/${productUuid}/${offerUuid}/${item.field}`}
                      field={item.field}
                      setImg_link={(link) => setImg_link({ name: item.field, url: link })}
                    />
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Popup de Retenção */}
      <div className='mb-4'>
        <h4>Pop-up de Retenção</h4>
        <p className='text-muted'>Personalize um pop-up de retenção exclusivo para essa oferta</p>

        {offer && !offer.allow_coupon ? (
          <p className='text-danger'>
            <i className='bx bx-lock-alt'></i> Para liberar essas configurações é necessário
            habilitar o uso de cupons na aba de Cupons.
          </p>
        ) : (
          <>
            <Card className='mb-3'>
              <Card.Body>
                <div className='d-flex justify-content-between align-items-center mb-3'>
                  <label className='mr-2 mb-0'>Ativar/Desativar</label>
                  <Switch
                    onChange={() => setActivePopup(!activePopup)}
                    checked={activePopup}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor='#0f1b35'
                    handleDiameter={24}
                    height={30}
                    width={56}
                  />
                </div>

                <div className='d-flex justify-content-between align-items-center mb-3'>
                  <label className='mr-2 mb-0'>Exibir ao mover o mouse para fora da tela</label>
                  <Switch
                    onChange={() => setActiveMoveMouse(!activeMoveMouse)}
                    checked={activeMoveMouse}
                    disabled={!activePopup}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor='#0f1b35'
                    handleDiameter={24}
                    height={30}
                    width={56}
                  />
                </div>

                <div className='d-flex justify-content-between align-items-center mb-3'>
                  <label className='mr-2 mb-0'>Exibir ao clicar voltar da página</label>
                  <Switch
                    onChange={() => setActiveClosePage(!activeClosePage)}
                    checked={activeClosePage}
                    disabled={!activePopup}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor='#0f1b35'
                    handleDiameter={24}
                    height={30}
                    width={56}
                  />
                </div>

                <div className='d-flex justify-content-between align-items-center'>
                  <label className='mr-2 mb-0'>
                    Exibir automaticamente apos (X) segundos no checkout
                  </label>
                  <Switch
                    onChange={() => setActiveAfterTime(!activeAfterTime)}
                    checked={activeAfterTime}
                    disabled={!activePopup}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor='#0f1b35'
                    handleDiameter={24}
                    height={30}
                    width={56}
                  />
                </div>
              </Card.Body>
            </Card>

            {activePopup && (
              <>
                <Card className='mb-3'>
                  <Card.Body>
                    <Form.Group className='mb-3'>
                      <Form.Label>
                        Tempo mínimo antes de qualquer pop-up ser exibido (segundos)
                        <OverlayTrigger
                          placement='top'
                          overlay={
                            <Tooltip>
                              Esse é o tempo mínimo que o usuário deve permanecer no checkout
                              antes que todos eventos de pop-up ativos sejam acionados.
                            </Tooltip>
                          }
                        >
                          <i className='bx bx-info-circle ml-2' style={{ cursor: 'help' }}></i>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Control
                        name='popup_delay'
                        type='number'
                        placeholder='ex: 10'
                        value={popup.popup_delay}
                        onChange={handlePopUpChange}
                        min={0}
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Cupom</Form.Label>
                      <Form.Control
                        as='select'
                        value={selectedCoupon || ''}
                        onChange={(e) => setSelectedCoupon(e.target.value || null)}
                      >
                        <option value=''>Selecione um cupom</option>
                        {coupons.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Título principal *</Form.Label>
                      <Form.Control
                        name='popup_title'
                        type='text'
                        placeholder='ex: VOCE GANHOU'
                        value={popup.popup_title}
                        onChange={handlePopUpChange}
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Texto do desconto *</Form.Label>
                      <Form.Control
                        name='popup_discount_text'
                        type='text'
                        placeholder='ex: DE DESCONTO'
                        value={popup.popup_discount_text}
                        onChange={handlePopUpChange}
                      />
                    </Form.Group>

                    <Form.Group className='mb-3'>
                      <Form.Label>Texto do botão de ação *</Form.Label>
                      <Form.Control
                        name='popup_button_text'
                        type='text'
                        placeholder='ex: CLIQUE AQUI E GARANTA SEU DESCONTO'
                        value={popup.popup_button_text}
                        onChange={handlePopUpChange}
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Texto secundário/descrição adicional (opcional)</Form.Label>
                      <Form.Control
                        name='popup_secondary_text'
                        type='text'
                        placeholder='Digite um texto adicional aqui'
                        value={popup.popup_secondary_text}
                        onChange={handlePopUpChange}
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Body>
                    <Row>
                      <Col md={3} className='mb-3'>
                        <Form.Label>Cor do Fundo</Form.Label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            name='hex_color_bg'
                            value={popup.hex_color_bg}
                            onChange={handlePopUpChange}
                            style={{ height: 50, width: 80 }}
                          />
                          <i className='bx bxs-eyedropper ml-2' style={{ fontSize: 24 }} />
                        </div>
                      </Col>
                      <Col md={3} className='mb-3'>
                        <Form.Label>Cor do Texto</Form.Label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            name='hex_color_text'
                            value={popup.hex_color_text}
                            onChange={handlePopUpChange}
                            style={{ height: 50, width: 80 }}
                          />
                          <i className='bx bxs-eyedropper ml-2' style={{ fontSize: 24 }} />
                        </div>
                      </Col>
                      <Col md={3} className='mb-3'>
                        <Form.Label>Cor do Botão</Form.Label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            name='hex_color_button'
                            value={popup.hex_color_button}
                            onChange={handlePopUpChange}
                            style={{ height: 50, width: 80 }}
                          />
                          <i className='bx bxs-eyedropper ml-2' style={{ fontSize: 24 }} />
                        </div>
                      </Col>
                      <Col md={3} className='mb-3'>
                        <Form.Label>Cor do Texto do Botão</Form.Label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            name='hex_color_button_text'
                            value={popup.hex_color_button_text}
                            onChange={handlePopUpChange}
                            style={{ height: 50, width: 80 }}
                          />
                          <i className='bx bxs-eyedropper ml-2' style={{ fontSize: 24 }} />
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      <div className='d-flex justify-content-end mt-4'>
        <ButtonDS onClick={handleSave} disabled={requesting}>
          {requesting ? 'Salvando...' : 'Salvar Configurações'}
        </ButtonDS>
      </div>
    </div>
  );
};

export default ModalOfferCheckoutExtras;

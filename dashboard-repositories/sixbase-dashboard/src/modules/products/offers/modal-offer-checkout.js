import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import Switch from 'react-switch';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import RemoveUploadImageOffer from '../../../jsx/components/RemoveUploadImageOffer';
import UploadImage from '../../../jsx/components/UploadImage';
import api from '../../../providers/api';
import regexUrl from '../../../utils/regex-url';
import { currency, notify } from '../../functions';

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

const ModalOfferCheckout = ({
  uuidProduct,
  activeOffer,
  setActiveOffer,
  terms,
  setTerms,
  urlTerms,
  setUrlTerms,
  errorTerms,
  setErrorTerms,
  activePopup,
  setActivePopup,
  activeMoveMouse,
  setActiveMoveMouse,
  activeClosePage,
  setActiveClosePage,
  selectedCoupom,
  setSelectedCoupom,
  popup,
  setPopup,
  activeAfterTime,
  setActiveAfterTime,
  showCnpj,
  setShowCnpj,
}) => {
  const [embed, setEmbed] = useState(activeOffer.url_video_checkout);
  const [offers, setOffers] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [backRedirect, setBackRedirect] = useState(
    activeOffer.uuid_offer_back_redirect
  );
  const [coupons, setCoupons] = useState([]);

  const handleChangeSelect = (e) => {
    setBackRedirect(e.target.value);
  };

  const setImg_link = (data) => {
    setActiveOffer((prev) => ({ ...prev, [data.name]: data.url }));
  };

  const putEmbed = () => {
    api
      .put(`/products/offers/${uuidProduct}/${activeOffer.uuid}/video`, {
        embed,
      })
      .then(() => {
        notify({ message: 'Vídeo enviado com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({ message: err.response.data.message, type: 'error' });
      });
  };

  const removeEmbed = () => {
    setIsRemoving(true);
    api
      .delete(`/products/offers/${uuidProduct}/${activeOffer.uuid}/video`)
      .then(() => {
        setEmbed(null);
        notify({ message: 'Vídeo removido com sucesso', type: 'success' });
        setIsRemoving(false);
        const inputDelete = document.querySelector('#embed-url');
        inputDelete.value = '';
      })
      .catch((err) => {
        notify({ message: err.response.data.message, type: 'error' });
        setIsRemoving(false);
      });
  };

  const getOffers = () => {
    api
      .get(`/products/offers/${uuidProduct}/${activeOffer.uuid}/back-redirect`)
      .then((r) => setOffers(r.data))
      .catch((err) => {
        notify({ message: err.response.data.message, type: 'error' });
      });
  };

  const putBackRedirect = () => {
    api
      .put(
        `/products/offers/${uuidProduct}/${activeOffer.uuid}/back/redirect`,
        {
          backRedirect: backRedirect === 'null' ? null : backRedirect,
        }
      )
      .then(() => {
        notify({
          message: 'Back redirect enviado com sucesso',
          type: 'success',
        });
      })
      .catch((err) => {
        notify({ message: err.response.data.message, type: 'error' });
      });
  };

  const changeUrlTerms = (e) => {
    const { value } = e.target;
    setErrorTerms(!regexUrl(value));
    setUrlTerms(value);
  };

  const fetchCoupons = () => {
    api
      .get(`/products/coupons/${uuidProduct}?page=0&size=99999`)
      .then((response) => {
        const now = new Date();

        const couponsFiltered = response.data.rows.filter(
          (c) =>
            c.active && (c.expires_at === null || new Date(c.expires_at) > now)
        );

        const couponsOptions = couponsFiltered.map((c) => ({
          label: `${c.coupon} - ${
            c.amount ? currency(c.amount) : c.percentage + '%'
          }`,
          value: c.uuid,
        }));

        setCoupons(couponsOptions);
      })
      .catch((err) => err);
  };

  const handlePopUpChange = (e) => {
    if (isRemovingImage) {
      e.preventDefault();
      return;
    }
    const { name, value } = e.target;
    setPopup((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    getOffers();
    fetchCoupons();
  }, []);

  return (
    <div>
      <div className='mb-4'>
        <Row>
          <Col>
            <div className='form-group'>
              <h4>Termos</h4>
              <p>Adicionar termos e condições para aceite no checkout</p>
              <Card>
                <Card.Body className='d-flex flex-column'>
                  <Switch
                    onChange={() => {
                      if (!isRemovingImage) {
                        setTerms((prev) => !prev);
                      }
                    }}
                    checked={terms}
                    disabled={isRemovingImage}
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
                  {terms && (
                    <div className='mt-3'>
                      <label htmlFor='url_terms'>* URL dos termos</label>
                      <Form.Control
                        type='url'
                        placeholder='http://...'
                        name='url_terms'
                        isInvalid={errorTerms}
                        onChange={(e) => changeUrlTerms(e)}
                        value={urlTerms}
                        disabled={isRemovingImage}
                      />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className='form-group'>
              <h4>Permitir venda por CNPJ?</h4>
              <p>Configurar permissão para exibiir campo de CNPJ no checkout</p>
              <Card>
                <Card.Body className='d-flex flex-column'>
                  <Switch
                    onChange={() => {
                      setShowCnpj((prev) => !prev);
                    }}
                    checked={showCnpj}
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
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className='form-group'>
              <h4>Back Redirect</h4>
              <p>
                Caso o cliente deseje voltar ou sair da página de checkout do
                seu produto, ele será redirecionado para uma oferta de sua
                escolha.
              </p>
              <Card>
                <Card.Body>
                  <label>Escolha um oferta para redirecionar</label>
                  <Form.Group className='w-100 d-flex mb-0'>
                    <Form.Control
                      name='backredirect'
                      as='select'
                      style={{ borderRadius: '8px 0px 0px 8px' }}
                      onChange={handleChangeSelect}
                      value={backRedirect}
                      disabled={isRemovingImage}
                    >
                      <option value={'null'}>Selecionar back redirect</option>
                      {offers &&
                        offers.map((item) => (
                          <option key={item.uuid} value={item.uuid}>
                            {item.name} - {currency(item.price)}
                          </option>
                        ))}
                    </Form.Control>

                    <Button
                      variant={'primary'}
                      className='d-flex align-items-center'
                      style={{ borderRadius: '0px 8px 8px 0px', fontSize: 14 }}
                      onClick={putBackRedirect}
                      disabled={isRemovingImage}
                    >
                      Enviar
                    </Button>
                  </Form.Group>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <div className='form-group' id='produt-uuid-wrap'>
              <h4>Embed do vídeo</h4>
              <p>
                Este video poderá ser visualizado na parte superior do checkout.
                Para inserir o vídeo coloque o código embed no campo abaixo.
              </p>
              <Card>
                <Card.Body>
                  <label>Embed</label>
                  <Form.Group className='w-100 d-flex mb-0'>
                    <Form.Control
                      id='embed-url'
                      name='name'
                      type='name'
                      value={embed}
                      placeholder='Cole seu código embed aqui...'
                      onChange={(e) => {
                        if (!isRemovingImage) {
                          setEmbed(e.target.value);
                        }
                      }}
                      style={{ borderRadius: '8px 0 0 8px' }}
                      disabled={isRemovingImage}
                    />

                    <Button
                      variant={'primary'}
                      className='d-flex align-items-center'
                      style={{ borderRadius: '0px 8px 8px 0px', fontSize: 14 }}
                      onClick={putEmbed}
                      disabled={isRemovingImage || isRemoving}
                    >
                      Enviar
                    </Button>
                  </Form.Group>
                  <small className='d-block mt-2'>
                    Dimensões esperadas <b>100% x 100%</b>
                  </small>

                  {embed && (
                    <div className='mt-4'>
                      <div className='wrap-content-insertion'>
                        <div className='isntembed'>
                          Este código não é embed.
                        </div>
                        <div
                          className='content-insertion'
                          dangerouslySetInnerHTML={{ __html: embed }}
                        ></div>
                      </div>
                      {!isRemoving ? (
                        <ButtonDS
                          type='submit'
                          variant='danger'
                          onClick={removeEmbed}
                          size='icon'
                          className='mt-2'
                          outline
                          disabled={isRemoving}
                        >
                          <i className='bx bx-x' style={{ fontSize: 20 }}></i>
                        </ButtonDS>
                      ) : (
                        <div className='d-block mt-2'>
                          <div className='d-flex align-items-center text-danger'>
                            <i
                              className='bx bx-loader-alt bx-spin mr-2'
                              style={{ fontSize: 20 }}
                            />
                            <small>Removendo...</small>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <div className='form-group'>
              <h4>Customizar Imagens da oferta</h4>

              <p>Substitua imagens do checkout desta oferta.</p>
              {imageFields.map((item, index) => {
                return (
                  <>
                    <Card key={index}>
                      <Card.Body>
                        <Row>
                          <Col className='form-group' md={12}>
                            <label htmlFor=''>{item.label}</label>
                            <UploadImage
                              route={`/products/offers/${uuidProduct}/${activeOffer.uuid}/${item.route}`}
                              multiple={false}
                              field={item.field}
                              update={item.field}
                              isOffer={true}
                              disabled={isRemovingImage}
                              setImg_link={(link) =>
                                setImg_link(link, item.update)
                              }
                            />
                            <small className='d-block mt-2'>
                              Dimensões esperadas{' '}
                              <b>
                                {item.width} x {item.height} px
                              </b>
                            </small>
                          </Col>
                          {activeOffer[item.field] && (
                            <Col className='form-group' md={12}>
                              <div className='form-group d-flex justify-content-start'>
                                <img
                                  src={activeOffer[item.field]}
                                  className='img-fluid mr-4'
                                  style={{
                                    maxWidth: 'calc(100% - 70px)',
                                    maxHeight: '170px',
                                  }}
                                />
                              </div>
                              <RemoveUploadImageOffer
                                route={`/products/offers/${uuidProduct}/${activeOffer.uuid}/${item.field}`}
                                field={item.field}
                                activeOffer={activeOffer}
                                setImg_link={(link) =>
                                  setImg_link(link, item.update)
                                }
                                isRemovingImage={isRemovingImage}
                                setIsRemovingImage={setIsRemovingImage}
                              />
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </>
                );
              })}
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <div className='form-group'>
              <h4>Pop-up de Retenção</h4>
              <p>
                Personalize um pop-up de retenção exclusivo para essa oferta.
              </p>

              {!activeOffer.allow_coupon ? (
                <p className='text-danger'>
                  <i className='bx bx-lock-alt'></i> Para liberar essas
                  configurações é necessário habilitar o uso de cupons na
                  oferta.
                </p>
              ) : (
                <>
                  <Card>
                    <Card.Body className='d-flex flex-column'>
                      <div className='d-flex justify-content-between aligns-items-md-center mb-2'>
                        <label className='mr-2'>Ativar/Desativar</label>
                        <Switch
                          onChange={() => {
                            if (!isRemovingImage) {
                              setActivePopup((prev) => !prev);
                            }
                          }}
                          checked={activePopup}
                          disabled={isRemovingImage}
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
                      </div>

                      <div className='d-flex justify-content-between aligns-items-md-center mb-2'>
                        <label className='mr-2'>
                          Exibir ao mover o mouse para fora da tela
                        </label>
                        <Switch
                          onChange={() => {
                            if (!isRemovingImage) {
                              setActiveMoveMouse((prev) => !prev);
                            }
                          }}
                          checked={activeMoveMouse}
                          disabled={!activePopup || isRemovingImage}
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
                      </div>

                      <div className='d-flex justify-content-between aligns-items-md-center mb-2'>
                        <label className='mr-2'>
                          Exibir ao clicar voltar da página
                        </label>
                        <Switch
                          onChange={() => {
                            if (!isRemovingImage) {
                              setActiveClosePage((prev) => !prev);
                            }
                          }}
                          checked={activeClosePage}
                          disabled={!activePopup || isRemovingImage}
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
                      </div>

                      <div className='d-flex justify-content-between aligns-items-md-center'>
                        <label className='mr-2'>
                          Exibir automaticamente após (X) segundos no checkout
                        </label>
                        <Switch
                          onChange={() => {
                            if (!isRemovingImage) {
                              setActiveAfterTime((prev) => !prev);
                            }
                          }}
                          checked={activeAfterTime}
                          disabled={!activePopup || isRemovingImage}
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
                      </div>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Body className='d-flex flex-column'>
                      <Form.Group className='mb-3'>
                        <label>
                          Tempo mínimo antes de qualquer pop-up ser exibido (X
                          segundos){' '}
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Tooltip id='tooltip-top'>
                                Esse é o tempo mínimo que o usuário deve
                                permanecer no checkout antes que todos eventos
                                de pop-up ativos sejam acionados. Caso não
                                deseje tempo mínimo, deixe o campo preenchido
                                com 0.
                              </Tooltip>
                            }
                          >
                            <i
                              style={{ cursor: 'help' }}
                              className='bx bx-info-circle'
                            ></i>
                          </OverlayTrigger>
                        </label>
                        <Form.Control
                          name='popup_delay'
                          type='number'
                          placeholder='ex: 10'
                          disabled={!activePopup || isRemovingImage}
                          defaultValue={popup ? popup.popup_delay : 0}
                          onChange={handlePopUpChange}
                          min={0}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e') {
                              e.preventDefault();
                            }
                          }}
                          onInput={(e) => {
                            if (e.target.value < 0) e.target.value = 0;
                          }}
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <label>Cupom</label>
                        <Form.Control
                          as='select'
                          className='w-100'
                          style={{ borderRadius: 8 }}
                          onChange={(e) => {
                            if (!isRemovingImage) {
                              setSelectedCoupom(e.target.value);
                            }
                          }}
                          value={selectedCoupom || ''}
                          placeholder='Selecione um cupom'
                          disabled={!activePopup || isRemovingImage}
                        >
                          <option value={''} disabled>
                            Selecione um cupom
                          </option>

                          {coupons.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <label>Título principal</label>
                        <Form.Control
                          name='popup_title'
                          type='text'
                          placeholder='ex: VOCÊ GANHOU'
                          disabled={!activePopup || isRemovingImage}
                          defaultValue={popup ? popup.popup_title : ''}
                          onChange={handlePopUpChange}
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <label>Texto do desconto</label>
                        <Form.Control
                          name='popup_discount_text'
                          type='text'
                          placeholder='ex: DE DESCONTO'
                          disabled={!activePopup || isRemovingImage}
                          defaultValue={popup ? popup.popup_discount_text : ''}
                          onChange={handlePopUpChange}
                        />
                      </Form.Group>

                      <Form.Group className='mb-3'>
                        <label>Texto do botão de ação</label>
                        <Form.Control
                          name='popup_button_text'
                          type='text'
                          placeholder='ex: CLIQUE AQUI E GARANTA SEU DESCONTO'
                          disabled={!activePopup || isRemovingImage}
                          defaultValue={popup ? popup.popup_button_text : ''}
                          onChange={handlePopUpChange}
                        />
                      </Form.Group>

                      <Form.Group>
                        <label>
                          Texto secundário/descrição adicional (opcional)
                        </label>
                        <Form.Control
                          name='popup_secondary_text'
                          type='text'
                          placeholder='Digite um texto adicional aqui'
                          disabled={!activePopup || isRemovingImage}
                          defaultValue={popup ? popup.popup_secondary_text : ''}
                          onChange={handlePopUpChange}
                        />
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card>
                    <Card.Body className='d-flex flex-row flex-wrap justify-content-between'>
                      <div className='mb-3'>
                        <label>Cor do Fundo</label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            defaultValue={
                              popup ? popup.hex_color_bg : '#DB0000'
                            }
                            name='hex_color_bg'
                            disabled={!activePopup || isRemovingImage}
                            onChange={handlePopUpChange}
                            style={{
                              height: 50,
                              width: 80,
                              marginBottom: 0,
                              marginRight: 10,
                            }}
                          />
                          <i
                            className='bx bxs-eyedropper'
                            style={{ fontSize: 30 }}
                          />
                        </div>
                      </div>

                      <div className='mb-3'>
                        <label>Cor do Texto</label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            defaultValue={popup ? popup.hex_color_text : '#fff'}
                            name='hex_color_text'
                            disabled={!activePopup || isRemovingImage}
                            onChange={handlePopUpChange}
                            style={{
                              height: 50,
                              width: 80,
                              marginBottom: 0,
                              marginRight: 10,
                            }}
                          />
                          <i
                            className='bx bxs-eyedropper'
                            style={{ fontSize: 30 }}
                          />
                        </div>
                      </div>

                      <div className='mb-3'>
                        <label>Cor do Botão</label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            defaultValue={
                              popup ? popup.hex_color_button : '#51B55B'
                            }
                            name='hex_color_button'
                            disabled={!activePopup || isRemovingImage}
                            onChange={handlePopUpChange}
                            style={{
                              height: 50,
                              width: 80,
                              marginBottom: 0,
                              marginRight: 10,
                            }}
                          />
                          <i
                            className='bx bxs-eyedropper'
                            style={{ fontSize: 30 }}
                          />
                        </div>
                      </div>

                      <div className='mb-3'>
                        <label>Cor do Texto do Botão</label>
                        <div className='d-flex align-items-center'>
                          <Form.Control
                            type='color'
                            defaultValue={
                              popup ? popup.hex_color_button_text : '#fff'
                            }
                            name='hex_color_button_text'
                            disabled={!activePopup || isRemovingImage}
                            onChange={handlePopUpChange}
                            style={{
                              height: 50,
                              width: 80,
                              marginBottom: 0,
                              marginRight: 10,
                            }}
                          />
                          <i
                            className='bx bxs-eyedropper'
                            style={{ fontSize: 30 }}
                          />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ModalOfferCheckout;

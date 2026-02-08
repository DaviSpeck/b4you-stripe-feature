import { useEffect, useState } from 'react';
import { Card, Col, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import UploadImage from '../../jsx/components/UploadImage';
import RemoveUploadImage from '../../jsx/components/RemoveUploadImage';
import api from '../../providers/api';
import { useProduct } from '../../providers/contextProduct';
import { notify } from '../functions';
import './styles.scss';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import Switch from 'react-switch';

const imageFields = [
  {
    field: 'header-desktop',
    snake: 'header_picture',
    label: 'Imagem de cabeçalho',
    width: 1100,
    height: 350,
  },
  {
    field: 'header-desktop-secondary',
    snake: 'header_picture_secondary',
    label: 'Segunda imagem de cabeçalho',
    width: 1100,
    height: 350,
  },
  {
    field: 'header-mobile',
    snake: 'header_picture_mobile',
    label: 'Imagem de cabeçalho mobile',
    width: 1000,
    height: 500,
  },
  {
    field: 'second-header-mobile',
    snake: 'second_header_mobile',
    label: 'Segunda imagem de cabeçalho mobile',
    width: 1000,
    height: 500,
  },
  {
    field: 'sidebar-desktop',
    snake: 'sidebar_picture',
    label: 'Imagem lateral',
    width: 280,
    height: 900,
  },
];

const PageProductsEditCheckout = () => {
  const [switches, setSwitches] = useState({
    show_custom_description: false,
    show_alt_name: false,
    show_best_discount: false,
    show_shipping_text: false,
    exibition_type: 1,
    default_installment: 12,
    show_custom_image: false,
    show_max_installments: false,
    available_checkout_link_types: 3,
  });

  const handleToggle = (field) => {
    setSwitches((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSelectChange = (event) => {
    setSwitches((prevState) => ({
      ...prevState,
      exibition_type: event.target.value,
    }));
  };

  const handleInstallmentDefaultChange = (event) => {
    setSwitches((prevState) => ({
      ...prevState,
      default_installment: parseInt(event.target.value),
    }));
  };

  const handleCheckoutAvailabelChange = (event) => {
    setSwitches((prevState) => ({
      ...prevState,
      available_checkout_link_types: parseInt(event.target.value),
    }));
  };

  const replicateToMobile = async (imageUrl) => {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = imageUrl.split('/').pop() || 'download.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const formData = new FormData();
          formData.append('header-mobile', file);

          try {
            const response = await api.put(
              `/products/images/${uuidProduct}/header-mobile`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            setImg_link(response.data.url, 'header_picture_mobile');
            notify({
              message: 'Imagem replicada para mobile com sucesso',
              type: 'success',
            });
          } catch (err) {
            notify({
              message: err.response?.data?.message || 'Erro ao replicar imagem',
              type: 'error',
            });
          }
        }
        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    } catch (err) {
      notify({
        message: 'Erro ao replicar imagem',
        type: 'error',
      });
    }
  };

  const [requesting, setRequesting] = useState(false);
  const [replicarMobile, setReplicarMobile] = useState(false);
  const [embed, setEmbed] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    mode: 'onChange',
  });
  const { uuidProduct } = useParams();
  const { product, setProduct } = useProduct();

  const setImg_link = (link, name) => {
    setProduct((prev) => ({ ...prev, [name]: link }));
  };

  useEffect(() => {
    reset(product);
    setEmbed(product.url_video_checkout);
  }, []);

  const onSubmit = (data) => {
    setRequesting('post');
    let fields = data;

    if (fields.hex_color.length !== 7 || fields.hex_color.includes('_')) {
      fields.hex_color = null;
    }

    api
      .put(`/products/${uuidProduct}/checkout`, fields)
      .then((response) => {
        setProduct((p) => ({ ...p, ...response.data }));
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({
          message:
            err.response.data.body.errors[0].creditcard_descriptor ||
            'Erro ao salvar',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });

    api
      .put(
        `/products/${uuidProduct}/checkout/customizations`,
        j_customizations_offers,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        setProduct((p) => ({ ...p, ...response.data }));
      })
      .catch((err) => {
        notify({
          message:
            err.response.data.body.errors[0].creditcard_descriptor ||
            'Erro ao salvar',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const putEmbed = () => {
    api
      .put(`/products/video/${uuidProduct}`, {
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
      .delete(`/products/video/${uuidProduct}`)
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

  useEffect(() => {
    const fetchCustomizations = async () => {
      try {
        const response = await api.get(
          `/products/${uuidProduct}/checkout/customizations`
        );

        const customizations = response.data;

        setSwitches({
          available_checkout_link_types: String(
            customizations.available_checkout_link_types
          ),
          show_custom_description:
            customizations.show_custom_description === 'true',
          show_alt_name: customizations.show_alt_name === 'true',
          show_best_discount: customizations.show_best_discount === 'true',
          show_shipping_text: customizations.show_shipping_text === 'true',
          show_custom_image: customizations.show_custom_image === 'true',
          exibition_type: parseInt(customizations.exibition_type, 10),
          default_installment: customizations?.default_installment ?? 12,
          show_max_installments:
            customizations.show_max_installments === 'true',
        });
      } catch (error) {
        console.error('Erro ao buscar customizações:', error);
      }
    };
    fetchCustomizations();
  }, [uuidProduct]);

  const j_customizations_offers = {
    customizations: {
      available_checkout_link_types: switches.available_checkout_link_types,
      show_custom_description: switches.show_custom_description.toString(),
      show_alt_name: switches.show_alt_name.toString(),
      show_best_discount: switches.show_best_discount.toString(),
      show_shipping_text: switches.show_shipping_text.toString(),
      exibition_type: switches.exibition_type.toString(),
      show_custom_image: switches.show_custom_image.toString(),
      default_installment: switches.default_installment.toString(),
      show_max_installments: switches.show_max_installments.toString(),
    },
  };

  return (
    <>
      <section id='checkout'>
        <Row>
          <Col md={12}>
            <div className='mb-3'>
              <h4>Personalização</h4>
              <small>
                Se você não fizer upload de um logo, exibiremos o nome do seu
                produto.
                <br />
                <b>A cor primária afeta os botões e ícones do checkout.</b>
              </small>
            </div>
          </Col>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <label htmlFor=''>Logo</label>
                    <UploadImage
                      route={`/products/logo/${uuidProduct}`}
                      multiple={false}
                      field={'logo'}
                      update={'logo'}
                      setImg_link={(link) => setImg_link(link, 'logo')}
                    />
                    <small className='d-block mt-2' style={{ opacity: 1 }}>
                      Dimensões máximas <b>500 x 333 px</b>
                    </small>
                    <div
                      className='form-group d-flex justify-content-start'
                      mt={3}
                      p={0}
                    >
                      <img
                        src={product.logo}
                        className='img-fluid'
                        style={{ maxWidth: 200 }}
                      />
                    </div>
                    <RemoveUploadImage
                      route={`/products/logo/${uuidProduct}`}
                      field={'logo'}
                      setImg_link={(link) => setImg_link(link, 'logo')}
                    />
                  </Col>
                  <Col md={4}>
                    <label htmlFor=''>Fav Icon</label>
                    <UploadImage
                      route={`/products/images/${uuidProduct}/favicon`}
                      multiple={false}
                      field={'favicon'}
                      update={'favicon'}
                      setImg_link={(link) => setImg_link(link, 'favicon')}
                    />
                    <small className='d-block mt-2'>
                      Dimensões máximas <b>100 x 100 px</b>
                    </small>
                    <div
                      className='form-group d-flex justify-content-start'
                      mt={3}
                      p={0}
                    >
                      <img
                        src={product.favicon}
                        className='img-fluid'
                        style={{ maxWidth: 200 }}
                      />
                    </div>
                    <RemoveUploadImage
                      route={`/products/images/${uuidProduct}/favicon`}
                      field={'favicon'}
                      setImg_link={(link) => setImg_link(link, 'favicon')}
                    />
                  </Col>
                  <Col md={4}>
                    <Col className='form-group' md={6}>
                      <label htmlFor=''>Cor Primária</label>
                      <div className='c-picker'>
                        <Form.Control
                          type='color'
                          id='exampleColorInput'
                          defaultValue='#563d7c'
                          title='Escolha sua cor'
                          name='hex_color'
                          ref={register()}
                          style={{ height: 50, width: 80 }}
                        />
                        <i className='bx bxs-eyedropper' />
                      </div>
                    </Col>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <div className='form-group' id='produt-uuid-wrap'>
                  <h4>Embed do vídeo</h4>
                  <p>
                    Este video poderá ser visualizado na parte superior do
                    checkout. Para inserir o vídeo coloque o código embed no
                    campo abaixo.
                  </p>

                  <Form.Group className='w-100 d-flex mb-0'>
                    <Form.Control
                      id='embed-url'
                      name='name'
                      type='name'
                      value={embed}
                      placeholder='Cole seu código embed aqui...'
                      onChange={(e) => {
                        setEmbed(e.target.value);
                      }}
                      style={{ borderRadius: '8px 0 0 8px' }}
                    />

                    <ButtonDS
                      variant={'primary'}
                      className='d-flex align-items-center'
                      style={{
                        borderRadius: '0px 8px 8px 0px',
                        fontSize: 14,
                      }}
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
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <div className='mb-3'>
              <h4>Customizar Imagens</h4>
              <div className='c-preview'>
                <div>
                  <small>
                    As imagens a seguir serão exibidas no seu checkout. Faça
                    combinações com as cores da sua marca para deixar sua
                    operação com mais profissionalismo.
                  </small>
                  <br />
                  <small>
                    <b>
                      {' '}
                      Caso a imagem enviada tenha dimensões diferentes das
                      esperadas ela será cortada para se enquadrar.
                    </b>
                  </small>
                </div>
              </div>
            </div>
          </Col>

          {imageFields.map((item, index) => (
            <Col key={index} md={6}>
              <Card>
                <Card.Body>
                  <Row>
                    <Col className='form-group' md={12}>
                      <label htmlFor=''>{item.label}</label>
                      <UploadImage
                        route={`/products/images/${uuidProduct}/${item.field}`}
                        multiple={false}
                        field={item.field}
                        update={item.snake}
                        setImg_link={(link) => {
                          setImg_link(link, item.snake);
                          if (
                            item.field === 'header-desktop' &&
                            replicarMobile
                          ) {
                            replicateToMobile(link);
                          }
                        }}
                      />
                      <small className='d-block mt-2'>
                        Dimensões esperadas{' '}
                        <b>
                          {item.width} x {item.height} px
                        </b>
                      </small>

                      {item.field === 'header-desktop' && (
                        <div className='mt-2'>
                          <p className='mb-1'>
                            Deseja aplicar essa imagem também para dispositivos
                            mobile?
                          </p>
                          <Switch
                            checked={replicarMobile}
                            onChange={() => {
                              const novoEstado = !replicarMobile;
                              setReplicarMobile(novoEstado);

                              if (novoEstado && product.header_picture) {
                                replicateToMobile(product.header_picture);
                              }
                            }}
                            uncheckedIcon={false}
                          />
                        </div>
                      )}
                    </Col>

                    {product[item.snake] && (
                      <Col className='form-group' md={12}>
                        <div className='form-group d-flex justify-content-start'>
                          <img
                            src={product[item.snake]}
                            className='img-fluid mr-4'
                            style={{
                              maxWidth: 'calc(100% - 70px)',
                              maxHeight: '170px',
                            }}
                          />
                        </div>
                        <RemoveUploadImage
                          route={`/products/images/${uuidProduct}/${item.field}`}
                          field={item.snake}
                          setImg_link={(link) => setImg_link(link, item.snake)}
                        />
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Row>
          <Col md={12}>
            <div className='mb-3'>
              <h4>Modelos de Checkout Disponíveis</h4>
            </div>
          </Col>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={4} style={{ padding: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        paddingBottom: '8px',
                      }}
                    >
                      <label htmlFor='' style={{ margin: '0px' }}>
                        Selecione os modelos de checkout
                      </label>
                      <OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip id={`tooltip-top-invisible-offer`}>
                            Ao selecionar uma opção, você define quais modelos
                            de checkout estarão disponíveis, apenas um ou ambos.
                            Essa configuração vale tanto para suas próprias
                            divulgações quanto para as realizadas por afiliados.
                          </Tooltip>
                        }
                      >
                        <i className='bx bx-info-circle ml-2'></i>
                      </OverlayTrigger>
                    </div>
                    <p>modelos de checkout</p>
                    <select
                      value={String(switches.available_checkout_link_types)}
                      onChange={handleCheckoutAvailabelChange}
                      className='form-control'
                    >
                      <option value='1'>Apenas o padrão</option>
                      <option value='2'>Apenas o 3 etapas</option>
                      <option value='3'>Todos os tipos</option>
                    </select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <div className='mb-3'>
              <h4>Personalização do Checkout em 3 Etapas</h4>
            </div>
          </Col>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>Exibir Imagem personalizada?</label>
                    <p>
                      Caso não tenha imagem personalizada, exibimos a imagem do
                      produto.
                    </p>
                    <Switch
                      id='show_custom_image'
                      checked={switches['show_custom_image']}
                      onChange={() => handleToggle('show_custom_image')}
                      uncheckedIcon={false}
                    />
                  </Col>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>Exibir Descrição Personalizada?</label>
                    <p>Exibe a descrição da oferta no resumo do checkout.</p>
                    <Switch
                      id='show_custom_description'
                      checked={switches['show_custom_description']}
                      onChange={() => handleToggle('show_custom_description')}
                      uncheckedIcon={false}
                    />
                  </Col>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>Exibir nome alternativo?</label>
                    <p>
                      Altera a forma de exibição do nome da oferta para o nome
                      alterativo.
                    </p>
                    <Switch
                      id='show_alt_name'
                      checked={switches['show_alt_name']}
                      onChange={() => handleToggle('show_alt_name')}
                      uncheckedIcon={false}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>Destaque no desconto?</label>
                    <p>Exibe o desconto maximo no início do checkout.</p>
                    <Switch
                      id='show_best_discount'
                      checked={switches['show_best_discount']}
                      onChange={() => handleToggle('show_best_discount')}
                      uncheckedIcon={false}
                    />
                  </Col>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>
                      Exibir mensagem de Prazo de entrega
                    </label>
                    <p>Exibe no resumo uma mensagem com o prazo de entrega.</p>
                    <Switch
                      id='show_shipping_text'
                      checked={switches['show_shipping_text']}
                      onChange={() => handleToggle('show_shipping_text')}
                      uncheckedIcon={false}
                    />
                  </Col>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>
                      Tipo de exibição do valor das ofertas
                    </label>
                    <p>Altera a forma de exibição do valor total.</p>
                    <select
                      value={switches.exibition_type}
                      onChange={handleSelectChange}
                      className='form-control'
                    >
                      <option value=''>Selecione</option>
                      <option value='1'>Em até 12x de R$9,99</option>
                      <option value='2'>Total: R$120,00</option>
                      <option value='3'>Parcelas de R$9,99</option>
                    </select>
                  </Col>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>Opção de parcelamento</label>
                    <p>Valor inicial de parcelamento</p>
                    <select
                      value={String(switches.default_installment)}
                      onChange={handleInstallmentDefaultChange}
                      className='form-control'
                    >
                      <option value=''>Selecione</option>
                      <option value='1'>1x</option>
                      <option value='2'>2x</option>
                      <option value='3'>3x</option>
                      <option value='4'>4x</option>
                      <option value='5'>5x</option>
                      <option value='6'>6x</option>
                      <option value='7'>7x</option>
                      <option value='8'>8x</option>
                      <option value='9'>9x</option>
                      <option value='10'>10x</option>
                      <option value='11'>11x</option>
                      <option value='12'>12x</option>
                    </select>
                  </Col>
                  <Col md={4} style={{ padding: '8px' }}>
                    <label htmlFor=''>
                      Exibir sempre o parcelamento máximo.
                    </label>
                    <p>Exibir sempre o parcelamento máximo.</p>
                    <Switch
                      id='show_max_installments'
                      checked={switches['show_max_installments']}
                      onChange={() => handleToggle('show_max_installments')}
                      uncheckedIcon={false}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-4'>
          <Col className=' d-flex justify-content-end'>
            <ButtonDS onClick={handleSubmit(onSubmit)} disabled={requesting}>
              {!requesting ? 'Salvar' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default PageProductsEditCheckout;

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { Card, Col, Row, Spinner, Button, Form } from 'react-bootstrap';
import ReactSwitch from 'react-switch';
import { notify } from '../functions';
import api from '../../providers/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  BsGripVertical,
  BsTrash,
  BsChevronUp,
  BsChevronDown,
  BsInfoCircle,
} from 'react-icons/bs';

const MemberRecommended = () => {
  const { uuidProduct } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [layout, setLayout] = useState('horizontal'); // horizontal ou vertical
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [producerProductCount, setProducerProductCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [uuidProduct]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availableResponse, configResponse] = await Promise.all([
        api.get(`/products/${uuidProduct}/recommended-products/available`),
        api.get(`/products/${uuidProduct}/recommended-products`),
      ]);

      const available = availableResponse.data || [];
      setProducerProductCount(available.length);
      setAvailableProducts(available);

      // Se não há produtos elegíveis, avisa o usuário de forma amigável
      if (available.length === 0) {
        notify({
          message: 'Nenhum produto disponível para recomendar.',
          type: 'warning',
        });
      }

      const config = configResponse.data || {
        enabled: false,
        recommendedProducts: [],
        layout: 'horizontal',
      };
      setEnabled(config.enabled);
      setLayout(config.layout || 'horizontal');

      if (config.recommendedProducts && config.recommendedProducts.length > 0) {
        // Mapeia produtos selecionados com dados completos incluindo configurações
        const selected = config.recommendedProducts
          .map((item) => {
            const product = available.find((p) => p.id === item.id_product);
            if (!product) return null;

            return {
              ...product,
              order: item.order,
              id_offer:
                item.id_offer ||
                (product.offers && product.offers.length > 0
                  ? product.offers[0].id
                  : null),
              checkout_type: item.checkout_type || 1, // Default: single (1)
              id_page: item.id_page || null, // Página selecionada para "Saiba Mais"
              promotion_enabled: item.promotion_enabled || false,
              promotion_offer_id: item.promotion_offer_id || null,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.order - b.order);

        setSelectedProducts(selected);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      notify({ message: 'Erro ao carregar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const recommendedProducts = selectedProducts.map((product, index) => ({
        id_product: product.id,
        order: index,
        id_offer: product.id_offer || null,
        checkout_type: product.checkout_type || 1,
        id_page: product.id_page || null,
        promotion_enabled: product.promotion_enabled || false,
        promotion_offer_id: product.promotion_enabled
          ? product.promotion_offer_id
          : null,
      }));

      await api.put(`/products/${uuidProduct}/recommended-products`, {
        enabled,
        layout,
        recommendedProducts: enabled ? recommendedProducts : [],
      });

      notify({ message: 'Salvo com sucesso', type: 'success' });
    } catch (error) {
      console.error('Error saving:', error);
      notify({ message: 'Erro ao salvar', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = () => {
    setEnabled(!enabled);
  };

  const handleAddProduct = (productId) => {
    const product = availableProducts.find((p) => p.id === productId);
    if (!product) return;

    if (selectedProducts.find((p) => p.id === productId)) {
      notify({ message: 'Produto já adicionado', type: 'warning' });
      return;
    }

    // Seleciona primeira oferta e checkout padrão (single)
    const defaultOffer =
      product.offers && product.offers.length > 0 ? product.offers[0].id : null;
    const defaultCheckoutType = product.availableCheckoutTypes === 2 ? 2 : 1; // Se só tem three-steps, usa ele, senão single

    setSelectedProducts([
      ...selectedProducts,
      {
        ...product,
        order: selectedProducts.length,
        id_offer: defaultOffer,
        checkout_type: defaultCheckoutType,
        id_page: null, // Nenhuma página selecionada por padrão
        promotion_enabled: false,
        promotion_offer_id: null,
      },
    ]);
  };

  const handleUpdateProductConfig = (productId, field, value) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        if (p.id !== productId) return p;

        const updated = { ...p, [field]: value };

        // Se mudou a oferta, atualiza o preço
        if (field === 'id_offer' && value) {
          const offer = p.offers?.find((o) => o.id === parseInt(value));
          if (offer) {
            updated.price = offer.price;
          }
        }

        return updated;
      })
    );
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedProducts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualiza order
    const updated = items.map((item, index) => ({ ...item, order: index }));
    setSelectedProducts(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return; // Já está no topo

    const items = [...selectedProducts];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;

    // Atualiza order
    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    setSelectedProducts(updated);
  };

  const handleMoveDown = (index) => {
    if (index === selectedProducts.length - 1) return; // Já está no final

    const items = [...selectedProducts];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;

    // Atualiza order
    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    setSelectedProducts(updated);
  };

  if (loading) {
    return (
      <div className='text-center py-5'>
        <Spinner animation='border' variant='primary' />
        <p className='mt-3 text-muted'>Carregando...</p>
      </div>
    );
  }

  // Só mostra a funcionalidade se o produtor tem mais de 1 produto
  if (producerProductCount <= 1) {
    return (
      <Card>
        <Card.Body>
          <p className='text-muted mb-0'>
            Você precisa ter mais de um produto cadastrado para usar a
            funcionalidade de produtos recomendados.
          </p>
        </Card.Body>
      </Card>
    );
  }

  const unselectedProducts = availableProducts.filter(
    (product) =>
      product.uuid !== uuidProduct &&
      !selectedProducts.find((p) => p.id === product.id)
  );

  return (
    <>
      <Row className='mb-4'>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <div className='mb-3'>
                <h4>Produtos Recomendados</h4>
                <small className='text-muted'>
                  Exiba seus produtos na área de membros. Os produtos são divididos em duas seções:
                  <br />
                  <strong>Outros Conteúdos:</strong> Cursos, vídeos, e-books e assinaturas - alunos que já compraram
                  verão como disponível, outros verão opção de compra.
                  <br />
                  <strong>Alguns de Nossos Produtos:</strong> Produtos físicos e apenas pagamento - sempre
                  disponíveis para compra.
                </small>
              </div>

              <div className='mb-3 d-flex justify-content-between align-items-center'>
                <div className='d-flex align-items-center'>
                  <label className='mb-0' style={{ marginRight: '16px' }}>
                    Habilitar produtos recomendados
                  </label>
                  <ReactSwitch
                    onChange={handleToggleEnabled}
                    checked={enabled}
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
                {!enabled && (
                  <Button
                    variant='primary'
                    onClick={handleSave}
                    disabled={saving}
                    style={{ minWidth: '120px' }}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                )}
              </div>

              {enabled && (
                <>
                  <div className='mb-3 d-flex justify-content-between align-items-start'>
                    <div className='flex-grow-1'>
                      <label className='d-block mb-2'>Layout de Exibição</label>
                      <Form.Control
                        as='select'
                        value={layout}
                        onChange={(e) => setLayout(e.target.value)}
                        style={{ maxWidth: '300px' }}
                      >
                        <option value='vertical'>
                          Vertical (290 x 512 px)
                        </option>
                        <option value='horizontal'>
                          Horizontal (300 x 225 px - formato paisagem)
                        </option>
                      </Form.Control>
                      <small className='text-muted d-block mt-1'>
                        {layout === 'horizontal'
                          ? 'Os produtos serão exibidos em um carrossel deslizante'
                          : 'Os produtos serão exibidos em uma grade vertical'}
                      </small>
                    </div>
                    <Button
                      variant='primary'
                      onClick={handleSave}
                      disabled={saving}
                      style={{ minWidth: '120px', marginTop: '24px' }}
                    >
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>

                  <hr />

                  <hr />

                  <div className='mb-3'>
                    <h5>Produtos Selecionados ({selectedProducts.length})</h5>
                    <small className='text-muted d-block mb-3'>
                      Arraste ou use as setas para reordenar. A ordem aqui será
                      a ordem de exibição na área de membros.
                    </small>

                    {selectedProducts.length === 0 ? (
                      <div className='alert alert-info'>
                        <small>
                          Nenhum produto selecionado. Adicione produtos da lista
                          abaixo.
                        </small>
                      </div>
                    ) : (
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId='selected-products'>
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className='list-group'
                            >
                              {selectedProducts.map((product, index) => (
                                <Draggable
                                  key={product.id}
                                  draggableId={`product-${product.id}`}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`list-group-item d-flex align-items-center justify-content-between ${
                                        snapshot.isDragging ? 'bg-light' : ''
                                      }`}
                                      style={provided.draggableProps.style}
                                    >
                                      <div className='d-flex align-items-center flex-grow-1'>
                                        <div
                                          {...provided.dragHandleProps}
                                          style={{
                                            cursor: 'grab',
                                            marginRight: '1rem',
                                          }}
                                        >
                                          <BsGripVertical size={20} />
                                        </div>
                                        <div
                                          className='d-flex flex-column'
                                          style={{ marginRight: '2rem' }}
                                        >
                                          <Button
                                            variant='link'
                                            className='p-0'
                                            style={{
                                              lineHeight: '1',
                                              minHeight: 'auto',
                                              padding: '2px',
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMoveUp(index);
                                            }}
                                            disabled={index === 0}
                                            title='Mover para cima'
                                          >
                                            <BsChevronUp
                                              size={22}
                                              className={
                                                index === 0
                                                  ? 'text-muted'
                                                  : 'text-primary'
                                              }
                                            />
                                          </Button>
                                          <Button
                                            variant='link'
                                            className='p-0'
                                            style={{
                                              lineHeight: '1',
                                              minHeight: 'auto',
                                              padding: '2px',
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMoveDown(index);
                                            }}
                                            disabled={
                                              index ===
                                              selectedProducts.length - 1
                                            }
                                            title='Mover para baixo'
                                          >
                                            <BsChevronDown
                                              size={22}
                                              className={
                                                index ===
                                                selectedProducts.length - 1
                                                  ? 'text-muted'
                                                  : 'text-primary'
                                              }
                                            />
                                          </Button>
                                        </div>
                                        <div
                                          className='me-5'
                                          style={{ marginRight: '1.5rem' }}
                                        >
                                          {product.cover ? (
                                            <img
                                              src={product.cover}
                                              alt={product.name}
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                              }}
                                            />
                                          ) : (
                                            <div
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: '#e9ecef',
                                                borderRadius: '4px',
                                              }}
                                            />
                                          )}
                                        </div>
                                        <div className='flex-grow-1'>
                                          <div className='d-flex align-items-center flex-wrap'>
                                            <strong
                                              style={{
                                                marginRight: '0.5rem',
                                              }}
                                            >
                                              {product.name}
                                            </strong>
                                            <span
                                              className='badge'
                                              style={{
                                                marginRight: '0.5rem',
                                                fontSize: '0.65rem',
                                                padding: '0.2rem 0.4rem',
                                                color: '#ffffff',
                                                backgroundColor:
                                                  product.productType ===
                                                  'content'
                                                    ? '#0f1b35' // primary
                                                    : '#4dd0bb', // custom green
                                              }}
                                            >
                                              {product.productType === 'content' ? 'Conteúdo' : 'Produto'}
                                            </span>
                                            <Button
                                              variant='light'
                                              size='sm'
                                              className='d-flex align-items-center'
                                              style={{
                                                backgroundColor: '#ffffff',
                                                borderColor: '#dee2e6',
                                                color: '#dc3545',
                                                padding: '0.2rem 0.5rem',
                                                fontSize: '0.75rem',
                                                lineHeight: '1.2',
                                              }}
                                              onClick={() =>
                                                handleRemoveProduct(product.id)
                                              }
                                            >
                                              <BsTrash
                                                size={12}
                                                style={{
                                                  color: '#dc3545',
                                                  marginRight: '0.275rem',
                                                }}
                                              />
                                              <span
                                                style={{ color: '#dc3545' }}
                                              >
                                                Remover
                                              </span>
                                            </Button>
                                          </div>

                                          {/* Seleção de Oferta */}
                                          {product.offers &&
                                            product.offers.length > 0 && (
                                              <>
                                                <label className='d-flex align-items-center small text-muted mb-1'>
                                                  <span>Oferta</span>
                                                    <BsInfoCircle
                                                      style={{
                                                        cursor: 'help',
                                                        fontSize: '0.875rem',
                                                        marginLeft: '0.275rem',
                                                      }}
                                                      title='Define qual oferta do produto será usada quando o usuário clicar em "Comprar Agora". Esta é a oferta que será exibida no card do produto recomendado.'
                                                    />
                                                </label>
                                                <Form.Control
                                                  as='select'
                                                  size='sm'
                                                  className='mb-2'
                                                  value={
                                                    product.id_offer ||
                                                    (product.offers.length > 0
                                                      ? product.offers[0].id
                                                      : '')
                                                  }
                                                  onChange={(e) =>
                                                    handleUpdateProductConfig(
                                                      product.id,
                                                      'id_offer',
                                                      e.target.value
                                                        ? parseInt(
                                                            e.target.value
                                                          )
                                                        : null
                                                    )
                                                  }
                                                >
                                                  {product.offers.map(
                                                    (offer) => (
                                                      <option
                                                        key={offer.id}
                                                        value={offer.id}
                                                      >
                                                        {offer.name ||
                                                          `Oferta ${offer.id}`}{' '}
                                                        - R${' '}
                                                        {(
                                                          offer.price / 100
                                                        ).toFixed(2)}
                                                      </option>
                                                    )
                                                  )}
                                                </Form.Control>
                                              </>
                                            )}

                                          {/* Seleção de Tipo de Checkout */}
                                          {product.availableCheckoutTypes ===
                                            3 && (
                                            <>
                                              <label className='d-flex align-items-center small text-muted mb-1'>
                                                <span>Tipo de Checkout</span>
                                                 <BsInfoCircle
                                                   style={{
                                                     cursor: 'help',
                                                     fontSize: '0.875rem',
                                                     marginLeft: '0.275rem',
                                                   }}
                                                   title='Define o tipo de checkout que será aberto quando o usuário clicar em "Comprar Agora". Checkout Padrão: processo de compra tradicional. Checkout em 3 Etapas: processo dividido em 3 etapas para melhorar a experiência do usuário.'
                                                 />
                                              </label>
                                              <Form.Control
                                                as='select'
                                                size='sm'
                                                className='mb-2'
                                                value={
                                                  product.checkout_type || 1
                                                }
                                                onChange={(e) =>
                                                  handleUpdateProductConfig(
                                                    product.id,
                                                    'checkout_type',
                                                    parseInt(e.target.value)
                                                  )
                                                }
                                              >
                                                <option value={1}>
                                                  Checkout Padrão
                                                </option>
                                                <option value={2}>
                                                  Checkout em 3 Etapas
                                                </option>
                                              </Form.Control>
                                            </>
                                          )}
                                          {product.availableCheckoutTypes ===
                                            2 && (
                                            <small className='text-muted d-block mb-2'>
                                              Checkout em 3 Etapas
                                            </small>
                                          )}

                                          {/* Seleção de Página para "Saiba Mais" */}
                                          <>
                                            <label className='d-flex align-items-center small text-muted mb-1'>
                                              <span>Botão Saiba Mais</span>
                                              <BsInfoCircle
                                                style={{
                                                  cursor: 'help',
                                                  fontSize: '0.875rem',
                                                  marginLeft: '0.275rem',
                                                }}
                                                title='Define para onde o botão "Saiba Mais" redireciona. O botão ajuda o usuário a visualizar o produto e obter mais informações antes de comprar. Selecione uma página personalizada ou deixe em branco para usar o WhatsApp de suporte (se configurado). Se não houver página nem WhatsApp, o botão não será exibido.'
                                              />
                                            </label>
                                            {product.pages &&
                                            product.pages.length > 0 ? (
                                              <>
                                                <Form.Control
                                                  as='select'
                                                  size='sm'
                                                  value={product.id_page || ''}
                                                  onChange={(e) =>
                                                    handleUpdateProductConfig(
                                                      product.id,
                                                      'id_page',
                                                      e.target.value
                                                        ? parseInt(
                                                            e.target.value
                                                          )
                                                        : null
                                                    )
                                                  }
                                                >
                                                  <option value=''>
                                                    Nenhuma (usa WhatsApp ou não
                                                    exibe o botão)
                                                  </option>
                                                  {product.pages.map((page) => (
                                                    <option
                                                      key={page.id}
                                                      value={page.id}
                                                    >
                                                      {page.label}
                                                    </option>
                                                  ))}
                                                </Form.Control>
                                              </>
                                            ) : (
                                              <Form.Control
                                                as='select'
                                                size='sm'
                                                disabled
                                                style={{
                                                  backgroundColor: '#e9ecef',
                                                  cursor: 'not-allowed',
                                                }}
                                              >
                                                <option>
                                                  Adicione páginas ao produto
                                                  para personalizar
                                                </option>
                                              </Form.Control>
                                            )}
                                          </>

                                          {/* Checkbox e Seleção de Promoção */}
                                          <div className='mt-3'>
                                            <label className='d-flex align-items-center small text-muted mb-1'>
                                              <span>Promoção</span>
                                              <BsInfoCircle
                                                style={{
                                                  cursor: 'help',
                                                  fontSize: '0.875rem',
                                                  marginLeft: '0.275rem',
                                                }}
                                                title='Quando habilitado, permite exibir um preço antigo riscado acima do preço atual para criar o efeito de desconto. Você precisará selecionar a oferta antiga que será exibida com o preço cortado.'
                                              />
                                            </label>
                                            <Form.Check
                                              type='checkbox'
                                              id={`promotion-${product.id}`}
                                              label='Habilitar promoção'
                                              checked={
                                                product.promotion_enabled ||
                                                false
                                              }
                                              onChange={(e) =>
                                                handleUpdateProductConfig(
                                                  product.id,
                                                  'promotion_enabled',
                                                  e.target.checked
                                                )
                                              }
                                              className='mb-2'
                                            />
                                            {product.promotion_enabled &&
                                              product.allOffers &&
                                              product.allOffers.filter(
                                                (offer) =>
                                                  offer.id !== product.id_offer
                                              ).length > 0 && (
                                                <>
                                                  <label className='d-flex align-items-center small text-muted mb-1'>
                                                    <span>Oferta Antiga</span>
                                                      <BsInfoCircle
                                                        style={{
                                                          cursor: 'help',
                                                          fontSize: '0.875rem',
                                                          marginLeft: '0.275rem',
                                                        }}
                                                        title='Selecione a oferta antiga que será exibida com preço cortado (riscado) para criar o efeito de promoção. O preço desta oferta aparecerá riscado acima do preço atual da oferta selecionada.'
                                                      />
                                                  </label>
                                                  <Form.Control
                                                    as='select'
                                                    size='sm'
                                                    value={
                                                      product.promotion_offer_id ||
                                                      ''
                                                    }
                                                    onChange={(e) =>
                                                      handleUpdateProductConfig(
                                                        product.id,
                                                        'promotion_offer_id',
                                                        e.target.value
                                                          ? parseInt(
                                                              e.target.value
                                                            )
                                                          : null
                                                      )
                                                    }
                                                  >
                                                    <option value=''>
                                                      Selecione uma oferta
                                                      antiga
                                                    </option>
                                                    {product.allOffers
                                                      .filter(
                                                        (offer) =>
                                                          offer.id !==
                                                          product.id_offer
                                                      )
                                                      .map((offer) => (
                                                        <option
                                                          key={offer.id}
                                                          value={offer.id}
                                                        >
                                                          {offer.name ||
                                                            `Oferta ${offer.id}`}{' '}
                                                          - R${' '}
                                                          {(
                                                            offer.price / 100
                                                          ).toFixed(2)}
                                                        </option>
                                                      ))}
                                                  </Form.Control>
                                                </>
                                              )}
                                            {product.promotion_enabled &&
                                              (!product.allOffers ||
                                                product.allOffers.filter(
                                                  (offer) =>
                                                    offer.id !==
                                                    product.id_offer
                                                ).length === 0) && (
                                                <small className='text-muted d-block mt-1'>
                                                  Nenhuma outra oferta
                                                  disponível para comparação
                                                </small>
                                              )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    )}
                  </div>

                  <hr />

                  {/* Seção: Adicionar Conteúdos (cursos, ebooks, assinaturas) */}
                  <div className='mb-4'>
                    <h5>Adicionar Conteúdos</h5>
                    <small className='text-muted d-block mb-3'>
                      Cursos, vídeos, e-books e assinaturas - aparecerão na seção Outros Conteúdos
                    </small>

                    {unselectedProducts.filter(p => p.productType === 'content').length === 0 ? (
                      <div className='alert alert-info'>
                        <small>
                          Nenhum conteúdo disponível para adicionar.
                        </small>
                      </div>
                    ) : (
                      <div className='list-group'>
                        {unselectedProducts
                          .filter(p => p.productType === 'content')
                          .map((product) => (
                          <div
                            key={product.id}
                            className='list-group-item d-flex align-items-center justify-content-between'
                          >
                            <div className='d-flex align-items-center flex-grow-1'>
                              <div
                                className='me-5'
                                style={{ marginRight: '1.5rem' }}
                              >
                                {product.cover ? (
                                  <img
                                    src={product.cover}
                                    alt={product.name}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      backgroundColor: '#e9ecef',
                                      borderRadius: '4px',
                                    }}
                                  />
                                )}
                              </div>
                              <div>
                                <strong>{product.name}</strong>
                                <small className='text-muted d-block'>{product.productTypeLabel}</small>
                              </div>
                            </div>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              onClick={() => handleAddProduct(product.id)}
                            >
                              Adicionar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Seção: Adicionar Produtos (físicos, apenas pagamento) */}
                  <div className='mb-3'>
                    <h5>Adicionar Produtos</h5>
                    <small className='text-muted d-block mb-3'>
                      Produtos físicos e apenas pagamento - aparecerão na seção Alguns de Nossos Produtos (sempre disponíveis para compra)
                    </small>

                    {unselectedProducts.filter(p => p.productType === 'store').length === 0 ? (
                      <div className='alert alert-info'>
                        <small>
                          Nenhum produto disponível para adicionar.
                        </small>
                      </div>
                    ) : (
                      <div className='list-group'>
                        {unselectedProducts
                          .filter(p => p.productType === 'store')
                          .map((product) => (
                          <div
                            key={product.id}
                            className='list-group-item d-flex align-items-center justify-content-between'
                          >
                            <div className='d-flex align-items-center flex-grow-1'>
                              <div
                                className='me-5'
                                style={{ marginRight: '1.5rem' }}
                              >
                                {product.cover ? (
                                  <img
                                    src={product.cover}
                                    alt={product.name}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      backgroundColor: '#e9ecef',
                                      borderRadius: '4px',
                                    }}
                                  />
                                )}
                              </div>
                              <div>
                                <strong>{product.name}</strong>
                                <small className='text-muted d-block'>{product.productTypeLabel}</small>
                              </div>
                            </div>
                            <Button
                              variant='outline-primary'
                              size='sm'
                              onClick={() => handleAddProduct(product.id)}
                            >
                              Adicionar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default MemberRecommended;

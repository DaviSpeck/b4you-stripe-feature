import { useState, useEffect, useRef } from 'react';
import { Alert, Col, Form, Row, Table, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller, useForm } from 'react-hook-form';
import Switch from 'react-switch';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify, currency } from '../functions';
import ObPreview from '../products/offers/ob-preview';
import Loader from '../../utils/loader';

const ModalBumps = ({ setShow, shop, embedded = false }) => {
  const [requesting, setRequesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bumps, setBumps] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBump, setEditingBump] = useState(null);
  const [productName, setProductName] = useState('');
  const [isOBQuantity, setIsOBQuantity] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadUrl, setUploadUrl] = useState('');
  const [preview, setPreview] = useState({
    title: 'Confira essa oferta especial ÚNICA',
    product_name: '',
    label: '',
    price: 0,
    price_before: 0,
    max_quantity: 0,
    cover: '',
  });

  const fileElement = useRef(null);

  const {
    register,
    handleSubmit,
    errors,
    control,
    reset,
    setValue,
    trigger,
    formState,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: 'Confira essa oferta especial ÚNICA',
      product_id: '',
      offer_id: '',
      product_name: '',
      label: '',
      price_before: null,
      max_quantity: null,
    },
  });

  const { isValid } = formState;

  useEffect(() => {
    if (shop?.uuid) {
      fetchBumps();
      fetchProducts();
    }
  }, [shop]);

  // Sincronizar valores do formulário quando selectedProduct mudar (apenas para edição)
  useEffect(() => {
    if (selectedProduct && editingBump) {
      setValue('product_id', selectedProduct.uuid, { shouldValidate: true });
      if (!productName || productName === 'Selecione um produto acima') {
        setProductName(selectedProduct.name);
        setValue('product_name', selectedProduct.name, { shouldValidate: true });
      }
    }
  }, [selectedProduct, editingBump, setValue, productName]);

  // Sincronizar valores do formulário quando selectedOffer mudar (apenas para edição)
  useEffect(() => {
    if (selectedOffer && editingBump) {
      setValue('offer_id', selectedOffer.uuid, { shouldValidate: true });
    }
  }, [selectedOffer, editingBump, setValue]);

  const fetchBumps = () => {
    setRequesting(true);
    api
      .get(`/integrations/ecommerce/shops/${shop.uuid}/bumps`)
      .then((response) => setBumps(response.data))
      .catch((err) => {
        console.error(err);
        notify({ message: 'Falha ao carregar bumps', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/with-offers');
      
      // Organizar produtos com suas ofertas
      const productsMap = {};
      const containerProductId = shop?.id_product || shop?.container_product?.id;
      
      response.data.forEach((product) => {
        // Filtrar o produto container da loja (produto genérico)
        // Comparar convertendo ambos para número para evitar problemas de tipo
        if (containerProductId) {
          const productId = Number(product.id);
          const containerId = Number(containerProductId);
          if (!isNaN(productId) && !isNaN(containerId) && productId === containerId) {
            return; // Pular o produto container
          }
        }
        
        // Usar uuid como chave se id não estiver disponível
        const key = product.id || product.uuid;
        if (!productsMap[key]) {
          productsMap[key] = {
            id: product.id,
            uuid: product.uuid,
            name: product.name,
            cover: product.cover,
            physical_type: product.physical_type,
            payment_type: product.payment_type,
            offers: [],
          };
        }
        // Adicionar ofertas do produto (mesmo que vazio, o produto deve aparecer)
        if (product.offers && product.offers.length > 0) {
          product.offers.forEach((offer) => {
            // Evitar duplicatas
            const existingOffer = productsMap[key].offers.find(o => o.uuid === offer.uuid);
            if (!existingOffer) {
              productsMap[key].offers.push({
                id: offer.id,
                uuid: offer.uuid,
                name: offer.name,
                label: offer.label || offer.name,
                price: offer.price,
                plans: offer.plans || [],
              });
            }
          });
        }
      });
      
      setProducts(Object.values(productsMap));
    } catch (err) {
      console.error(err);
      notify({ message: 'Falha ao carregar produtos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedOffer(null);
    setProductName('');
    setIsOBQuantity(false);
    setUploadFiles([]);
    setUploadUrl('');
    setOffers([]);
    setPreview({
      title: 'Confira essa oferta especial ÚNICA',
      product_name: '',
      label: '',
      price: 0,
      price_before: 0,
      max_quantity: 0,
      cover: '',
    });
    setEditingBump(null);
    setShowForm(false);
    reset({
      product_id: '',
      offer_id: '',
      product_name: '',
      title: 'Confira essa oferta especial ÚNICA',
      label: '',
      price_before: '',
      max_quantity: '',
    });
    if (fileElement.current) {
      fileElement.current.value = '';
    }
  };

  const handleEdit = async (bump) => {
    setLoading(true);
    try {
      // Buscar produto e oferta do bump
      const product = products.find((p) => 
        p.offers.some((o) => o.id === bump.order_bump_offer)
      );
      
      if (product) {
        const offer = product.offers.find((o) => o.id === bump.order_bump_offer);
        setSelectedProduct(product);
        setSelectedOffer(offer);
        setProductName(bump.product_name || product.name);
        setIsOBQuantity(bump.show_quantity || false);
        
        setPreview({
          title: bump.title || 'Confira essa oferta especial ÚNICA',
          product_name: bump.product_name || product.name,
          label: bump.label || '',
          price: offer?.price || 0,
          price_before: bump.price_before || 0,
          max_quantity: bump.max_quantity || 0,
          cover: bump.cover || product.cover || '',
        });
        
        if (bump.cover) {
          setUploadUrl(bump.cover);
        }
        
        reset({
          product_id: product.uuid,
          offer_id: offer?.uuid || '',
          product_name: bump.product_name || product.name,
          title: bump.title || 'Confira essa oferta especial ÚNICA',
          label: bump.label || '',
          description: bump.description || '',
          price_before: bump.price_before || '',
          max_quantity: bump.max_quantity || '',
        });
      }
      
      setEditingBump(bump);
      setShowForm(true);
    } catch (err) {
      console.error(err);
      notify({ message: 'Falha ao carregar bump', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const productUuid = e.target.value;
    const product = products.find((p) => p.uuid === productUuid);
    
    // Atualizar o valor no formulário
    setValue('product_id', productUuid, { shouldValidate: true });
    
    if (product) {
      setSelectedProduct(product);
      setSelectedOffer(null);
      setProductName(product.name);
      setValue('product_name', product.name, { shouldValidate: true });
      setIsOBQuantity(product.physical_type || false);
      
      setPreview((prev) => ({
        ...prev,
        product_name: product.name,
        cover: uploadFiles.length > 0 ? uploadUrl : (product.cover || ''),
        price: 0,
      }));
      
      // Filtrar ofertas do produto selecionado
      setOffers(product.offers || []);
    } else {
      setSelectedProduct(null);
      setSelectedOffer(null);
      setOffers([]);
      setValue('product_id', '', { shouldValidate: true });
      setValue('product_name', '', { shouldValidate: true });
    }
    
    setValue('offer_id', '', { shouldValidate: true });
  };

  const handleOfferChange = (e) => {
    const offerUuid = e.target.value;
    const offer = offers.find((o) => o.uuid === offerUuid);
    
    if (offer) {
      setSelectedOffer(offer);
      setValue('offer_id', offerUuid, { shouldValidate: true });
      setPreview((prev) => ({
        ...prev,
        price: offer.price || 0,
      }));
    } else {
      setSelectedOffer(null);
      setValue('offer_id', '', { shouldValidate: true });
      setPreview((prev) => ({
        ...prev,
        price: 0,
      }));
    }
  };

  const updatePreview = (e) => {
    if (e.target.name === 'product_name') {
      setProductName(e.target.value);
      setValue('product_name', e.target.value);
    }
    setPreview((data) => ({ ...data, [e.target.name]: e.target.value }));
  };

  const updatePrice = (e, maskedValue, floatValue) => {
    setPreview((prevValues) => ({
      ...prevValues,
      [e.target.name]: floatValue,
    }));
  };

  const handleBrowse = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    const maxSizeInBytes = 2 * 1024 * 1024;
    const expectedDimensions = { width: 310, height: 310 };

    if (!validTypes.includes(file.type)) {
      return resetImage(e, 'Formato inválido. Use apenas PNG ou JPG.');
    }

    if (file.size > maxSizeInBytes) {
      return resetImage(e, 'Arquivo muito grande. O tamanho máximo é 2MB.');
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        if (
          width !== expectedDimensions.width ||
          height !== expectedDimensions.height
        ) {
          return resetImage(
            e,
            `Dimensão inválida. A imagem deve ter ${expectedDimensions.width} x ${expectedDimensions.height}px.`
          );
        }

        const imageUrl = URL.createObjectURL(file);

        setUploadFiles([file]);
        setUploadUrl(imageUrl);
        setProductName(selectedProduct?.name || '');
        setValue('product_name', selectedProduct?.name || '');
        setPreview((prev) => ({
          ...prev,
          cover: imageUrl,
        }));
      };

      img.onerror = () => {
        resetImage(e, 'Erro ao carregar a imagem. Verifique o arquivo.');
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  };

  const resetImage = (e, message) => {
    notify({ message, type: 'error' });
    e.target.value = '';
    setUploadFiles([]);
    setUploadUrl('');
    setPreview((prev) => ({
      ...prev,
      cover: selectedProduct?.cover || '',
    }));
    setValue('cover', '');
    setProductName(selectedProduct?.name || '');
    setValue('product_name', selectedProduct?.name || '');
  };

  const removeFiles = () => {
    setUploadFiles([]);
    setUploadUrl('');
    setPreview((prev) => ({
      ...prev,
      cover: selectedProduct ? selectedProduct.cover : '',
    }));
    fileElement.current.value = '';
    setValue('cover', '');
    setProductName(selectedProduct?.name || '');
    setValue('product_name', selectedProduct?.name || '');
  };

  const onSubmit = async (data) => {
    // Verificar se temos uma oferta selecionada (do estado ou do formulário)
    let offerId = null;
    if (selectedOffer && selectedOffer.id) {
      offerId = selectedOffer.id;
    } else if (data.offer_id) {
      // Fallback: buscar a oferta pelo UUID do formulário
      const offer = offers.find((o) => o.uuid === data.offer_id);
      if (offer && offer.id) {
        offerId = offer.id;
      }
    }

    if (!offerId) {
      notify({ message: 'Selecione uma oferta', type: 'error' });
      return;
    }

    if (!selectedProduct || !selectedProduct.uuid) {
      notify({ message: 'Selecione um produto', type: 'error' });
      return;
    }

    setRequesting(true);

    let fields = {
      order_bump_offer: offerId, // ID da oferta
      product_name: data.product_name,
      title: data.title,
      label: data.label,
      description: null, // Não usado no formulário, mas mantido para compatibilidade
      price_before: data.price_before
        ? (isNaN(data.price_before)
            ? parseFloat(data.price_before.replace('.', '').replace(',', '.'))
            : data.price_before)
        : null,
      show_quantity: isOBQuantity,
      max_quantity: data.max_quantity ? parseInt(data.max_quantity) : null,
      // Não enviar cover se houver arquivo para upload (será feito upload separado)
      // Se for edição e não houver arquivo novo, manter o cover existente
      cover: uploadFiles.length > 0 
        ? null 
        : (editingBump && editingBump.cover && (!uploadUrl || !uploadUrl.startsWith('blob:'))) 
          ? editingBump.cover 
          : (uploadUrl && !uploadUrl.startsWith('blob:')) 
            ? uploadUrl 
            : null,
    };

    console.log('Enviando bump:', fields);

    try {
      let response;
      if (editingBump) {
        response = await api.put(
          `/integrations/ecommerce/shops/${shop.uuid}/bumps/${editingBump.id}`,
          fields
        );
      } else {
        response = await api.post(
          `/integrations/ecommerce/shops/${shop.uuid}/bumps`,
          fields
        );
      }

      // Upload de imagem se houver
      if (uploadFiles.length > 0) {
        const formData = new FormData();
        formData.append('cover', uploadFiles[0]);

        const options = {
          headers: {
            files_data: JSON.stringify([
              {
                type: uploadFiles[0].type,
                size: uploadFiles[0].size,
              },
            ]),
          },
        };

        const bumpId = editingBump ? editingBump.id : response.data?.id;
        if (bumpId) {
          await api.put(
            `/integrations/ecommerce/shops/${shop.uuid}/bumps/${bumpId}/cover`,
            formData,
            options
          );
        }
      } else if (editingBump && !uploadUrl && !uploadFiles.length && editingBump.cover) {
        // Se estava editando e removeu a imagem (uploadUrl vazio e sem arquivo), deletar
        await api.delete(
          `/integrations/ecommerce/shops/${shop.uuid}/bumps/${editingBump.id}/cover`
        );
      }

      fetchBumps();
      resetForm();
      notify({
        message: editingBump ? 'Bump atualizado!' : 'Bump criado!',
        type: 'success',
      });
    } catch (err) {
      console.error('Erro ao salvar bump:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Falha ao salvar bump';
      notify({ message: errorMessage, type: 'error' });
    } finally {
      setRequesting(false);
    }
  };

  const handleDelete = (bumpId) => {
    if (!window.confirm('Remover este bump?')) return;

    setRequesting(true);
    api
      .delete(`/integrations/ecommerce/shops/${shop.uuid}/bumps/${bumpId}`)
      .then(() => {
        fetchBumps();
        notify({ message: 'Bump removido!', type: 'success' });
      })
      .catch((err) => {
        console.error(err);
        notify({ message: 'Falha ao remover bump', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  // Check if shop has container product configured
  if (!shop?.id_default_offer) {
    return (
      <Alert variant='warning'>
        <Alert.Heading>Produto Container Não Configurado</Alert.Heading>
        <p>
          Esta loja não possui um produto container configurado. Os order bumps são gerenciados
          através do produto container da loja.
        </p>
        <p className='mb-0'>
          Por favor, recrie a loja para que o produto container seja criado automaticamente.
        </p>
      </Alert>
    );
  }

  if (loading && showForm) {
    return <Loader title='Carregando order bump...' />;
  }

  return (
    <div>
      <Alert variant='info' className='mb-3'>
        <small>
          <i className='bx bx-info-circle me-1'></i>
          Os order bumps configurados aqui serão exibidos em <strong>todas</strong> as ofertas
          geradas para esta loja.
        </small>
      </Alert>

      {!showForm ? (
        <>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <h6 className='mb-0'>
              <i className='bx bx-plus-circle me-2'></i>
              Order Bumps ({bumps.length})
            </h6>
            <ButtonDS size='sm' onClick={() => setShowForm(true)}>
              <i className='bx bx-plus me-1'></i> Novo Bump
            </ButtonDS>
          </div>

          <Table responsive hover size='sm'>
            <thead>
              <tr>
                <th>Título</th>
                <th>Produto</th>
                <th>Oferta</th>
                <th>Preço</th>
                <th className='text-center'>Quantidade</th>
                <th width='100' className='text-center'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bumps.map((bump) => (
                <tr key={bump.id}>
                  <td>
                    <strong>{bump.title || 'Sem título'}</strong>
                    {bump.label && <Badge bg='secondary' className='ms-2'>{bump.label}</Badge>}
                    {bump.description && (
                      <small className='text-muted d-block'>{bump.description}</small>
                    )}
                  </td>
                  <td>{bump.product_name || '-'}</td>
                  <td>
                    {bump.offer ? (
                      <span>{bump.offer.name}</span>
                    ) : (
                      <span className='text-muted'>-</span>
                    )}
                  </td>
                  <td>
                    {bump.offer?.price ? (
                      <span>
                        R$ {bump.offer.price}
                        {bump.price_before && (
                          <small className='text-muted d-block'>
                            <s>R$ {bump.price_before}</s>
                          </small>
                        )}
                      </span>
                    ) : (
                      <span className='text-muted'>-</span>
                    )}
                  </td>
                  <td className='text-center'>
                    {bump.show_quantity ? (
                      <Badge bg='success'>
                        {bump.max_quantity ? `Max: ${bump.max_quantity}` : 'Sim'}
                      </Badge>
                    ) : (
                      <Badge bg='secondary'>Não</Badge>
                    )}
                  </td>
                  <td className='text-center'>
                    <ButtonDS size='icon' variant='outline-warning' onClick={() => handleEdit(bump)} className='me-1'>
                      <i className='bx bx-edit'></i>
                    </ButtonDS>
                    <ButtonDS size='icon' variant='outline-danger' onClick={() => handleDelete(bump.id)}>
                      <i className='bx bx-trash'></i>
                    </ButtonDS>
                  </td>
                </tr>
              ))}
              {bumps.length === 0 && !requesting && (
                <tr>
                  <td colSpan='6' className='text-center py-4'>
                    <i className='bx bx-plus-circle' style={{ fontSize: 32, opacity: 0.3 }}></i>
                    <p className='mb-0 mt-2 text-muted'>Nenhum bump criado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col xs={12} md={12}>
              <Form.Group>
                <label htmlFor='product_id'>Produto</label>
                <Controller
                  name='product_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ onChange, value }) => (
                    <>
                      <Form.Control
                        as='select'
                        name='product_id'
                        id='product_id'
                        disabled={editingBump}
                        value={value || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          onChange(newValue);
                          handleProductChange(e);
                        }}
                        isInvalid={errors.product_id}
                      >
                        <option value=''>Selecione um produto</option>
                        {products && products.length > 0 ? (
                          products.map((item) => (
                            <option value={item.uuid} key={item.id || item.uuid}>
                              {item.name}
                            </option>
                          ))
                        ) : (
                          <option value='' disabled>
                            Nenhum produto disponível
                          </option>
                        )}
                      </Form.Control>
                      {errors.product_id && (
                        <Form.Control.Feedback type='invalid'>
                          Selecione um produto
                        </Form.Control.Feedback>
                      )}
                    </>
                  )}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={12}>
              <Form.Group>
                <label htmlFor='offer_id'>Oferta</label>
                <Controller
                  name='offer_id'
                  control={control}
                  rules={{ required: true }}
                  render={({ onChange, value }) => (
                    <>
                      <Form.Control
                        as='select'
                        name='offer_id'
                        id='offer_id'
                        disabled={!selectedProduct || editingBump}
                        value={value || ''}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          onChange(newValue);
                          handleOfferChange(e);
                        }}
                        isInvalid={errors.offer_id}
                      >
                        <option value=''>
                          {selectedProduct
                            ? 'Selecione uma oferta'
                            : 'Selecione um produto acima'}
                        </option>
                        {selectedProduct &&
                          offers.map((item) => (
                            <option value={item.uuid} key={item.id}>
                              {item.label} - {currency(item.price)}
                            </option>
                          ))}
                      </Form.Control>
                      {errors.offer_id && (
                        <Form.Control.Feedback type='invalid'>
                          Selecione uma oferta
                        </Form.Control.Feedback>
                      )}
                    </>
                  )}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={12}>
              <Form.Group>
                <div className='d-flex align-items-center mb-2'>
                  <label className='m-0' htmlFor='image'>
                    Imagem
                  </label>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id={`tooltip-top`}>
                        Dimensão esperada 310 x 310 px
                      </Tooltip>
                    }
                  >
                    <i className='bx bx-info-circle ml-1 pointer'></i>
                  </OverlayTrigger>
                </div>

                <small>
                  Caso nenhuma imagem seja selecionada, será utilizada a padrão
                  do produto.
                </small>

                <input
                  type='file'
                  ref={fileElement}
                  multiple={false}
                  onChange={handleBrowse}
                  className='form-control mt-2'
                  disabled={!selectedProduct}
                />

                {editingBump && uploadUrl && uploadFiles.length <= 0 && (
                  <div className='mt-2 mb-2'>
                    <small>
                      Existe um arquivo configurado como imagem do Order Bump.
                      Se você quiser removê-lo, clique no botão abaixo ou
                      selecione uma nova imagem acima.
                    </small>
                  </div>
                )}

                {uploadUrl && (
                  <ButtonDS
                    className='mt-2'
                    size='xs'
                    variant='danger'
                    onClick={removeFiles}
                  >
                    Remover imagem
                  </ButtonDS>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm={12}>
              <Form.Group>
                <div className='d-flex align-items-center mb-2'>
                  <label className='m-0' htmlFor='title'>
                    Título
                  </label>
                  <OverlayTrigger
                    placement='top'
                    overlay={
                      <Tooltip id={`tooltip-top`}>
                        Se houver dois ou mais Order Bumps na oferta, o sistema
                        usará sempre o título do primeiro Order Bump
                        configurado.
                      </Tooltip>
                    }
                  >
                    <i className='bx bx-info-circle ml-1 pointer'></i>
                  </OverlayTrigger>
                </div>

                <Form.Control
                  name='title'
                  id='title'
                  ref={register({ required: true })}
                  isInvalid={errors.title}
                  onChange={updatePreview}
                  placeholder='Título da oferta'
                />
                {errors.title && (
                  <Form.Control.Feedback type='invalid'>
                    Título é obrigatório
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm={12}>
              <Form.Group>
                <label htmlFor='product_name'>Nome do produto exibido</label>
                <Form.Control
                  name='product_name'
                  id='product_name'
                  ref={register({ required: true })}
                  isInvalid={errors['product_name']}
                  disabled={!selectedProduct}
                  value={productName}
                  onChange={updatePreview}
                  placeholder={
                    selectedProduct
                      ? 'Nome do produto exibido na oferta'
                      : 'Selecione um produto acima'
                  }
                />
                {errors.product_name && (
                  <Form.Control.Feedback type='invalid'>
                    Nome do produto é obrigatório
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm={12}>
              <Form.Group>
                <label htmlFor='label'>Texto</label>
                <Form.Control
                  name='label'
                  id='label'
                  ref={register({ required: true })}
                  isInvalid={errors.label}
                  onChange={updatePreview}
                  placeholder='Texto da oferta'
                />
                {errors.label && (
                  <Form.Control.Feedback type='invalid'>
                    Texto é obrigatório
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <label htmlFor='price_before'>De</label>
                <Controller
                  as={CurrencyInput}
                  control={control}
                  name='price_before'
                  id='price_before'
                  decimalSeparator=','
                  thousandSeparator='.'
                  onChangeEvent={updatePrice}
                  className={
                    errors.price_before
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  rules={{
                    required: true,
                    validate: (value) => {
                      if (isNaN(value)) {
                        if (parseFloat(value.replace('.', '').replace(',', '.')) > 4.99) {
                          return true;
                        }
                      }
                      return true;
                    },
                  }}
                />
                {errors.price_before && (
                  <Form.Control.Feedback type='invalid'>
                    Preço anterior é obrigatório
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <label htmlFor='price'>Por</label>
                <Form.Control
                  name='price'
                  id='price'
                  disabled
                  value={currency(selectedOffer?.price || 0)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12}>
              {selectedProduct?.physical_type && (
                <>
                  <div className='d-flex align-items-center mt-2 mb-4'>
                    <Switch
                      onChange={() => {
                        setIsOBQuantity(!isOBQuantity);
                      }}
                      checked={isOBQuantity}
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

                    <span className='ml-2'>
                      {isOBQuantity ? (
                        <span>Mostrar quantidades</span>
                      ) : (
                        <span>Oferta única</span>
                      )}
                    </span>
                  </div>

                  {isOBQuantity && (
                    <Form.Group>
                      <label htmlFor='max_quantity'>
                        Limite de quantidade{' '}
                        <OverlayTrigger
                          placement='top'
                          overlay={
                            <Tooltip id={`tooltip-top`}>
                              Quantidade configurada na oferta selecionada:{' '}
                              {selectedOffer?.quantity || 0}
                            </Tooltip>
                          }
                        >
                          <i className='bx bx-info-circle pointer' />
                        </OverlayTrigger>
                      </label>

                      <Form.Control
                        name='max_quantity'
                        id='max_quantity'
                        type='number'
                        ref={register({
                          required: false,
                          min: 1,
                        })}
                        disabled={!selectedOffer}
                        isInvalid={errors.max_quantity}
                        onChange={(e) => {
                          updatePreview(e);
                          setPreview((prev) => ({
                            ...prev,
                            max_quantity: parseInt(e.target.value) || 0,
                          }));
                        }}
                        placeholder='Digite o limite de quantidade'
                        min={1}
                        style={{
                          background: !selectedOffer ? '#e7e7e7' : null,
                        }}
                      />

                      <Form.Control.Feedback type='invalid'>
                        {errors.max_quantity?.type === 'min' &&
                          'O limite de quantidade deve ser maior que 0 ou vazio (ilimitado)'}
                      </Form.Control.Feedback>
                    </Form.Group>
                  )}
                </>
              )}

              <label className='d-block'>Prévia</label>

              <div className='preview'>
                <ObPreview
                  title={preview?.title}
                  label={preview?.label}
                  price_before={preview?.price_before}
                  price={preview?.price}
                  productName={preview?.product_name}
                  productCover={preview?.cover}
                  showQuantity={isOBQuantity}
                  maxQuantity={preview?.max_quantity}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={12}>
              <div className='d-flex justify-content-between align-items-center mt-3'>
                <ButtonDS
                  variant='light'
                  iconLeft='bxs-chevron-left'
                  style={{ height: 35 }}
                  onClick={resetForm}
                  size='sm'
                >
                  Voltar
                </ButtonDS>
                <ButtonDS
                  variant='primary'
                  onClick={handleSubmit(
                    onSubmit,
                    () => {
                      notify({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
                    }
                  )}
                  disabled={!isValid || requesting}
                  size='sm'
                >
                  {!requesting ? 'Salvar Order Bump' : 'Salvando...'}
                </ButtonDS>
              </div>
            </Col>
          </Row>
        </form>
      )}

      {!showForm && !embedded && setShow && (
        <div className='d-flex justify-content-end mt-4'>
          <ButtonDS variant='outline-secondary' onClick={() => setShow(false)}>Fechar</ButtonDS>
        </div>
      )}
    </div>
  );
};

export default ModalBumps;

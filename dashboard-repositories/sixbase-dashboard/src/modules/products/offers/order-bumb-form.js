import { useEffect, useRef, useState } from 'react';
import { Col, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import 'react-datepicker/dist/react-datepicker.css';
import { Controller, useForm } from 'react-hook-form';
import Switch from 'react-switch';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import { currency, notify } from '../../functions';
import ObPreview from './ob-preview';

const OrderBumpForm = ({
  setNav,
  activeOffer,
  setActiveOffer,
  activeBump,
  uuidProduct,
  showQuantity = false,
  setShowModal,
  setShowModalBumps,
}) => {
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isOBQuantity, setIsOBQuantity] = useState(showQuantity);
  const [offers, setOffers] = useState([]);
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
  const [selectedPlan, setSelectedPlan] = useState('');

  const {
    register,
    handleSubmit,
    errors,
    control,
    reset,
    setValue,
    formState,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: 'Confira essa oferta especial ÚNICA',
    },
  });

  const { isValid } = formState;

  const fileElement = useRef(null);

  const handleSelectedPlan = (e, selectedOffer, setSelectedPlan, setPreview, setValue) => {
    setSelectedPlan(e.target.value);
    const plan = selectedOffer.plans.find(p => p.uuid === e.target.value);
    setPreview(prev => ({
      ...prev,
      price: plan ? plan.price : 0,
    }));
    setValue('plan_id', e.target.value);
  };

  const onSubmit = async (data) => {
    setRequesting(true);

    let fields = data;

    fields.price_before = isNaN(fields.price_before)
      ? fields.price_before.replace('.', '').replace(',', '.')
      : fields.price_before;
    fields.show_quantity = isOBQuantity;
    fields.max_quantity = fields.max_quantity || null;

    if (!activeBump) {
      try {
        const response = await api.post(
          `/products/offers/${uuidProduct}/${activeOffer.uuid}`,
          fields
        );

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

          await api.put(
            `/products/offers/${uuidProduct}/${activeOffer.uuid}/${response.data.last_ob_created.uuid}/cover`,
            formData,
            options
          );
        }

        setRequesting(false);
        setActiveOffer(response.data);
        setNav('list');
        setShowModal(false);
        setShowModalBumps(false);

        notify({
          message: 'Order bump criado com sucesso!',
          type: 'success',
        });
      } catch (error) {
        setRequesting(false);
        notify({
          message: 'Falha ao criar order bump',
          type: 'error',
        });

        return error;
      }
    } else {
      try {
        const response = await api.put(
          `/products/offers/${uuidProduct}/${activeOffer.uuid}/${activeBump.uuid}`,
          fields
        );

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

          await api.put(
            `/products/offers/${uuidProduct}/${activeOffer.uuid}/${activeBump.uuid}/cover`,
            formData,
            options
          );
        } else {
          if (activeBump.cover) {
            await api.delete(
              `/products/offers/${uuidProduct}/${activeOffer.uuid}/${activeBump.uuid}/cover`
            );
          }
        }

        setNav('list');
        setRequesting(false);
        setActiveOffer(response.data);
        setShowModal(false);
        setShowModalBumps(false);

        notify({
          message: 'Order bump alterado com sucesso!',
          type: 'success',
        });
      } catch (error) {
        setRequesting(false);
        notify({
          message: 'Falha ao alterar order bump',
          type: 'error',
        });

        return error;
      }
    }
  };

  const handleRemove = () => {
    setRemoving(true);

    api
      .delete(
        `/products/offers/${uuidProduct}/${activeOffer.uuid}/${activeBump.uuid}/ob`
      )
      .then((response) => {
        setNav('list');
        setActiveOffer(response.data);

        notify({
          message: 'Order bump removido com sucesso!',
          type: 'success',
        });
      })
      .catch(() => { })
      .finally(() => {
        setRemoving(false);
      });
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

  const handleProductChange = (e) => {
    let p = products.find((item) => item.uuid === e.target.value);

    if (p) {
      setSelectedProduct(p);

      if (!p.physical_type) {
        setIsOBQuantity(false);
      } else {
        setIsOBQuantity(true);
      }
    } else {
      setSelectedProduct(null);
    }

    setSelectedOffer(null);
  };

  const handleOfferChange = (e) => {
    let offerId = e.target.value;

    let o = selectedProduct.offers.find((item) => item.uuid === offerId);
    setSelectedOffer(o);
  };

  const fetchProductsAndSetup = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/products/offers/${uuidProduct}/${activeOffer.uuid}/select-offers`
      );

      setProducts(response.data);

      if (activeBump) {
        const selProd = response.data.find(
          (p) => p.uuid === activeBump.product.uuid
        );

        setSelectedProduct(selProd);

        const selOffer = selProd?.offers?.find(
          (o) => o.uuid === activeBump.offer.uuid
        );

        setSelectedOffer(selOffer);

        const fallbackName = activeBump.product_name || selProd?.name;
        const fallbackCover = activeBump.cover || selProd?.cover;

        setPreview({
          title: activeBump.title || 'Confira essa oferta especial ÚNICA',
          product_name: fallbackName,
          label: activeBump.label,
          price: activeBump.price,
          price_before: activeBump.price_before,
          max_quantity: activeBump.max_quantity,
          cover: fallbackCover,
          plan_id: null
        });

        if (
          selOffer &&
          selProd?.payment_type === 'subscription' &&
          selOffer.plans &&
          selOffer.plans.length > 0
        ) {
          const cheapestPlan = selOffer.plans.reduce((min, p) =>
            Number(p.price) < Number(min.price) ? p : min
          );
          setSelectedPlan(cheapestPlan.uuid);
          setPreview(prev => ({
            ...prev,
            price: cheapestPlan.price
          }));
          setValue('plan_id', cheapestPlan.uuid);
        }

        reset({
          ...activeBump,
          title: activeBump.title || 'Confira essa oferta especial ÚNICA',
          product_name: fallbackName,
          offer_id: selOffer?.uuid,
          price: selOffer?.price,
          cover: fallbackCover,
        });

        if (activeBump.cover) {
          setUploadFiles([]);
          setUploadUrl(activeBump.cover);
        }
      }
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchProductsAndSetup();
  }, [activeBump]);

  useEffect(() => {
    if (!activeBump && selectedProduct) {
      setProductName(selectedProduct.name);
      setValue('product_name', selectedProduct.name);

      setPreview((prev) => ({
        ...prev,
        product_name: selectedProduct.name,
      }));

      if (uploadFiles.length > 0) {
        setPreview((prev) => ({
          ...prev,
          cover: uploadUrl,
        }));
      } else {
        setPreview((prev) => ({
          ...prev,
          cover: selectedProduct.cover,
        }));
      }
    }

    return () => reset();
  }, [selectedProduct, activeBump]);

  useEffect(() => {
    if (selectedProduct) {
      const offersList = selectedProduct.offers.filter(
        (item) => item.uuid !== activeOffer.uuid
      );

      setOffers(offersList);
    }
  }, [selectedProduct]);

  return (
    <>
      {!loading ? (
        <>
          <Row>
            <Col xs={12} md={12}>
              <Form.Group>
                <label htmlFor='product_id'>Produto</label>
                <Form.Control
                  as='select'
                  name='product_id'
                  id='product_id'
                  disabled={activeBump}
                  onChange={handleProductChange}
                  defaultValue={selectedProduct ? selectedProduct.uuid : null}
                >
                  <option>Selecione um produto</option>
                  {products.map((item, index) => {
                    return (
                      <option value={item.uuid} key={index}>
                        {item.name}
                      </option>
                    );
                  })}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col xs={12} md={12}>
              <Form.Group>
                <label htmlFor='offer_id'>Oferta</label>

                <Form.Control
                  ref={register}
                  as='select'
                  name='offer_id'
                  id='offer_id'
                  disabled={!selectedProduct || activeBump}
                  onChange={handleOfferChange}
                >
                  <option value=''>
                    {selectedProduct
                      ? 'Selecionar oferta'
                      : 'Selecione um produto acima'}
                  </option>
                  {selectedProduct &&
                    offers.map((item, index) => {
                      return (
                        <option value={item.uuid} key={index}>
                          {item.label} - {currency(item.price)}
                        </option>
                      );
                    })}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col xs={12} sm={12}>
              {selectedOffer &&
                selectedProduct.payment_type === 'subscription' && (
                  <Form.Group>
                    <label htmlFor='plan_id'>Plano de recorrência</label>
                    <Form.Control
                      as='select'
                      name='plan_id'
                      id='plan_id'
                      ref={register({ required: true })}
                      defaultValue={selectedPlan}
                      onChange={e => handleSelectedPlan(e, selectedOffer, setSelectedPlan, setPreview, setValue)}
                    >
                      <option value=''>Selecione um plano</option>
                      {selectedOffer.plans.map((plan) => (
                        <option value={plan.uuid} key={plan.uuid}>
                          {plan.label} - {currency(plan.price)} (
                          {plan.frequency_label})
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                )}
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

                {activeBump && uploadUrl && uploadFiles.length <= 0 && (
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
                  ref={register()}
                  isInvalid={errors.title}
                  onChange={updatePreview}
                  placeholder='Título da oferta'
                />
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
                        if (parseFloat(value.replace('.', '')) > 4.99) {
                          return true;
                        }
                      }
                    },
                  }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} sm={6}>
              <Form.Group>
                <label htmlFor='price'>Por</label>
                <Form.Control
                  name='price'
                  id='price'
                  disabled
                  value={
                    selectedProduct?.payment_type === 'subscription'
                      ? currency(
                        selectedOffer?.plans.find(p => p.uuid === selectedPlan)?.price || 0
                      )
                      : currency(selectedOffer?.price || 0)
                  }
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
                          <i class='bx bx-info-circle pointer' />
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
                        onChange={updatePreview}
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
              <div className='text-left'>
                {activeBump && (
                  <div className='text-danger'>
                    {!removing ? (
                      <div
                        onClick={() => {
                          handleRemove();
                        }}
                      >
                        <i className='fa fa-trash mr-2' />
                        <span className='pointer'>Remover Order Bump</span>
                      </div>
                    ) : (
                      removing === true && (
                        <i className='bx bx-loader-alt bx-spin remove-loading' />
                      )
                    )}
                  </div>
                )}
              </div>
              <div className='d-flex justify-content-between align-items-center mt-3'>
                <ButtonDS
                  variant={'light'}
                  iconLeft={'bxs-chevron-left'}
                  style={{ height: 35 }}
                  onClick={() => setNav('list')}
                  size='sm'
                >
                  Voltar
                </ButtonDS>
                <ButtonDS
                  variant='primary'
                  onClick={handleSubmit(onSubmit)}
                  disabled={!isValid || requesting}
                  size='sm'
                >
                  {!requesting ? 'Salvar Order Bump' : 'Salvando...'}
                </ButtonDS>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <Loader title='Carregando order bump...' />
      )}
    </>
  );
};

export default OrderBumpForm;

import pt from 'date-fns/locale/pt-BR';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Collapse, Modal, Row } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import DatePicker, { registerLocale } from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import Switch from 'react-switch';
import { notify } from '../../../modules/functions';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import regexEmail from '../../../utils/regex-email';
import './form.css';

registerLocale('pt-BR', pt);

const ModalCoupon = ({
  isOpen,
  setIsOpen,
  activeCoupon = null,
  uuidProduct,
  setCreated,
  setOpenCreated,
  setActiveCoupon,
  setModalCancelShow,
}) => {
  const [requesting, setRequesting] = useState(false);
  const [show, setShow] = useState(false);
  const [options, setOptions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const {
    register,
    handleSubmit,
    errors,
    control,
    reset,
    watch,
    setValue,
    clearErrors,
  } =
    useForm({
      mode: 'onChange',
    });

  const { product } = useProduct();

  const type = watch('discount_type') || 'percentual';
  const restrictOffers = watch('restrict_offers');

  const onSubmit = async (data) => {
    data.percentage = parseFloat(
      String(data.percentage).replace('%', '').replace('R$', '')
    );

    if (typeof data.min_amount === 'string') {
      const min_amount = data.min_amount.split(',');
      if (min_amount.length > 1) {
        data.min_amount = parseFloat(
          `${min_amount[0].replace('.', '')}.${min_amount[1]}`
        );
      }
    }

    if (data.affiliate) {
      data.id_affiliate = data.affiliate.value;
    } else {
      data.id_affiliate = null;
    }

    const restrictValue = Boolean(data.restrict_offers);
    data.restrict_offers = restrictValue;

    if (restrictValue) {
      const selectedOffers = Array.isArray(data.offers_ids)
        ? data.offers_ids
        : [];

      const normalizedOffers = selectedOffers
        .map((offer) => {
          if (offer === null || offer === undefined) return null;
          if (typeof offer === 'object') {
            return offer.value ?? offer.id ?? null;
          }
          return offer;
        })
        .filter((id) => id !== null && id !== undefined);

      data.offers_ids = normalizedOffers;
    } else {
      delete data.offers_ids;
    }

    if (activeCoupon) {
      setRequesting('put');
      await updateCoupon(data);
    } else {
      setRequesting('post');
      await createCoupon(data);
    }
  };

  const createCoupon = async (data) => {
    api
      .post(`/products/coupons/${uuidProduct}`, data)
      .then(({ data }) => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setCreated(data.coupon);
        setOpenCreated(true);
        setIsOpen(true);
      })
      .catch((err) => {
        let message = 'Erro ao cadastrar';
        if (err?.response?.data?.message) {
          message = err.response.data.message;
        }
        notify({ message, type: 'error' });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const updateCoupon = async (data) => {
    api
      .put(`/products/coupons/${uuidProduct}/${activeCoupon.uuid}`, data)
      .then(() => {
        notify({ message: 'Atualizado com sucesso', type: 'success' });
        setIsOpen(true);
      })
      .catch((err) => {
        let message = 'Erro ao salvar';
        if (err?.response?.data?.message) {
          message = err.response.data.message;
        }
        notify({ message, type: 'error' });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const fetchOptions = async (email) => {
    if (!regexEmail(email)) {
      return;
    }

    api
      .get(`/products/coupons/${uuidProduct}/affiliate?email=${email}`)
      .then(({ data }) => {
        setOptions([
          {
            value: data.id,
            label: `${data.full_name} - ${email}`,
          },
        ]);
      })
      .catch(() => {
        notify({ message: 'Erro ao buscar afiliado', type: 'error' });
      });
  };

  const debouncedFetchOptions = useCallback(debounce(fetchOptions, 500), []);

  useEffect(() => {
    if (activeCoupon) return;

    if (type) {
      setValue('percentage', 0);
    }
  }, [type]);

  useEffect(() => {
    if (activeCoupon) {
      reset({
        ...activeCoupon,
        affiliate: activeCoupon.affiliate
          ? {
              value: activeCoupon.affiliate.user.id,
              label: `${activeCoupon.affiliate.user.full_name} - ${activeCoupon.affiliate.user.email}`,
            }
          : null,
        percentage: activeCoupon.percentage
          ? activeCoupon.percentage
          : activeCoupon.amount,
        discount_type: activeCoupon.percentage ? 'percentual' : 'fixo',
        expires_at: activeCoupon.expires_at
          ? new Date(activeCoupon.expires_at)
          : null,
        restrict_offers: Boolean(activeCoupon.restrict_offers),
        offers_ids: [],
      });

      if (activeCoupon.affiliate) {
        fetchOptions(activeCoupon.affiliate.user.email);
      }
    } else {
      reset({
        restrict_offers: false,
        offers_ids: [],
      });
    }
  }, [activeCoupon]);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || value === '') return '';
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(value));
    } catch (error) {
      return value;
    }
  }, []);

  const mapOfferToOption = useCallback(
    (offer) => {
      if (!offer || !offer.id) {
        return null;
      }

      const labelName =
        offer.name || offer.title || `Oferta ${offer.id}`;
      const hasPrice = offer.price !== undefined && offer.price !== null;

      return {
        value: offer.id,
        label: hasPrice ? `${labelName} • ${formatCurrency(offer.price)}` : labelName,
        meta: offer,
      };
    },
    [formatCurrency]
  );

  useEffect(() => {
    if (!uuidProduct || !isOpen) return;

    let isMounted = true;
    setLoadingOffers(true);

    api
      .get(`/products/coupons/${uuidProduct}/offers`)
      .then(({ data }) => {
        if (!isMounted) return;

        const uniqueOffers = Array.isArray(data) ? data : [];
        const optionsFromApi = uniqueOffers
          .map(mapOfferToOption)
          .filter(Boolean);

        const dedupedOptions = [];
        const seen = new Set();

        optionsFromApi.forEach((option) => {
          if (!seen.has(option.value)) {
            seen.add(option.value);
            dedupedOptions.push(option);
          }
        });

        setOffers(dedupedOptions);
      })
      .catch(() => {
        if (!isMounted) return;
        notify({
          type: 'error',
          message: 'Erro ao carregar ofertas. Tente novamente.',
        });
      })
      .finally(() => {
        if (!isMounted) return;
        setLoadingOffers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [uuidProduct, isOpen, mapOfferToOption]);

  useEffect(() => {
    if (!restrictOffers) {
      setValue('offers_ids', []);
      clearErrors('offers_ids');
    }
  }, [restrictOffers]);

  useEffect(() => {
    if (!activeCoupon) return;

    const restrict = Boolean(activeCoupon.restrict_offers);
    setValue('restrict_offers', restrict);

    if (!restrict) {
      setValue('offers_ids', []);
      return;
    }

    const couponOffersSource =
      (Array.isArray(activeCoupon.offers) && activeCoupon.offers.length
        ? activeCoupon.offers
        : null) ?? null;

    const couponOffersList =
      couponOffersSource ??
      (Array.isArray(activeCoupon.offers_ids)
        ? activeCoupon.offers_ids
            .filter((id) => id !== null && id !== undefined)
            .map((id) => ({ id }))
        : []);

    if (!couponOffersList.length) {
      setValue('offers_ids', []);
      return;
    }

    const mappedSelected = couponOffersList
      .map((offerItem) =>
        mapOfferToOption({
          ...offerItem,
          name: offerItem.name ?? offerItem.title ?? offerItem.label,
        })
      )
      .filter(Boolean);

    if (!mappedSelected.length) {
      setValue('offers_ids', []);
      return;
    }

    const optionsMap = new Map(
      (offers || []).map((option) => [option.value, option])
    );
    let shouldUpdateOffers = false;

    const normalizedSelected = mappedSelected.map((option) => {
      const existingOption = optionsMap.get(option.value);
      if (existingOption) {
        return existingOption;
      }
      optionsMap.set(option.value, option);
      shouldUpdateOffers = true;
      return option;
    });

    if (shouldUpdateOffers) {
      setOffers(Array.from(optionsMap.values()));
    }

    setValue('offers_ids', normalizedSelected);
  }, [activeCoupon, offers, mapOfferToOption, setValue]);

  return (
    <Modal
      show={isOpen}
      centered
      onHide={() => {
        setIsOpen(false);
      }}
      size='lg'
    >
      <Modal.Header closeButton>
        <Modal.Title className='w-100 text-center color-coupon'>
          {activeCoupon ? 'Editar ' : 'Criar '} cupom
        </Modal.Title>
      </Modal.Header>

      <div>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <div className='form-group'>
                <Controller
                  control={control}
                  name='active'
                  defaultValue={true}
                  render={({ onChange, value }) => (
                    <div className='d-flex align-items-center'>
                      <Switch
                        onChange={onChange}
                        checked={value}
                        checkedIcon={false}
                        uncheckedIcon={false}
                        onColor='#475569'
                        offColor='#e0e0e0'
                        onHandleColor='#fff'
                        boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                        activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                        handleDiameter={24}
                        height={30}
                        width={56}
                        className='react-switch'
                      />
                      <span className='ml-2'>
                        {value ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <div className='form-group'>
                <label className='label-coupon'>Cupom</label>
                <input
                  className={`input-coupon ${
                    errors.coupon ? 'form-control is-invalid' : 'form-control'
                  }`}
                  name='coupon'
                  placeholder='CUPOM'
                  isInvalid={errors.coupon}
                  disabled={!!activeCoupon}
                  ref={register({
                    required: 'Campo obrigatório',
                  })}
                />
                <div className='form-error'>
                  {errors.coupon && <span>{errors.coupon.message}</span>}
                </div>
              </div>
            </Col>

            <Col xs={12} lg={8}>
              <label className='label-coupon' htmlFor='percentage'>
                Desconto
              </label>
              <div className='d-flex align-items-center'>
                <select
                  className='form-control me-2 mr-2 input-coupon'
                  name='discount_type'
                  ref={register()}
                  style={{
                    maxWidth: '150px',
                  }}
                  onChange={() => {
                    setValue('percentage', 0);
                  }}
                >
                  <option value='percentual'>Percentual</option>
                  <option value='fixo'>Fixo</option>
                </select>

                <Controller
                  name='percentage'
                  control={control}
                  defaultValue={
                    activeCoupon
                      ? activeCoupon.percentage ?? activeCoupon.amount
                      : 0
                  }
                  rules={{
                    validate: (value) => {
                      const freeShipping = watch('free_shipping');
                      if (freeShipping) {
                        return true;
                      }

                      const newValue = parseFloat(
                        String(value).replace('R$', '').replace('%', '')
                      );

                      if (isNaN(newValue)) {
                        return 'Campo obrigatório';
                      }

                      if (newValue < 1) {
                        return 'O desconto deve ser maior ou igual a 1%';
                      }

                      if (type === 'fixo') {
                        return true;
                      }

                      if (newValue > 80) {
                        return 'O desconto deve ser menor ou igual a 80%';
                      }

                      return true;
                    },
                  }}
                  render={(field) => (
                    <div className='position-relative w-100'>
                      <CurrencyInput
                        {...field}
                        type='text'
                        className={`input-coupon ${
                          errors.percentage
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }`}
                        selectAllOnFocus
                        allowNegative={false}
                        precision='2'
                        maxLength={type === 'percentual' ? 5 : 20}
                        decimalSeparator=','
                        thousandSeparator='.'
                        prefix={type === 'fixo' ? 'R$ ' : ''}
                        onChangeEvent={(e, _masked, floatValue) =>
                          setValue('percentage', floatValue)
                        }
                      />

                      {type === 'percentual' && (
                        <span className='percentual-symbol'>%</span>
                      )}
                    </div>
                  )}
                />
              </div>
              <div className='form-error'>
                {errors.percentage && <span>{errors.percentage.message}</span>}
              </div>
            </Col>
          </Row>

          <Row className='mt-3 mt-lg-0'>
            <Col>
              <div className='form-group'>
                <label className='label-coupon'>Data de Expiração</label>

                <Controller
                  control={control}
                  name='expires_at'
                  defaultValue={null}
                  rules={{
                    required: 'Campo obrigatório',
                    validate: (value) => {
                      if (!value) return 'Campo obrigatório';
                      const now = new Date();
                      if (value < now)
                        return 'A data de expiração deve ser futura';
                      return true;
                    },
                  }}
                  render={({ onChange, value }) => (
                    <div>
                      <DatePicker
                        wrapperClassName='datePicker'
                        selected={value}
                        onChange={onChange}
                        locale='pt-BR'
                        showTimeSelect
                        timeFormat='p'
                        timeIntervals={60}
                        dateFormat='Pp'
                        timeCaption='Hora'
                        className={`form-control input-coupon ${
                          errors.expires_at ? 'is-invalid' : ''
                        }`}
                        placeholderText='06/02/1994 03:00'
                      />
                      {errors.expires_at && (
                        <div className='form-error'>
                          <span>{errors.expires_at.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </Col>
          </Row>

          <Row className='mt-3'>
            <Col>
              <div className='form-group'>
                <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between'>
                  <label className='label-coupon mb-2 mb-md-0'>
                    Restringir a ofertas específicas
                  </label>
                  <Controller
                    control={control}
                    name='restrict_offers'
                    defaultValue={false}
                    render={({ onChange, value }) => (
                      <div className='d-flex align-items-center'>
                        <Switch
                          onChange={(checked) => onChange(checked)}
                          checked={Boolean(value)}
                          checkedIcon={false}
                          uncheckedIcon={false}
                          onColor='#475569'
                          offColor='#e0e0e0'
                          onHandleColor='#fff'
                          boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                          activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                          handleDiameter={24}
                          height={30}
                          width={56}
                          className='react-switch'
                        />
                        <span className='ml-2'>
                          {value
                            ? 'Cupom restrito a ofertas selecionadas'
                            : 'Cupom válido para todas as ofertas'}
                        </span>
                      </div>
                    )}
                  />
                </div>

                {restrictOffers && (
                  <>
                    <Controller
                      control={control}
                      name='offers_ids'
                      defaultValue={[]}
                      rules={{
                        validate: (value) => {
                          if (!restrictOffers) return true;
                          if (!value || value.length === 0) {
                            return 'Selecione ao menos uma oferta';
                          }
                          return true;
                        },
                      }}
                      render={({ onChange, value, ref }) => (
                        <Select
                          value={value || []}
                          inputRef={ref}
                          placeholder={
                            loadingOffers
                              ? 'Carregando ofertas...'
                              : 'Selecione as ofertas'
                          }
                          isMulti
                          isClearable
                          isLoading={loadingOffers}
                          options={offers}
                          noOptionsMessage={() =>
                            loadingOffers
                              ? 'Carregando...'
                              : 'Nenhuma oferta encontrada'
                          }
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              borderRadius: '20px',
                              padding: state.isMulti ? '4px 8px' : '0px 20px 0px 8px',
                            }),
                            placeholder: (provided) => ({
                              ...provided,
                              color: '#7e7e81',
                              fontSize: '14px',
                            }),
                          }}
                          className='mt-3'
                          onChange={(selected) => {
                            onChange(selected || []);
                            if (selected && selected.length > 0) {
                              clearErrors('offers_ids');
                            }
                          }}
                        />
                      )}
                    />
                    <div className='form-error'>
                      {errors.offers_ids && (
                        <span>{errors.offers_ids.message}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>

          <div className='mt-3'>
            <a
              href='#!'
              onClick={(e) => {
                e.preventDefault();
                setShow(!show);
              }}
              className='d-flex align-items-center more-options-coupon'
              style={{ cursor: 'pointer' }}
            >
              {show ? 'Ocultar opções avançadas' : 'Exibir opções avançadas'}

              <i
                className={`bx ${
                  show ? 'bx-chevron-up' : 'bx-chevron-down'
                } me-2`}
                style={{ fontSize: '1.2rem' }}
              ></i>
            </a>

            <Collapse in={show}>
              <div>
                <Row className='mt-3'>
                  <Col lg={6}>
                    <label className='label-coupon' htmlFor='min_amount'>
                      Definir valor mínimo para compra
                    </label>
                    <div className='d-flex align-items-center'>
                      <Controller
                        as={CurrencyInput}
                        defaultValue={'0'}
                        control={control}
                        type='text'
                        name='min_amount'
                        selectAllOnFocus
                        ref={register()}
                        className='form-control input-coupon'
                        precision='2'
                        decimalSeparator=','
                        thousandSeparator='.'
                        maxLength='10'
                      />
                    </div>
                  </Col>

                  <Col lg={6} className='mt-3 mt-lg-0'>
                    <label className='label-coupon' htmlFor='min_items'>
                      Definir quantidade mínima de produtos
                    </label>
                    <div className='d-flex align-items-center'>
                      <Controller
                        as={CurrencyInput}
                        defaultValue={0}
                        control={control}
                        type='text'
                        name='min_items'
                        selectAllOnFocus
                        ref={register()}
                        className='form-control input-coupon'
                        precision='0'
                        maxLength='2'
                      />
                    </div>
                  </Col>
                </Row>

                <Row className='mt-3'>
                  <Col md={12}>
                    <label className='label-coupon'>Métodos de pagamento</label>
                    <select
                      className='form-control input-coupon'
                      name='payment_methods'
                      defaultValue='card,billet,pix'
                      ref={register()}
                    >
                      <option value='card,billet,pix'>
                        Cartão de crédito, boleto e Pix
                      </option>
                      <option value='card,billet'>
                        Cartão de crédito e boleto
                      </option>
                      <option value='card,pix'>Cartão de crédito e Pix</option>
                      <option value='billet,pix'>Boleto e Pix</option>
                      <option value='card'>Somente Cartão de crédito</option>
                      <option value='billet'>Somente Boleto</option>
                      <option value='pix'>Somente Pix</option>
                    </select>
                  </Col>
                </Row>

                <Row className='mt-3'>
                  <Col md={12}>
                    <label className='label-coupon'>Atribuir Afiliado</label>
                    <Controller
                      name='affiliate'
                      control={control}
                      render={({ onChange, ref, value }) => {
                        return (
                          <Select
                            value={value}
                            inputRef={ref}
                            placeholder='Digite o email...'
                            noOptionsMessage={() => '0 resultados'}
                            isMulti={false}
                            options={options}
                            isClearable
                            styles={{
                              control: (provided) => ({
                                ...provided,
                                borderRadius: '20px',
                                padding: '0px 20px 0px 8px !important',
                              }),
                              placeholder: (provided) => ({
                                ...provided,
                                color: '#7e7e81',
                                fontSize: '14px',
                              }),
                            }}
                            onInputChange={(input) => {
                              debouncedFetchOptions(input);
                            }}
                            onChange={(val) => {
                              onChange(val ? val : null);
                            }}
                          />
                        );
                      }}
                    />
                  </Col>
                </Row>

                <Row className='form-group d-flex flex-wrap align-items-start mt-4 mb-0'>
                  <Col
                    xs={12}
                    lg={6}
                    className='d-flex align-items-center mb-3 w-50'
                  >
                    <Controller
                      control={control}
                      name='first_sale_only'
                      defaultValue={false}
                      render={({ onChange, value }) => (
                        <>
                          <Switch
                            onChange={onChange}
                            checked={value}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            onColor='#475569'
                            offColor='#e0e0e0'
                            onHandleColor='#fff'
                            boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                            activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                            handleDiameter={24}
                            height={30}
                            width={56}
                            className='react-switch'
                          />
                          <span className='ml-2'>Cupom de 1ª compra</span>
                        </>
                      )}
                    />
                  </Col>

                  <Col
                    xs={12}
                    lg={6}
                    className='d-flex align-items-center mb-3 w-50'
                  >
                    <Controller
                      control={control}
                      name='override_cookie'
                      defaultValue={false}
                      render={({ onChange, value }) => (
                        <>
                          <Switch
                            onChange={onChange}
                            checked={value}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            onColor='#475569'
                            offColor='#e0e0e0'
                            onHandleColor='#fff'
                            boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                            activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                            handleDiameter={24}
                            height={30}
                            width={56}
                            className='react-switch'
                          />
                          <span className='ml-2'>Sobrepor o cookie</span>
                        </>
                      )}
                    />
                  </Col>

                  <Col
                    xs={12}
                    lg={6}
                    className='d-flex align-items-center mb-3 w-50'
                  >
                    <Controller
                      control={control}
                      name='enable_for_affiliates'
                      defaultValue={false}
                      render={({ onChange, value }) => (
                        <>
                          <Switch
                            onChange={onChange}
                            checked={value}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            onColor='#475569'
                            offColor='#e0e0e0'
                            onHandleColor='#fff'
                            boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                            activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                            handleDiameter={24}
                            height={30}
                            width={56}
                            className='react-switch'
                          />
                          <span className='ml-2'>
                            Criação de cupom pelo afiliado
                          </span>
                        </>
                      )}
                    />
                  </Col>

                  <Col
                    xs={12}
                    lg={6}
                    className='d-flex align-items-center mb-3 w-50'
                  >
                    <Controller
                      control={control}
                      name='single_use_by_client'
                      defaultValue={false}
                      render={({ onChange, value }) => (
                        <>
                          <Switch
                            onChange={onChange}
                            checked={value}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            onColor='#475569'
                            offColor='#e0e0e0'
                            onHandleColor='#fff'
                            boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                            activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                            handleDiameter={24}
                            height={30}
                            width={56}
                            className='react-switch'
                          />
                          <span className='ml-2'>Uso único por cliente</span>
                        </>
                      )}
                    />
                  </Col>

                  {product.payment_type === 'subscription' && (
                    <Col
                      xs={12}
                      lg={6}
                      className='d-flex align-items-center mb-3 w-50'
                    >
                      <Controller
                        control={control}
                        name='apply_on_every_charge'
                        defaultValue={false}
                        render={({ onChange, value }) => (
                          <>
                            <Switch
                              onChange={onChange}
                              checked={value}
                              checkedIcon={false}
                              uncheckedIcon={false}
                              onColor='#475569'
                              offColor='#e0e0e0'
                              onHandleColor='#fff'
                              boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                              activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                              handleDiameter={24}
                              height={30}
                              width={56}
                              className='react-switch'
                            />
                            <span className='ml-2'>
                              Aplicar em todas as cobranças
                            </span>
                          </>
                        )}
                      />
                    </Col>
                  )}

                  {product.type === 'physical' && (
                    <Col
                      xs={12}
                      lg={6}
                      className='d-flex align-items-center mb-3 w-50'
                    >
                      <Controller
                        control={control}
                        name='free_shipping'
                        defaultValue={false}
                        render={({ onChange, value }) => (
                          <>
                            <Switch
                              onChange={onChange}
                              checked={value}
                              checkedIcon={false}
                              uncheckedIcon={false}
                              onColor='#475569'
                              offColor='#e0e0e0'
                              onHandleColor='#fff'
                              boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                              activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                              handleDiameter={24}
                              height={30}
                              width={56}
                              className='react-switch'
                            />
                            <span className='ml-2'>
                              Aplicar cupom de frete grátis
                            </span>
                          </>
                        )}
                      />
                    </Col>
                  )}
                </Row>
              </div>
            </Collapse>
          </div>
        </Modal.Body>

        <Modal.Footer style={{ background: 'transparent' }}>
          {activeCoupon ? (
            <Button
              size='sm'
              variant='danger'
              disabled={requesting}
              onClick={() => {
                setActiveCoupon(activeCoupon);
                setModalCancelShow(true);
              }}
              style={{
                minWidth: '130px',
                borderRadius: '20px',
              }}
            >
              {requesting === 'delete' ? 'excluindo...' : 'Excluir'}
            </Button>
          ) : (
            <div></div>
          )}

          <div className='d-flex'>
            <Button
              size='sm'
              onClick={handleSubmit(onSubmit)}
              disabled={requesting === 'put' || requesting === 'post'}
              variant='success'
              style={{
                minWidth: '130px',
                borderRadius: '20px',
              }}
            >
              <span>
                {requesting === 'put' || requesting === 'post'
                  ? 'salvando...'
                  : 'Salvar'}
              </span>
            </Button>
          </div>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default ModalCoupon;

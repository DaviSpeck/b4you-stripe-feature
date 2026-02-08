import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../../modules/functions';
import { Spinner } from 'react-bootstrap';
import { MdClose } from 'react-icons/md';
import './style.scss';
import { BsPlusCircle } from 'react-icons/bs';

export const OfferListOptions = (props) => {
  const [offerOptions, setOfferOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    offers,
    form,
    value,
    productId,
    onRemove,
    isFetching = false,
    disabled = false,
    isMultiOffers,
    offerList,
    onChange,
  } = props;

  const getOfferListOptions = async () => {
    try {
      setIsLoading(true);

      const res = await api.get(`/products/offers/${productId}`);

      const options = res.data.rows
        .map((data) => ({
          id: data.uuid,
          label: data.name,
          type: data.type,
        }))
        .filter((option) => option.type !== 'physical');

      if (!options.some((option) => form.watch().upsellOfferId === option.id)) {
        form.setValue('upsellOfferId', null);
      }

      setOfferOptions(options);
    } catch (error) {
      notify({
        message:
          'Não foi possível buscar as ofertas. Tente novamente mais tarde.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!productId || isMultiOffers) return;
    getOfferListOptions();
  }, [productId]);

  useEffect(() => {
    if (!isMultiOffers) return;
    offerList.length > 0 && setOfferOptions(offerList);
  }, [isMultiOffers, offerList]);

  return (
    <div className='wrapper-select-offer'>
      <>
        {(isLoading || isFetching) && (
          <div className='input-loding'>
            <span>Buscando ofertas…</span>
            <Spinner variant='light' size='sm' animation='border' />
          </div>
        )}
      </>
      {!isLoading && !isFetching && offerOptions.length === 0 && (
        <div className='input-loding'>
          <span>Nenhuma oferta encontrada</span>
        </div>
      )}
      {!isLoading && !isFetching && offerOptions.length > 0 && (
        <select
          className='select-offers-upsell'
          id={'select-accept-action'}
          name='upsellOfferId'
          disabled={disabled}
          {...(!form && {
            value,
            onChange,
            style: {
              borderRadius:
                offers.length === 1 || disabled
                  ? '20px 20px 20px 20px'
                  : '20px 0px 0px 20px',
            },
          })}
          {...(form && { ...form.register('upsellOfferId') })}
        >
          <option key={'default'} value={''}>
            Selecione uma oferta
          </option>
          {offerOptions.map((data) => {
            return (
              <option key={data.id} value={data.id}>
                {data.label}
              </option>
            );
          })}
        </select>
      )}
      {!form &&
        offers.length >= 2 &&
        !isLoading &&
        !isFetching &&
        !disabled && (
          <button type='button' className='btn-remove-offer' onClick={onRemove}>
            <MdClose size={23} />
          </button>
        )}
    </div>
  );
};

// eslint-disable-next-line react/display-name
OfferListOptions.MultiOffers = function (props) {
  const [offresData, setOffersData] = useState([]);
  const [offerOptions, setOfferOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { form, isActive } = props;

  const productId = form.watch('upsellProductId');
  const offers = form.watch('offers');

  const getOfferListOptions = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.get(
        `/products/${productId}/upsell-native-offer-list`
      );

      const options = data.map((data) => {
        // eslint-disable-next-line no-extra-boolean-cast
        const offerTitle = Boolean(data.alternative_name)
          ? data.alternative_name
          : data.name;

        return { id: data.uuid, label: offerTitle };
      });

      setOffersData(data);
      setOfferOptions(options);
    } catch (error) {
      notify({
        message:
          'Não foi possível buscar as ofertas. Tente novamente mais tarde.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUpsellOffer = () => {
    if (offers.length < 3) {
      form.setValue('offers', [...offers, ''], { shouldValidate: true });
    }
  };

  const handleChangeUpsellOffer = (e, index) => {
    const offerArr = [...offers];
    const newOfferUuid = e.target.value;

    const findOfferData = offresData.find(
      (offer) => offer.uuid === newOfferUuid
    );

    offerArr.splice(index, 1, findOfferData);
    form.setValue('offers', offerArr, { shouldValidate: true });
  };

  const handleRemoveUpsellOffer = (index) => {
    const offerArr = [...offers];
    offerArr.splice(index, 1);
    form.setValue('offers', offerArr, { shouldValidate: true });
  };

  useEffect(() => {
    if (!productId) return;
    getOfferListOptions();
  }, [productId]);

  return (
    <>
      <div className='wrapper-many-offers'>
        {(offers.length === 0 ? [''] : offers).map((value, index) => {
          return (
            <OfferListOptions.InputWraper
              key={index}
              label={`Selecionar oferta ${index + 1}`}
            >
              <OfferListOptions
                offers={offers}
                value={value.uuid}
                productId={productId}
                offerList={offerOptions}
                isFetching={isLoading}
                isMultiOffers
                disabled={!isActive}
                onChange={(e) => handleChangeUpsellOffer(e, index)}
                onRemove={() => handleRemoveUpsellOffer(index)}
              />
              <OfferListOptions.FieldError
                message={!offers[index] && 'Campo obrigatório'}
              />
            </OfferListOptions.InputWraper>
          );
        })}
      </div>
      {offers.length < 3 && isActive && (
        <button
          type='button'
          className='btn-add-offer'
          onClick={handleAddUpsellOffer}
        >
          <BsPlusCircle className='icon-btn' />
          Adicionar oferta
        </button>
      )}
    </>
  );
};

// eslint-disable-next-line react/display-name
OfferListOptions.InputWraper = function (props) {
  const { label, children } = props;
  return (
    <div className='input-native-upsell'>
      <label>{label}</label>
      {children}
    </div>
  );
};

// eslint-disable-next-line react/display-name
OfferListOptions.FieldError = function (props) {
  const { message } = props;

  if (!message || (message && message.length === 0)) return <></>;

  return (
    <div className='form-error' id='cep_help'>
      <span>{message}</span>
    </div>
  );
};

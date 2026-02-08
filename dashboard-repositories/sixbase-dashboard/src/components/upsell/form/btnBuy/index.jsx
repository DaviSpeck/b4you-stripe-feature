import { GoDotFill } from 'react-icons/go';
import { useEffect, useState } from 'react';

import { OfferListOptions } from '../../upsellOffer';
import { SwitchInput } from '../../switch';
import { InputSize } from '../../inputSize';
import { InputColor } from '../../inputColor';
import { InputText } from '../../inputText';
import './style.scss';
import { UpsellProducts } from '../../upsellProducts';

export const BtnBuyConfigs = (props) => {
  const [productSelectedData, setProductSelectedData] = useState(null);

  const { form, isActive, onChangeProduct } = props;

  const isMultiOffer = form.watch('isMultiOffer');
  const productId = form.watch('upsellProductId');

  useEffect(() => {
    if (!productSelectedData) return;

    if (productSelectedData.paymentType === 'subscription') {
      form.setValue('isMultiOffer', false);
      onChangeProduct(productSelectedData);
    }
  }, [productSelectedData]);

  return (
    <>
      <div className='container-inputs-buy'>
        <div className='wrapper-header'>
          <GoDotFill />
          <h3>Configuração de botão de compra</h3>
        </div>
        <div className='wrapper-inputs'>
          <InputText
            form={form}
            label='Texto do botão de aceitar Upsell'
            isActive={isActive}
            name='btnTextAccept'
            placeholder='Sim, eu aceito essa oferta especial!'
          />
          <BtnBuyConfigs.InputWraper label='Selecionar Produto'>
            <UpsellProducts
              form={form}
              disabled={!isActive}
              onProductSelected={(product) => setProductSelectedData(product)}
            />
            <BtnBuyConfigs.FieldError
              message={form.formState.errors?.upsellProductId?.message}
            />
          </BtnBuyConfigs.InputWraper>
          {form.watch('upsellProductId') && !isMultiOffer && (
            <BtnBuyConfigs.InputWraper label='Selecionar Oferta'>
              <OfferListOptions
                form={form}
                productId={productId}
                disabled={!isActive}
                value={form.watch('upsellOfferId')}
              />
              <BtnBuyConfigs.FieldError
                message={form.formState.errors?.upsellOfferId?.message}
              />
            </BtnBuyConfigs.InputWraper>
          )}
          {form.watch('upsellProductId') && isMultiOffer && (
            <OfferListOptions.MultiOffers form={form} isActive={isActive} />
          )}
          {productSelectedData?.paymentType !== 'subscription' && isActive && (
            <SwitchInput
              form={form}
              label='Multiplas ofertas'
              name='isMultiOffer'
              disabled={!isActive}
              style={{
                alignItems: 'flex-start',
                height: 'fit-content',
              }}
            />
          )}
        </div>
        <div className='wrapper-btn'>
          <InputSize
            label='Tamnho do texto'
            name='btnTextAcceptSize'
            form={form}
            isActive={isActive}
          />
          <InputColor
            label='Cor do botão'
            form={form}
            isActive={isActive}
            name='btnColorAccept'
          />
          <InputColor
            label='Cor do texto do botão'
            form={form}
            isActive={isActive}
            name='btnTextColorAccept'
          />
          <SwitchInput
            form={form}
            label='One Click'
            name='isOneClick'
            isActive={isActive}
          />
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line react/display-name
BtnBuyConfigs.InputWraper = function (props) {
  const { label, children } = props;
  return (
    <div className='input-native-upsell'>
      <label>{label}</label>
      {children}
    </div>
  );
};

// eslint-disable-next-line react/display-name
BtnBuyConfigs.FieldError = function (props) {
  const { message } = props;

  if (!message || (message && message.length === 0)) return <></>;

  return (
    <div className='form-error' id='cep_help'>
      <span>{message}</span>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form7';
import { Spinner } from 'react-bootstrap';
import { yupResolver } from '@hookform/resolvers/yup';
import { upsellConfigSchema } from './schema';
import { notify } from '../../../../../functions';
import { FormUpsellNativeConfig } from '../../../../../../components/upsell';
import api from '../../../../../../providers/api';

import './style.scss';
import { StyleView } from '../style-view';

export const Configs = (props) => {
  const [upsellProductData, setUpsellProductData] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { isLoading, isUpsellProduct } = props;

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(upsellConfigSchema),
    defaultValues: {
      isActive: false,
      upsellProductId: null,
      upsellOfferId: null,
      creationOrigin: 'self',

      stepColorBackground: '#f6f6f6ff',
      stepColor: '#0f1b35',
      isStepVisible: true,

      header: 'Não saia desta página sem conferir esta oferta imperdível!',
      headerBackgroundColor: '#0f1b35',
      headerTextColor: '#ffffffff',
      isHeaderVisible: true,

      alertNotClosePrimaryColor: '#0f1b35',
      alertNotClosePrimaryTextColor: '#f1f1f1',
      isMessageNotClose: false,

      titleimage: null,
      title: 'Título da oferta',
      titleSize: 24,
      titleColor: '#0f1b35',
      subtitleOne: '',
      subtitleOneWeight: 400,
      subtitleOneSize: 24,
      subtitleOneColor: '#0f1b35',
      subtitleTwo: '',
      subtitleTwoWeight: 400,
      subtitleTwoSize: 24,
      subtitleTwoColor: '#0f1b35',

      btnTextAcceptSize: 16,
      btnTextAccept: 'Aproveitar Oferta',
      btnColorAccept: '#0f1b35',
      btnTextColorAccept: '#f6f6f6ff',
      isOneClick: true,
      isEmbedVideo: false,
      isMultiOffer: false,
      offers: [''],

      btnTextRefuse: 'Não, eu gostaria de recusar essa oferta',
      btnTextColorRefuse: '#0f1b35',
      btnTextRefuseSize: 16,

      backgroundImageDesktop: null,
      backgroundImageMobile: null,
      mediaUrl: null,
      mediaEmbed: null,
      background: '#fcfcfc',
      isActiveMessage: true,
      isFooterVisible: true,
    },
  });

  const searchParams = new URLSearchParams(window.location.search);

  const offerId = searchParams.get('offerId');
  const disabled = form.watch('creationOrigin') === 'product';

  const getUpsellConfig = async () => {
    try {
      setIsInitialLoading(true);

      const { data } = await api.get(
        `/upsell-native-offer/${searchParams.get('offerId')}`
      );

      Object.entries(data).forEach(([key, value]) => {
        form.setValue(key, value, { shouldValidate: true });
      });
    } catch (error) {
      return error;
    } finally {
      setIsInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const offersPayload = data.isMultiOffer
      ? (data.offers || [])
          .filter((offer) => offer && offer.uuid)
          .map((offer) => offer.uuid)
      : [];

    try {
      await api.patch(`/upsell-native-offer/${searchParams.get('offerId')}`, {
        offer_id: searchParams.get('offerId'),
        ...data,
        offers: offersPayload,
      });
      notify({ message: 'Coniguração salva com sucesso!', type: 'success' });
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    getUpsellConfig();
  }, []);

  if (isInitialLoading || isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner variant='light' size='lg' animation='border' />
      </div>
    );
  }

  return (
    <div className='wrapper-form'>
      {isUpsellProduct && (
        <div className='upsell-info-banner'>
          Este upsell está sendo herdado do produto. As ofertas herdam a mesma
          configuração enquanto o upsell do produto estiver ativo.
        </div>
      )}
      <FormUpsellNativeConfig
        form={form}
        isActive={!disabled}
        handlerOnSubmit={onSubmit}
        onChangeProduct={(product) => {
          setUpsellProductData(product);
        }}
        imageBackgroundImageDesktop={{
          upload: `/upsell-native-offer/${offerId}/image-background-image-desktop`,
          remove: `/upsell-native-offer/${offerId}/image-background-image-desktop`,
        }}
        imageBackgroundImageMobile={{
          upload: `/upsell-native-offer/${offerId}/image-background-image-mobile`,
          remove: `/upsell-native-offer/${offerId}/image-background-image-mobile`,
        }}
        imageTitleUrls={{
          upload: `/upsell-native-offer/${offerId}/title-image`,
          remove: `/upsell-native-offer/${offerId}/title-image`,
        }}
        imageUrls={{
          upload: `/upsell-native-offer/${offerId}/image`,
          remove: `/upsell-native-offer/${offerId}/image`,
        }}
        embedUrls={{
          upload: `/upsell-native-offer/${offerId}/embed`,
          remove: `/upsell-native-offer/${offerId}/embed`,
        }}
      />
      <StyleView data={form.watch()} productData={upsellProductData} />
    </div>
  );
};

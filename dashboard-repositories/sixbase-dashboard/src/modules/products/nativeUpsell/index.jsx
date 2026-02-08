import './style.scss';
import { StyleView } from './style-view';
import { LuFileText } from 'react-icons/lu';
import { Configs } from './config';
import { useState } from 'react';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { Spinner } from 'react-bootstrap';
import api from '../../../providers/api';
import { notify } from '../../functions';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form7';
import { schemaConfig } from './config/schema';
import { yupResolver } from '@hookform/resolvers/yup';

export const PageNativeUpsell = () => {
  const location = useLocation();
  const productId = location.pathname.split('/')[3];

  const [upsellProductData, setUpsellProductData] = useState(null);

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(schemaConfig, { abortEarly: false }),
    defaultValues: {
      isActive: false,
      upsellProductId: null,
      upsellOfferId: null,
      plan: '',

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

  const refetchUpsell = async () => {
    const res = await api.get(`/upsell-native-product/${productId}`);
    Object.entries(res.data).forEach(([key, value]) => {
      form.setValue(key, value ?? '');
    });
  };

  return (
    <div className='wrapper-upsell'>
      <div className='wrapper-header-edit'>
        <PageNativeUpsell.Header isActive={form.watch().isActive} />
      </div>
      <div className='wrapper-btn-config-style-view'>
        <Configs
          form={form}
          btnActiveInactive={<PageNativeUpsell.Inactive form={form} refetchUpsell={refetchUpsell} />}
          onChangeProduct={(product) => {
            setUpsellProductData(product);
          }}
          productId={productId}
        />
        <StyleView data={form.watch()} productData={upsellProductData} />
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
PageNativeUpsell.Header = function () {
  return (
    <header className='header-page'>
      <div>
        <LuFileText size={24} />
        <h1>Editor</h1>
      </div>
    </header>
  );
};

// eslint-disable-next-line react/display-name
PageNativeUpsell.Inactive = function (props) {
  const [isLoading, setIsLoading] = useState(false);

  const { form, refetchUpsell } = props;

  const productId = useLocation().pathname.split('/')[3];

  const isActive = form.watch('isActive');

  const handleInactive = async () => {
    try {
      setIsLoading(true);

      await api.delete(`/upsell-native-product/${productId}/inactive`, {
        data: { isActive: false },
      });
      await refetchUpsell();

      notify({
        message: `Upsell ${!isActive ? 'ativo' : 'inativo'} com sucesso`,
        type: 'success',
      });
    } catch (error) {
      notify({
        message: `Não foi possível ${isActive ? 'inativar' : 'ativar'
          }. Tente novamente.`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '24px' }}>
      <ButtonDS
        size={'sm'}
        type='button'
        variant='primary'
        disabled={isLoading}
        onClick={handleInactive}
      >
        <span style={{ paddingRight: '8px' }}>Inativar Upsell</span>
        {isLoading && <Spinner variant='light' size='sm' animation='border' />}
      </ButtonDS>
    </div>
  );
};

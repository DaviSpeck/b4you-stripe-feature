import './style.scss';
import { useEffect, useState } from 'react';
import api from '../../../../providers/api';
import { Spinner } from 'react-bootstrap';
import { notify } from '../../../functions';
import { FormUpsellNativeConfig } from '../../../../components/upsell';

export const Configs = (props) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { form, btnActiveInactive, onChangeProduct, productId } = props;

  const refetchUpsell = async () => {
    const res = await api.get(`/upsell-native-product/${productId}`);
    Object.entries(res.data).forEach(([key, value]) => {
      form.setValue(key, value ?? '');
    });
  };

  const onSubmit = async (data) => {
    const offersPayload = data.isMultiOffer
      ? (data.offers || [])
          .filter((offer) => offer && offer.uuid)
          .map((offer) => offer.uuid)
      : [];

    try {
      await api.patch(`/upsell-native-product/${productId}`, {
        ...data,
        product_id: productId,
        offers: offersPayload,
      });
      await refetchUpsell();
      notify({
        message: 'Upsell atualizado com sucesso!',
        type: 'success',
      });
    } catch (error) {
      notify({
        message: error.response.data.message,
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (!productId || !isInitialLoading) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/upsell-native-product/${productId}`);

        if (!res.data) return;

        Object.entries(res.data).forEach(([key, value]) => {
          form.setValue(key, value ?? '', { shouldValidate: true });
        });
      } catch (error) {
        return error;
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetch();
  }, []);

  const isActive = form.watch('isActive');

  if (isInitialLoading) {
    return (
      <div className='loading-upsell-product'>
        <Spinner animation='border' role='status' size='md' />
      </div>
    );
  }

  if (!isActive) {
    return <Configs.ActiveUpsell form={form} refetchUpsell={refetchUpsell} productId={productId} />;
  }

  return (
    <div className='wrapper-form-upsell-native'>
      <FormUpsellNativeConfig
        form={form}
        isActive={isActive}
        handlerOnSubmit={onSubmit}
        buttonDelete={btnActiveInactive}
        onChangeProduct={onChangeProduct}
        imageBackgroundImageDesktop={{
          upload: `/upsell-native-product/${productId}/image-background-image-desktop`,
          remove: `/upsell-native-product/${productId}/image-background-image-desktop`,
        }}
        imageBackgroundImageMobile={{
          upload: `/upsell-native-product/${productId}/image-background-image-mobile`,
          remove: `/upsell-native-product/${productId}/image-background-image-mobile`,
        }}
        imageTitleUrls={{
          upload: `/upsell-native-product/${productId}/title-image`,
          remove: `/upsell-native-product/${productId}/title-image`,
        }}
        imageUrls={{
          upload: `/upsell-native-product/${productId}/image`,
          remove: `/upsell-native-product/${productId}/image`,
        }}
        embedUrls={{
          upload: `/upsell-native-product/${productId}/embed`,
          remove: `/upsell-native-product/${productId}/embed`,
        }}
      />
    </div>
  );
};

// eslint-disable-next-line react/display-name
Configs.ActiveUpsell = function (props) {
  const [isLoading, setIsLoading] = useState(false);

  const { form, refetchUpsell, productId } = props;

  const isActive = form.watch('isActive');

  const onActive = async () => {
    try {
      setIsLoading(true);

      await api.post(`/upsell-native-product/${productId}/create`);
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
    <div className='wrapper-active-upsell'>
      <h1>Ative o upsell e aumente seus resultados!</h1>
      <div className='wrapper-text'>
        <p className='first-text'>
          O upsell permite oferecer produtos ou serviços complementares após uma
          compra, aumentando o valor médio dos pedidos de forma simples e
          automática. Ao ativar essa opção, você pode apresentar ofertas
          relacionadas ou versões aprimoradas do produto principal, melhorando a
          experiência do cliente e otimizando seus resultados.
        </p>
        <p className='second-text'>
          <span>Obs:</span> Ao ativar o upsell, esta configuração será aplicada
          a todas as ofertas deste produto.
        </p>
      </div>
      <button onClick={onActive} disabled={isLoading}>
        Ativar upsell
        {isLoading && <Spinner variant='light' size='sm' animation='border' />}
      </button>
    </div>
  );
};

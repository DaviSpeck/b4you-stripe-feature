import { useEffect, useState } from 'react';
import logoB4y from '../../../../images/logo-horizontal-header-dark-small.svg';
import './style.scss';
import { NativeUpsell } from './native-upsell';
import { ExternalUpsell } from './external-upsell';
import api from '../../../../providers/api';
import { notify } from '../../../functions';
import { Spinner } from 'react-bootstrap';
import { useUser } from '../../../../providers/contextUser';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';

export const Upsells = ({ uuidProduct, offer }) => {
  const { user } = useUser();
  const isNativeAllowed = Boolean(user?.upsell_native_enabled);

  const [upsellData, setUpsellData] = useState(null);
  const [isUpsellEnabledUI, setIsUpsellEnabledUI] = useState(false);
  const [typeSelected, setTypeSelected] = useState(null);
  const [isUpsellProduct, setIsUpsellProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = new URLSearchParams(window.location.search);
  const offerId = searchParams.get('offerId');

  const handleCreateUpsell = async () => {
    try {
      setIsLoading(true);

      const { data } = await api.post(
        `/upsell-native-offer/${offerId}/create`
      );

      setUpsellData(data);
      setTypeSelected('NATIVE');
      setIsUpsellEnabledUI(true);
    } catch (error) {
      notify({
        message: 'Erro ao criar upsell nativo',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkUpsellType = async () => {
    try {
      const { data } = await api.get(
        `/upsell-native-offer/${offerId}/check`
      );

      const { isUpsellNativeOffer, isUpsellProduct, isUpsell } = data;

      if (isUpsellNativeOffer || isUpsellProduct) {
        setTypeSelected('NATIVE');
        setIsUpsellProduct(!!isUpsellProduct);
        setIsUpsellEnabledUI(true);
        return;
      }

      if (isUpsell) {
        setTypeSelected('EXTERNAL');
        setIsUpsellEnabledUI(true);
        setIsUpsellProduct(false);
        return;
      }

      setIsUpsellEnabledUI(false);
      setIsUpsellProduct(false);
    } catch (error) {
      if (error?.response?.status !== 404) {
        notify({
          message: 'Erro ao verificar tipo de upsell',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNativeUpsell = async () => {
    try {
      const { data } = await api.get(
        `/upsell-native-offer/${offerId}`
      );
      setUpsellData(data);
    } catch (error) {
      if (error?.response?.status !== 404) {
        notify({
          message: 'Erro ao carregar dados do upsell',
          type: 'error',
        });
      }
    }
  };

  useEffect(() => {
    checkUpsellType();
  }, []);

  useEffect(() => {
    if (typeSelected === 'NATIVE') {
      fetchNativeUpsell();
    }
  }, [typeSelected]);

  useEffect(() => {
    if (!offer) return;

    if (offer.is_upsell_native) {
      setTypeSelected('NATIVE');
      setIsUpsellEnabledUI(true);
      return;
    }

    if (offer.thankyou_page_upsell) {
      setTypeSelected('EXTERNAL');
      setIsUpsellEnabledUI(true);
    }
  }, [offer]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner variant='light' size='lg' animation='border' />
      </div>
    );
  }

  if (!isUpsellEnabledUI && !upsellData?.is_upsell_active) {
    return (
      <Upsells.InactiveMessage
        onActive={() => {
          setIsUpsellEnabledUI(true);
          setTypeSelected(null);
        }}
      />
    );
  }

  if (isUpsellEnabledUI && !typeSelected) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          paddingTop: 0,
        }}
      >
        {isNativeAllowed && (
          <>
            <Upsells.UpsellOptionCard
              title='Upsell Nativo'
              text='O Upsell Nativo da B4Y é executado 100% dentro da infraestrutura da plataforma.'
              isTag
              onSelect={handleCreateUpsell}
            />

            {isUpsellProduct && (
              <Upsells.UpsellOptionCard
                title='Upsell Nativo do produto'
                text='As configurações do upsell nativo serão herdadas do produto.'
                isTag
                onSelect={() => {
                  setTypeSelected('NATIVE');
                  setUpsellData(null);
                }}
              />
            )}
          </>
        )}

        <Upsells.UpsellOptionCard
          title='Upsell Externo'
          text='Utilize sua própria página externa para realizar o upsell.'
          onSelect={() => setTypeSelected('EXTERNAL')}
        />
      </div>
    );
  }

  return (
    <Upsells.UpsellType
      type={typeSelected}
      offer={offer}
      upsellData={upsellData}
      uuidProduct={uuidProduct}
      isNativeAllowed={isNativeAllowed}
      onBack={() => setTypeSelected(null)}
    />
  );
};

// eslint-disable-next-line react/display-name
Upsells.UpsellOptionCard = ({ title, text, isTag, onSelect }) => (
  <div className='wrapper-card-upsell' onClick={onSelect}>
    <div className='header-upsell-card'>
      <h1>{title}</h1>
      {isTag && (
        <div className='wrapper-tag'>
          <span>Recomendado</span>
          <img src={logoB4y} />
        </div>
      )}
    </div>
    <p>{text}</p>
  </div>
);

// eslint-disable-next-line react/display-name
Upsells.InactiveMessage = ({ onActive }) => (
  <div className='wrapper-text-active-upsell'>
    <h1>Ative o Upsell e maximize seus resultados!</h1>
    <p>
      Ofereça um complemento logo após a compra e aumente o ticket médio de
      forma automática.
    </p>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <button onClick={onActive}>Ativar upsell para esta oferta</button>
    </div>
  </div>
);

// eslint-disable-next-line react/display-name
Upsells.UpsellType = ({
  type,
  offer,
  upsellData,
  uuidProduct,
  isNativeAllowed,
  isUpsellProduct,
  onBack,
}) => {
  return (
    <div style={{ padding: '0 24px' }}>
      {type === 'NATIVE' && (
        <>
          <Upsells.Delete
            offerUUid={offer.uuid}
            upsellData={upsellData}
            onBack={onBack}
          />
          <NativeUpsell
            upsellData={upsellData}
            isUpsellProduct={isUpsellProduct}
          />
        </>
      )}

      {type === 'EXTERNAL' && (
        <ExternalUpsell
          offer={offer}
          uuidProduct={uuidProduct}
          isNativeAllowed={isNativeAllowed}
          isUpsellProduct={isUpsellProduct}
          onBack={onBack}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line react/display-name
Upsells.Delete = ({ offerUUid, upsellData, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!upsellData || upsellData?.creationOrigin === 'product') {
      onBack();
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/upsell-native-offer/${offerUUid}/inactive`);
      onBack();
    } catch {
      notify({
        message:
          'Não foi possível remover o upsell neste momento. Tente novamente.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='wrapper-snack-bar'>
      <ButtonDS
        size='sm'
        variant='primary'
        disabled={loading}
        onClick={handleDelete}
      >
        {upsellData?.creationOrigin === 'product'
          ? 'Alterar Upsell'
          : 'Remover Upsell'}
        {loading && (
          <Spinner
            variant='light'
            size='sm'
            animation='border'
            className='ml-2'
          />
        )}
      </ButtonDS>
    </div>
  );
};

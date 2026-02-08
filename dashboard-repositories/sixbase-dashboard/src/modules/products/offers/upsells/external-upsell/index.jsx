import { useState } from 'react';
import { UpsellExternalConfig } from './configs';
import { UpsellUrlLink } from './urlLink';
import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../../providers/api';
import { notify } from '../../../../functions';

export const ExternalUpsell = ({
  offer,
  uuidProduct,
  isNativeAllowed,
  isUpsellProduct,
  onBack,
}) => {
  const [hasLink, setHasLink] = useState(Boolean(offer?.thankyou_page_upsell));
  const [showConfig, setShowConfig] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleDelete = async () => {
    try {
      setRequesting(true);

      await api.put(`/products/offers/${uuidProduct}/${offer.uuid}`, {
        ...offer,
        thankyou_page_upsell: null,
      });

      notify({
        message: 'Upsell externo removido com sucesso!',
        type: 'success',
      });

      setShowConfig(false);
      setHasLink(false);
      
      onBack?.();
    } catch (error) {
      notify({
        message: 'Não foi possível trocar o modelo de upsell',
        type: 'error',
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      {isUpsellProduct && (
        <div className='upsell-info-banner'>
          Este produto já possui upsell nativo ativo. Configurar um upsell
          externo nesta oferta não substitui a configuração do produto.
        </div>
      )}
      {isNativeAllowed && <div className='d-flex justify-content-between align-items-center mb-3'>
        <span style={{ fontSize: 14, color: '#667085' }}>
          Modelo atual: Upsell Externo
        </span>

        {hasLink && (
          <ButtonDS
            size='sm'
            variant='primary'
            disabled={requesting}
            onClick={handleDelete}
          >
            Trocar modelo
          </ButtonDS>
        )}
      </div>}

      {!hasLink ? (
        <UpsellUrlLink
          offer={offer}
          uuidProduct={uuidProduct}
          setHasLink={setHasLink}
        />
      ) : showConfig ? (
        <UpsellExternalConfig
          offer={offer}
          uuidProduct={uuidProduct}
          isNativeAllowed={isNativeAllowed}
          onBack={() => setShowConfig(false)}
        />
      ) : (
        <UpsellUrlLink
          offer={offer}
          uuidProduct={uuidProduct}
          readOnly
          onGoToConfig={() => setShowConfig(true)}
        />
      )}
    </>
  );
};

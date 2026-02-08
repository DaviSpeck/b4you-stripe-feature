import { yupResolver } from '@hookform/resolvers/yup';
import { Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form7';
import { urlLinkSchema } from './schema';
import ButtonDS from '../../../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../../../providers/api';
import { notify } from '../../../../../functions';
import { useEffect, useState } from 'react';

export const UpsellUrlLink = ({
  uuidProduct,
  offer,
  onGoToConfig,
  onSuccess,
  setHasLink
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    mode: 'onChange',
    resolver: yupResolver(urlLinkSchema),
    defaultValues: {
      thankyou_page_upsell: offer?.thankyou_page_upsell ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      thankyou_page_upsell: offer?.thankyou_page_upsell ?? '',
    });
  }, [offer]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      await api.put(`/products/offers/${uuidProduct}/${offer.uuid}`, {
        ...offer,
        is_upsell_active: true,
        thankyou_page_upsell: data.thankyou_page_upsell,
      });

      notify({
        message: 'Upsell externo salvo com sucesso!',
        type: 'success',
      });
      
      setHasLink(true);
      onSuccess?.();
    } catch {
      notify({
        message: 'Não foi possível salvar o link do upsell.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = form.formState.isValid;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label>URL da página de upsell</label>

        <Form.Control
          type='url'
          placeholder='Ex: https://meusite.com/upsell'
          disabled={isLoading}
          isInvalid={!!form.formState.errors?.thankyou_page_upsell}
          {...form.register('thankyou_page_upsell')}
        />

        <div className='form-error'>
          <span>
            {form.formState.errors?.thankyou_page_upsell?.message}
          </span>
        </div>
      </div>

      <div className='d-flex justify-content-end mt-3'>
        {onGoToConfig && (
          <ButtonDS
            size='sm'
            variant='outline-primary'
            type='button'
            onClick={onGoToConfig}
          >
            Gerador de Upsell
          </ButtonDS>
        )}

        <ButtonDS
          size='sm'
          variant='success'
          iconLeft='bx-save'
          disabled={isLoading || !isFormValid}
          onClick={form.handleSubmit(onSubmit)}
          className='ml-2'
        >
          Salvar link
          {isLoading && (
            <Spinner size='sm' animation='border' />
          )}
        </ButtonDS>
      </div>
    </form>
  );
};

import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../../modules/functions';
import { Spinner } from 'react-bootstrap';
import './style.scss';

export const UpsellProducts = (props) => {
  const [productOptions, setProductOptions] = useState([]);
  const [isLoading, setIsLoading] = useState([]);

  const { form, disabled, onProductSelected } = props;

  const upsellProductId = form.watch('upsellProductId');

  const getProductOptions = async () => {
    try {
      setIsLoading(true);

      const { data: productsList } = await api.get('/products');

      let options = productsList.rows.map((data) => ({
        id: data.uuid,
        label: data.name,
        paymentType: data.payment_type,
        type: data.type,
      }));

      if (
        !options.some((option) => form.watch().upsellProductId === option.id)
      ) {
        form.setValue('upsellProductId', '');
      }

      setProductOptions(options);
    } catch (error) {
      notify({
        message:
          'Não foi possível buscar os produtos.Tente novamente mais tarde.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!upsellProductId || upsellProductId === '' || !onProductSelected) {
      return;
    }
    onProductSelected(
      productOptions.find((option) => option.id === upsellProductId)
    );
  }, [upsellProductId, productOptions]);

  useEffect(() => {
    getProductOptions();
  }, []);

  return (
    <>
      <>
        {isLoading && (
          <div className='input-loding'>
            <span>Buscando produtos...</span>
            <Spinner variant='light' size='sm' animation='border' />
          </div>
        )}
      </>
      {!isLoading && (
        <select
          id={'select-accept-action'}
          name='upsellProductId'
          disabled={disabled}
          {...form.register('upsellProductId')}
        >
          <option key={'default'} value={''}>
            Selecione um produto
          </option>
          {productOptions.map((data) => {
            return (
              <option key={data.id} value={data.id}>
                {data.label}
              </option>
            );
          })}
        </select>
      )}
    </>
  );
};

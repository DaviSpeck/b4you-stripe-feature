import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import api from '../../../../../../../providers/api';

export const UpsellProducts = (props) => {
  const [productOptions, setProductOptions] = useState([]);

  const { uuidProduct, uuidOffer, onChange } = props;

  const fetchProducts = async () => {
    try {
      const { data } = await api.get(
        `/products/offers/${uuidProduct}/${uuidOffer}/select-offers?subscriptions=true`
      );
      setProductOptions(data);
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    if (!uuidProduct || !uuidOffer) return;
    fetchProducts();
  }, [uuidProduct, uuidOffer]);

  return (
    <Form.Group>
      <label htmlFor=''>Produto</label>
      <Form.Control
        as='select'
        defaultValue={'none'}
        onChange={(e) => {
          const findProduct = productOptions.find(
            (product) => product.uuid === e.target.value
          );

          const offer = findProduct.offers[0];

          onChange({
            product: findProduct,
            offerId: offer.uuid,
            planId: offer.plans.length > 0 ? offer.plans[0].id : null,
          });
        }}
      >
        <option value={'none'}>Não oferecer up-sell</option>
        {productOptions.some((p) => p.payment_type === 'single') ? (
          <optgroup label='Pagamento unico'>
            {productOptions
              .filter((p) => p.payment_type === 'single')
              .map((item) => (
                <option value={item.uuid} key={item.uuid}>
                  {item.name}
                </option>
              ))}
          </optgroup>
        ) : (
          <></>
        )}
        {productOptions.some((p) => p.payment_type !== 'single') ? (
          <optgroup label='Pagamento recorrente'>
            {productOptions
              .filter((p) => p.payment_type !== 'single')
              .map((item) => (
                <option value={item.uuid} key={item.uuid}>
                  {item.name}
                </option>
              ))}
          </optgroup>
        ) : (
          <></>
        )}
      </Form.Control>
    </Form.Group>
  );
};

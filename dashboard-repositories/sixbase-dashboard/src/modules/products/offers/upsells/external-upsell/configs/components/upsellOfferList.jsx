import { Form } from 'react-bootstrap';
import { currency } from '../../../../../../functions';

export const UpsellOffers = (props) => {
  const { productSelect, onChange } = props;

  if (!productSelect) return <></>;

  return (
    <>
      <label htmlFor=''>Oferta</label>
      <Form.Control
        as='select'
        name='upsell'
        onChange={(e) => {
          const offerFind = productSelect.offers.find(
            (offer) => (offer.uuid = e.target.value)
          );

          onChange({
            uuid: offerFind.uuid,
            planId: offerFind.plans.length > 0 ? offerFind.plans[0].id : null,
          });
        }}
      >
        {productSelect.offers.map((item, index) => {
          return (
            <option value={item.uuid} key={index}>
              {item.label}{' '}
              {productSelect.payment_type ? ` - ${currency(item.price)}` : ''}
            </option>
          );
        })}
      </Form.Control>
    </>
  );
};

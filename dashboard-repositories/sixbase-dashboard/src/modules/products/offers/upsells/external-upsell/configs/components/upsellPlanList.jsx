import { Form } from 'react-bootstrap';
import { currency } from '../../../../../../functions';

export const UpsellPlanOptions = (props) => {
  const { offers, value, onChange } = props;

  if (!offers) return <></>;

  return (
    <Form.Group>
      <Form.Label>Plano</Form.Label>
      <Form.Control value={value} onChange={onChange}>
        {offers.map((offer) => {
          return offer.plans.map((item) => {
            return (
              <option value={item.uuid} key={item.uuid}>
                {item.label} - {currency(item.price)} ({item.frequency_label})
              </option>
            );
          });
        })}
      </Form.Control>
    </Form.Group>
  );
};

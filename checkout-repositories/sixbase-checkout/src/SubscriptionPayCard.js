import CardRenovationSuccess from 'CardRenovationSuccess';
import Requesting from 'Requesting';
import api from 'api';
import CardDeclined from 'card/CardDeclined';
import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

const SubscriptionPayCard = ({
  subscription_id,
  payment_method,
  card_number,
  card_holder,
  expiration_date,
  cvv,
  installmentsList,
}) => {
  const [requesting, setRequesting] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    api
      .post(`/sales/renew`, {
        subscription_id,
        payment_method,
        card: {
          card_number: card_number.split(' ').join(''),
          card_holder,
          expiration_date,
          cvv,
          installments: +installmentsList,
        },
      })
      .then((r) => {
        setError(null);
        if (r.data.status.key === 'paid') {
          setPaymentStatus(true);
        } else {
          setError(`Error ao processar transação`);
          setPaymentStatus(false);
        }
      })
      .catch(() => {
        setError(`Error ao processar transação`);
        setPaymentStatus(false);
      })
      .finally(() => setRequesting(false));
  }, []);

  return (
    <div>
      <Modal.Header closeButton={!requesting}>
        <b>Pagamento com Cartão de Crédito</b>
      </Modal.Header>
      <Modal.Body>
        <div className='modal-card'>
          {requesting && <Requesting />}
          {!requesting && paymentStatus === true && (
            <CardRenovationSuccess fullName={card_holder} />
          )}
          {!requesting && paymentStatus === false && (
            <CardDeclined reason={error} />
          )}
        </div>
      </Modal.Body>
    </div>
  );
};

export default SubscriptionPayCard;

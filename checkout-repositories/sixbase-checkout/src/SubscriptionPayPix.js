import Loader from 'Loader';
import api from 'api';
import { useEffect } from 'react';
import { Modal } from 'react-bootstrap';

const SubscriptionPayPix = ({ subscription_id, payment_method }) => {
  useEffect(() => {
    api
      .post(`/sales/renew`, { subscription_id, payment_method })
      .then((r) => {
        window.location.href = `/sales/pix/info/${r.data.sale_id}`;
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Modal.Header>
        <b>Pagamento com Pix</b>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 300, minWidth: 300 }}>
        <Loader />
      </Modal.Body>
    </>
  );
};

export default SubscriptionPayPix;

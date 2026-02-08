import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import api from '../../../providers/api';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import moment from 'moment';
import { notify } from '../../functions';
const ModalProblems = ({ setShow }) => {
  const [requesting, setRequesting] = useState(false);
  const [problemOrders, setProblemOrders] = useState([]);

  useEffect(() => {
    fetchProblemOrders();
  }, []);

  const fetchProblemOrders = () => {
    setRequesting(true);
    api
      .get('/integrations/bling-shipping-v3/problems')
      .then((response) => {
        setProblemOrders(response.data);
      })
      .catch(() => {})
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleResend = (orderId) => {
    setRequesting(true);
    api
      .post('/integrations/bling-shipping-v3/resend', { id: orderId })
      .then(async () => {
        notify({
          message: 'Pedido reenviado para bling',
          type: 'success',
        });
        fetchProblemOrders();
      })
      .catch(() => {})
      .finally(() => {
        setRequesting(false);
      });
  };

  return (
    <div className='p-1'>
      <Table responsive bordered hover size='sm'>
        <thead className='table-light'>
          <tr className='align-middle text-center'>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Problema</th>
            <th>Data compra/envio</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {!requesting &&
            problemOrders.map((order, index) => (
              <tr key={index} className='align-middle text-center small py-1'>
                <td>
                  <div>{order.customer_name}</div>
                  <div className='text-muted'>{order.customer_email}</div>
                  <div className='text-muted'>{`ID:${order.uuid}`}</div>
                </td>
                <td>R$ {order.value.toFixed(2)}</td>
                <td className='text-start'>{order.problem}</td>
                <td>
                  {}
                  <div>
                    {moment(order.paid_at).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                  <div className='text-muted'>
                    {moment(order.created_at).format('DD/MM/YYYY HH:mm:ss')}
                  </div>
                </td>
                <td>
                  <ButtonDS
                    size='sm'
                    variant='success'
                    onClick={() => handleResend(order.id)}
                  >
                    Reenviar
                  </ButtonDS>
                </td>
              </tr>
            ))}
          {problemOrders.length === 0 && !requesting && (
            <tr>
              <td colSpan='6' className='text-center'>
                Não há pedidos com problemas.
              </td>
            </tr>
          )}
          {requesting && (
            <tr>
              <td colSpan='6' className='text-center'>
                <i
                  className='bx bx-loader-alt bx-spin'
                  style={{ fontSize: 40 }}
                />
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className='d-flex justify-content-end mt-3'>
        <ButtonDS size='sm' onClick={() => setShow(false)}>
          Fechar
        </ButtonDS>
      </div>
    </div>
  );
};

export default ModalProblems;

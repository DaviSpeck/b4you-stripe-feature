import { useEffect, useState } from 'react';
import { Tab } from 'react-bootstrap';
import api from '../../providers/api';
import formatDate from '../../utils/formatters';
import { currency } from '../functions';

const ModalRefund = ({ activeRefund }) => {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    api
      .get(`/balance/transactions/refund/${activeRefund}`)
      .then((r) => {
        setDetails(r.data);
      })
      .catch(() => {});
  }, []);

  return (
    <Tab.Container id='left-tabs-example' defaultActiveKey='refund'>
      <Tab.Content>
        <Tab.Pane eventKey='refund'>
          <b>Transações processadas</b>
          {details &&
            details.map((item, index) => (
              <table className='table' key={index}>
                <tbody>
                  {item.type.id === 3 && (
                    <tr>
                      <td>{item.role}</td>
                      <td>{item.user.name}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Tipo</td>
                    <td>{item.type.name}</td>
                  </tr>
                  <tr>
                    <td>Valor</td>
                    <td>{currency(item.amount)}</td>
                  </tr>
                  {item.type.id === 3 && (
                    <tr>
                      <td>Status</td>
                      <td>{item.status.name}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Processado em</td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                </tbody>
              </table>
            ))}
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  );
};

export default ModalRefund;

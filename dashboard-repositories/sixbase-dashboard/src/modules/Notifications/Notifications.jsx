import { useEffect, useState } from 'react';
import api from '../../providers/api';
import formatDate from '../../utils/formatters';
import './style.scss';

const Notifications = () => {
  const [, setRequesting] = useState(false);
  const [dataTable, setDataTable] = useState(false);

  useEffect(() => {
    setRequesting(true);
    api
      .get('/notifications')
      .then((response) => {
        setRequesting(false);
        setDataTable(response.data);
      })
      .catch(() => {
        setRequesting(false);
      });
  }, []);

  return (
    <div id='notificacoes'>
      <ul className='list'>
        {dataTable &&
          dataTable.rows.map((element, key) => (
            <li key={key} className='item'>
              <div className='item-content'>
                <div className='logo-box'>
                  {/* <img alt='timeline' width={50} src={avatar} />
                   */}
                  <i className='la la-trophy la-lg'></i>
                </div>
                <div className='item-text'>
                  <h4 className='mb-1'>{element.title}</h4>
                  <small className='d-block'>{element.content}</small>
                </div>
              </div>
              <div>{formatDate(element.created_at)}</div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Notifications;

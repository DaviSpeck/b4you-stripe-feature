import { useEffect, useState } from 'react';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const FilterWallet = ({ register }) => {
  const [filterProperties, setFilterProperties] = useState(null);

  useEffect(() => {
    api
      .get('/balance/transactions/filters')
      .then((r) => {
        setFilterProperties(r.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className='filter-wallet'>
      {filterProperties ? (
        <>
          <div className='form-group'>
            <label className='d-block'>Tipo</label>
            {filterProperties.types.map((item, index) => {
              return (
                <label className='d-block' key={index}>
                  <input
                    type='checkbox'
                    name='types'
                    value={item.key}
                    ref={register}
                  />
                  {item.name}
                </label>
              );
            })}
          </div>
          <div className='form-group'>
            <label className='d-block'>Status</label>
            {filterProperties.status.map((item, index) => {
              return (
                <label className='d-block' key={index}>
                  <input
                    type='checkbox'
                    name='status'
                    value={item.key}
                    ref={register}
                  />
                  {item.name}
                </label>
              );
            })}
          </div>
        </>
      ) : (
        <Loader title='Carregando filtros...' />
      )}
    </div>
  );
};

export default FilterWallet;

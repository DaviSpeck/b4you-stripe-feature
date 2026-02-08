import { useEffect, useState } from 'react';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const FilterAffiliates = ({ register }) => {
  const [filterProperties, setFilterProperties] = useState(null);

  useEffect(() => {
    api
      .get('affiliates/filters')
      .then((r) => {
        setFilterProperties(r.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className='filter-affiliates'>
      {filterProperties ? (
        <>
          <div className='form-group'>
            <label htmlFor=''>Produto</label>
            <select
              className='form-control'
              as='select'
              name='product_uuid'
              ref={register()}
            >
              <option value='all'>Todos os produtos</option>
              {filterProperties.products.map((item, index) => {
                return (
                  <option value={item.uuid} key={index}>
                    {item.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className='form-group'>
            <label className='d-block'>Status</label>
            {filterProperties.affiliateStatus.map((item, index) => {
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
        <Loader title='Carregando afiliados...' />
      )}
    </div>
  );
};

export default FilterAffiliates;

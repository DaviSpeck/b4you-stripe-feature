import { useEffect, useState } from 'react';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const FilterAffiliatesRequests = ({ register }) => {
  const [filterProperties, setFilterProperties] = useState(null);

  useEffect(() => {
    api
      .get('affiliates/filters')
      .then((r) => {
        setFilterProperties(r.data);
      })
      .catch((err) => err);
  }, []);

  return filterProperties ? (
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
  ) : (
    <Loader title='Carregando afiliados...' />
  );
};

export default FilterAffiliatesRequests;

import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import { useProduct } from '../../../providers/contextProduct';
import Loader from '../../../utils/loader';

const FilterStudents = ({ register }) => {
  const [filterProperties, setFilterProperties] = useState(null);
  const { product } = useProduct();

  useEffect(() => {
    api
      .get(`products/students/${product.uuid}/filters`)
      .then((r) => {
        setFilterProperties(r.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className='filter-subscriptions'>
      {filterProperties ? (
        <>
          <div className='form-group'>
            <label htmlFor=''>Turma</label>
            <select
              className='form-control'
              as='select'
              name='class_uuid'
              ref={register()}
            >
              <option value='all'>Todas as turmas</option>
              {filterProperties.map((item, index) => {
                return (
                  <option value={item.uuid} key={index}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>
        </>
      ) : (
        <Loader title='Carregando filtros...' />
      )}
    </div>
  );
};

export default FilterStudents;

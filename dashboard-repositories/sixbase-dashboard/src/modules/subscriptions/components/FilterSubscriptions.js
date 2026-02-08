import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';

const FilterSubscriptions = ({ register }) => {
  const [filterProperties, setFilterProperties] = useState(null);
  const [activePlans, setActivePlans] = useState([]);

  useEffect(() => {
    api
      .get('subscriptions/filters')
      .then((r) => {
        setFilterProperties(r.data);
      })
      .catch(() => {});
  }, []);

  const handleRelationChange = (e) => {
    let value = e.target.value;

    if (value !== 'all') {
      let activeProduct = filterProperties.products.find(
        (item) => item.uuid === value
      );
      setActivePlans(activeProduct.product_plans);
    } else {
      setActivePlans([]);
    }

    // if (value === 'all') {
    //   setValue('plan_uuid', 'all');
    //   setActiveProduct([]);
    // } else {
    //   // setActivePlans(filterProperties.products[getValues('pro')])
    // }
    // setActiveProducts(filterProperties.products[roles[getValues('role')]]);
  };

  return (
    <div className='filter-subscriptions'>
      {filterProperties ? (
        <>
          <div className='form-group'>
            <label htmlFor=''>Produto</label>
            <select
              className='form-control'
              as='select'
              name='product_uuid'
              ref={register()}
              onChange={handleRelationChange}
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
            <label htmlFor=''>Plano</label>
            <select
              className='form-control'
              as='select'
              name='plan_uuid'
              ref={register()}
            >
              <option value='all'>Todos os planos</option>
              {activePlans.map((item, index) => {
                return (
                  <option value={item.uuid} key={index}>
                    {item.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className='form-group'>
            <label className='d-block'>Status</label>
            {filterProperties.subscriptionStatus.map((item, index) => {
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

export default FilterSubscriptions;

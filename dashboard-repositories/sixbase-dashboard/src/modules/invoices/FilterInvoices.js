import { useEffect, useState } from 'react';
import api from '../../providers/api';
import Loader from '../../utils/loader';

const FilterInvoices = ({ register }) => {
  const [filterProperties, setFilterProperties] = useState(null);
  const [pluginState, setPluginState] = useState('all');

  useEffect(() => {
    api
      .get('invoices/filters')
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
            <label htmlFor=''>Automação</label>
            <select
              className='form-control'
              as='select'
              onChange={(e) => {
                setPluginState(e.target.value);
              }}
            >
              <option value='all'>Todas as notas</option>
              <option value='none'>Somente notas sem automação</option>
              <option value='filter'>Filtrar por automação</option>
            </select>
          </div>
          {pluginState === 'filter' && (
            <div className='form-group ml-5 mb-4'>
              <label className='d-block'>Apps</label>
              {filterProperties.integrationTypes.map((item, index) => {
                return (
                  <label className='d-block' key={index}>
                    <input
                      type='checkbox'
                      name='plugin'
                      value={item.key}
                      ref={register}
                    />
                    {item.name}
                  </label>
                );
              })}
            </div>
          )}
          <div className='form-group'>
            <label className='d-block'>Status</label>
            {filterProperties.invoiceTypes.map((item, index) => {
              return (
                <label className='d-block' key={index}>
                  <input
                    type='checkbox'
                    name='types'
                    value={item.key}
                    ref={register}
                  />
                  {item.label}
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

export default FilterInvoices;

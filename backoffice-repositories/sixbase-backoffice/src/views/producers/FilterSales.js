import React from 'react';
import { useEffect, useState } from 'react';
import { Col, Row, Form } from 'reactstrap';
import { api } from '../../services/api';

const FilterSales = ({ register, getValues, setValue, userUuid }) => {
  const [activeProducts, setActiveProducts] = useState([]);
  const [filterProperties, setFilterProperties] = useState(null);

  useEffect(() => {
    api
      .get(`users/${userUuid}/transactions/filters`)
      .then((r) => {
        setFilterProperties(r.data);
        setActiveProducts(r.data.products.all);
      })
      .catch(() => {});
  }, []);

  const handleRelationChange = () => {
    let roles = [];
    roles['all'] = 'all';
    roles[1] = 'producer';
    roles[2] = 'coproducer';
    roles[3] = 'affiliate';
    setActiveProducts(filterProperties.products[roles[getValues('role')]]);
    setValue('product', 'all');
  };

  return (
    <div className="filter-sales">
      {filterProperties ? (
        <>
          <Row className="mb-1">
            <Col md={6}>
              <div className="form-group">
                <label htmlFor="role" className="form-title">
                  Tipo
                </label>
                <select
                  className="form-control"
                  as="select"
                  name="role"
                  onChange={() => handleRelationChange()}
                  {...register('role')}
                >
                  <option value="all">Todos</option>
                  {filterProperties.rolesTypes.map((item, index) => {
                    return (
                      <option key={index} value={item.id}>
                        {item.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </Col>
            <Col md={6}>
              <div className="form-group">
                <label htmlFor="product" className="form-title">
                  Produto
                </label>
                <select
                  className="form-control"
                  as="select"
                  name="product"
                  {...register('product')}
                >
                  <option value="all">Todos os produtos</option>
                  {activeProducts.map((item, index) => {
                    return (
                      <option value={item.uuid} key={index}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </Col>
          </Row>

          <div className="form-group">
            <label className="form-title d-block">Método de Pagamento</label>
            <Row>
              <Col>
                {filterProperties.paymentMethods.map((item) => {
                  return (
                    <label key={item.key} className="d-flex">
                      <input
                        type="checkbox"
                        name="paymentMethod"
                        value={item.key}
                        {...register('paymentMethod')}
                      />
                      <div className="pl-2">{item.label}</div>
                    </label>
                  );
                })}
              </Col>
            </Row>
          </div>
          <div className="form-group">
            <label className="form-title d-block mt-1">Status</label>
            <Row>
              {filterProperties.salesStatus.map((item, index) => {
                return (
                  <Col key={index} md={6}>
                    <label className="d-flex">
                      <input
                        type="checkbox"
                        name="status"
                        value={item.key}
                        {...register('status')}
                      />
                      {item.name}
                    </label>
                  </Col>
                );
              })}
            </Row>
          </div>
        </>
      ) : (
        'Carregando...'
      )}
    </div>
  );
};

export default FilterSales;

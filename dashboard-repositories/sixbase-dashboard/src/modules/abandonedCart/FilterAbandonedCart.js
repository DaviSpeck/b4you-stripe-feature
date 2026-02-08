import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { MultiSelect } from 'react-multi-select-component';

const configSelect = {
  allItemsAreSelected: 'Todos estão selecionados',
  clearSearch: 'Limpar filtro',
  clearSelected: 'Limpar selecionado',
  noOptions: 'Sem opções',
  search: 'Buscar',
  selectAll: 'Selecionar todos',
  selectAllFiltered: 'Selecionar todos (com filtros)',
  selectSomeItems: 'Selecione...',
  create: 'Cadastrar',
};

const FilterAbandonedCart = ({
  selectedProducts,
  setSelectedProducts,
  selectedOffers,
  setSelectedOffers,
  register,
  getValues,
  setValue,
}) => {
  const [activeProducts, setActiveProducts] = useState([]);
  const [filterProperties, setFilterProperties] = useState(null);
  const [offers, setOffers] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    api
      .get('sales/filters')
      .then((r) => {
        setFilterProperties(r.data);
        setActiveProducts(
          r.data.products.all.map((item) => ({
            label: item.name,
            value: item.id,
            id: item.id,
          }))
        );
      })
      .catch(() => {});
    api.get('sales/filters/offers').then((r) => {
      setOffers(r.data.offers);
      const products = selectedProducts.map((p) => p.id);
      if (products.length > 0) {
        const productOffers = r.data.offers.filter((o) =>
          products.includes(o.id_product)
        );
        setActiveOffers(
          productOffers.map((o) => ({
            label: o.name,
            value: o.id,
            id_product: o.id_product,
          }))
        );
      } else {
        setActiveOffers(
          r.data.offers.map((o) => ({
            label: o.name,
            value: o.id,
            id_product: o.id_product,
          }))
        );
      }
    });
  }, []);

  useEffect(() => {
    const products = selectedProducts.map((p) => p.id);
    if (products.length > 0) {
      const productOffers = offers.filter((o) =>
        products.includes(o.id_product)
      );
      setActiveOffers(
        productOffers.map((o) => ({
          label: o.name,
          value: o.id,
          id_product: o.id_product,
        }))
      );
      setSelectedOffers((prevOffers) => {
        const previous = prevOffers.filter((o) =>
          products.includes(o.id_product)
        );
        return previous;
      });
     
    } else {
      setActiveOffers(
        offers.map((o) => ({
          label: o.name,
          value: o.id,
          id_product: o.id_product,
        }))
      );
    }
  }, [selectedProducts]);

  

  return (
    <div className='filter-sales'>
      {filterProperties ? (
        <>
          <Row>
            <Col md={12}>
              <div className='form-group'>
                <label htmlFor=''>Produtos</label>
                <MultiSelect
                  options={activeProducts}
                  value={selectedProducts}
                  onChange={setSelectedProducts}
                  overrideStrings={configSelect}
                />
              </div>
            </Col>
            <Col md={12}>
              <div className='form-group'>
                <label htmlFor=''>Ofertas</label>
                <MultiSelect
                  options={activeOffers}
                  value={selectedOffers}
                  onChange={setSelectedOffers}
                  overrideStrings={configSelect}
                />
              </div>
            </Col>
            <Col md={12}>
              <div className='form-group'>
                <label htmlFor='type_affiliate'>Gerado por</label>
                <select
                  className='form-control'
                  name='type_affiliate'
                  id='type_affiliate'
                  defaultValue=''
                  ref={register()}
                >
                  <option value=''>Todos</option>
                  <option value='true'>Pelo afiliado</option>
                  <option value='false'>Pelo produtor</option>
                </select>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <Loader title='Carregando...' />
      )}
    </div>
  );
};

export default FilterAbandonedCart;

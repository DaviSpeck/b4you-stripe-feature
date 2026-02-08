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

const FilterAffiliateReport = ({
  selectedProducts,
  setSelectedProducts,
  setSelectedOffers,
}) => {
  const [activeProducts, setActiveProducts] = useState([]);
  const [filterProperties, setFilterProperties] = useState(null);
  const [offers] = useState([]);
  const [setActiveOffers] = useState([]);

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
          </Row>
        </>
      ) : (
        <Loader title='Carregando...' />
      )}
    </div>
  );
};

export default FilterAffiliateReport;

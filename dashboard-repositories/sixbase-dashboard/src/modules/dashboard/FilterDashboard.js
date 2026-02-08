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

const FilterDashboard = ({ selectedProducts, setSelectedProducts }) => {
  const [activeProducts, setActiveProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('sales/filters');
        const productOptions = response.data.products.all.map((item) => ({
          label: item.name,
          value: item.id,
          id: item.id,
        }));

        setActiveProducts(productOptions);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <Loader title='Carregando...' />;
  }

  return (
    <div className='filter-sales'>
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
    </div>
  );
};

export default FilterDashboard;

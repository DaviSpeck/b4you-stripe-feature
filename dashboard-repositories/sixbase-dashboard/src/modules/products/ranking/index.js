import moment from 'moment';
import { useEffect, useState } from 'react';
import { Card, Col } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import Select from 'react-select';
import useMedia from '../../../hooks/useMedia';
import CalendarInline from '../../../jsx/components/CalendarInline';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import NoDataComponentContent from '../../NoDataComponentContent';
import { notify } from '../../functions';
import columns from './columns';
import { customStyles } from './customStyles';
import optionsFilter from './optionsFilter';

const PageRankingProducts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({
    value: 'all',
    label: 'Todas as categorias',
  });
  const [selectedFilter, setSelectedFilter] = useState({
    value: 'total-sales',
    label: 'Maior faturamento',
  });
  const [filterDates, setFilterDates] = useState({
    start: moment().subtract(13, 'days').toDate(),
    end: moment().toDate(),
    option: 4,
  });

  const mobile = useMedia('(max-width:576px)');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/products/categories');

      const options = data.map((category) => ({
        value: category.id,
        label: category.label,
      }));

      setCategories(options);
    } catch (error) {
      notify({
        type: 'error',
        message: 'Erro ao carregar categorias. Tente novamente.',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const fetchRankingProducts = async () => {
    try {
      setLoading(true);

      const start = moment(filterDates.start).format('YYYY-MM-DD');
      const end = moment(filterDates.end).format('YYYY-MM-DD');

      const { data } = await api.get(
        `/products/ranking?start=${start}&end=${end}&page=${currentPage}&size=${perPage}&category=${selectedCategory.value}&filter=${selectedFilter.value}`
      );

      setProducts(data.rows);
      setTotalRows(data.count);
    } catch (error) {
      notify({
        type: 'error',
        message: 'Erro ao carregar ranking de produtos. Tente novamente.',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoadingBtn(true);

      const start = moment(filterDates.start).format('YYYY-MM-DD');
      const end = moment(filterDates.end).format('YYYY-MM-DD');

      const { data } = await api.get(
        `/products/ranking/export?start=${start}&end=${end}&category=${selectedCategory.value}&filter=${selectedFilter.value}`
      );

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.setAttribute('href', url);
      link.setAttribute('download', `ranking-produtos-${start}-${end}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify({
        message: 'Dados exportados com sucesso',
        type: 'success',
      });

      return;
    } catch (error) {
      notify({
        message: 'Erro ao exportar os dados',
        type: 'error',
      });

      return error;
    } finally {
      setLoadingBtn(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (show) {
      setShow(false);
    }

    if (perPage !== 10 && currentPage !== 1) {
      setCurrentPage(1);
    }

    fetchRankingProducts();
  }, [filterDates, currentPage, perPage, selectedCategory, selectedFilter]);

  return (
    <section>
      <Col lg={12}>
        <h4 className='mt-2 coupons-ranking-title'>Ranking de Produtos</h4>

        <div
          className='d-flex justify-content-between mb-4 flex-wrap'
          style={{
            gap: 10,
          }}
        >
          <div className='d-flex flex-wrap div-btns-filter'>
            <CalendarInline
              value={[filterDates.start, filterDates.end]}
              defaultActiveOption={filterDates.option}
              onChange={(e) => {
                setFilterDates((prev) => ({
                  ...prev,
                  start: e[0],
                  end: e[1],
                }));
              }}
              maxDate={new Date()}
              show={show}
              setShow={setShow}
              className='calendar-inline'
              btnSize='md'
              btnClassName='btn-sm-full-width'
              fullWidth={mobile}
            />

            <Select
              options={[
                {
                  value: 'all',
                  label: 'Todas as categorias',
                },
                ...categories,
              ]}
              placeholder='Selecione a categoria'
              value={selectedCategory}
              onChange={(option) => setSelectedCategory(option)}
              styles={customStyles}
            />

            <Select
              options={optionsFilter}
              placeholder='Selecione o filtro'
              value={selectedFilter}
              onChange={(option) => setSelectedFilter(option)}
              styles={customStyles}
            />
          </div>

          <ButtonDS
            onClick={handleExport}
            variant='success'
            disabled={loading || loadingBtn}
            size='sm'
            iconLeft={'bxs-file-export'}
            fullWidth={mobile}
          >
            {loadingBtn ? 'Exportando...' : 'Exportar'}
          </ButtonDS>
        </div>

        <Card style={{ height: 'max-content' }}>
          <Card.Body>
            {loading ? (
              <Loader
                title='Carregando ranking...'
                style={{ padding: '50px' }}
              />
            ) : (
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columns(currentPage, perPage)}
                data={products}
                striped
                highlightOnHover
                progressPending={loading}
                progressComponent={<Loader title='Carregando dados...' />}
                noDataComponent={<NoDataComponentContent />}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                paginationDefaultPage={currentPage}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
              />
            )}
          </Card.Body>
        </Card>
      </Col>
    </section>
  );
};

export default PageRankingProducts;

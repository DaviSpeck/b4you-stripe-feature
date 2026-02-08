import moment from 'moment';
import { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import useMedia from '../../hooks/useMedia';
import CalendarInline from '../../jsx/components/CalendarInline';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { notify } from '../functions';
import { SaleStatusSummary } from '../sales/components/SaleStatusSummary';
import columns from './columns';
import CardsRanking from './components/cards-ranking';
import DataTableRankingCoupons from './components/dataTable';
import { customStyles } from './customStyles';
import './style.css';

const PageRakingCoupons = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [metrics, setMetrics] = useState({
    total_sales: 0,
    total_sold: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState({
    value: 'all',
    label: 'Geral',
  });
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({
    value: 'all',
    label: 'Todos os produtos',
  });
  const [filterDates, setFilterDates] = useState({
    start: moment().subtract(13, 'days').toDate(),
    end: moment().toDate(),
    option: 4,
  });

  const mobile = useMedia('(max-width:576px)');

  const fetchRankingCoupons = async () => {
    try {
      setLoading(true);

      const start = moment(filterDates.start).format('YYYY-MM-DD');
      const end = moment(filterDates.end).format('YYYY-MM-DD');

      const { data } = await api.get(
        `/coupons/ranking?start=${start}&end=${end}&page=${currentPage}&size=${perPage}&role=${selectedFilter.value}&product=${selectedProduct.value}`
      );

      setCoupons(data.rows);
      setTotalRows(data.count);
      setMetrics(data.metrics);
    } catch (error) {
      notify({
        type: 'error',
        message: 'Erro ao carregar ranking de cupons. Tente novamente.',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoadingExport(true);

      const start = moment(filterDates.start).format('YYYY-MM-DD');
      const end = moment(filterDates.end).format('YYYY-MM-DD');

      const response = await api.get(
        `/coupons/ranking/export?start=${start}&end=${end}&role=${selectedFilter.value}&product=${selectedProduct.value}`,
        {
          responseType: 'blob',
        }
      );

      const disposition = response.headers['content-disposition'];
      const matches = /filename=(.+)/.exec(disposition);
      const fileName = matches && matches[1] ? matches[1] : 'default.xlsx';

      const link = document.createElement('a');
      link.href = URL.createObjectURL(response.data);
      link.download = fileName;
      link.click();
    } catch (error) {
      notify({
        type: 'error',
        message: 'Erro ao exportar dados. Tente novamente.',
      });

      return error;
    } finally {
      setLoadingExport(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?size=9999&order=asc');

      const options = data.rows.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      setProducts(options);
    } catch (error) {
      notify({
        type: 'error',
        message: 'Erro ao carregar produtos. Tente novamente.',
      });

      return error;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (show) {
      setShow(false);
    }

    if (perPage !== 10 && currentPage !== 1) {
      setCurrentPage(1);
    }

    fetchRankingCoupons();
  }, [filterDates, currentPage, perPage, selectedFilter, selectedProduct]);

  return (
    <section>
      <Col lg={12}>
        {selectedFilter.value === 'creator' && !loading && (
          <CardsRanking items={coupons} />
        )}

        <h4 className='mt-2 coupons-ranking-title'>Desempenho de Cupons</h4>

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
                { value: 'all', label: 'Geral' },
                { value: 'creator', label: 'Creators' },
                { value: 'productor', label: 'Produtor' },
              ]}
              placeholder='Selecione...'
              value={selectedFilter}
              onChange={(option) => setSelectedFilter(option)}
              styles={customStyles}
            />

            <Select
              options={[
                { value: 'all', label: 'Todos os produtos' },
                ...products,
              ]}
              placeholder='Selecione...'
              value={selectedProduct}
              onChange={(option) => setSelectedProduct(option)}
              styles={customStyles}
            />
          </div>

          <ButtonDS
            size='md'
            onClick={handleExportData}
            className='btn-sm-full-width btn-export'
            iconLeft='bxs-file-export'
            disabled={loadingExport}
          >
            {loadingExport ? 'Exportando...' : 'Exportar Dados'}
          </ButtonDS>
        </div>

        <Row>
          <SaleStatusSummary
            loading={loading}
            fieldName='total_value'
            mainValue={metrics?.total_sales}
            subInformation={`Total faturado`}
          />

          <SaleStatusSummary
            loading={loading}
            fieldName='total_sold'
            mainValue={metrics?.total_sold}
            subInformation={`Total de transações`}
            isCurrency={false}
          />
        </Row>

        <Card style={{ height: 'max-content' }}>
          <Card.Body>
            {loading ? (
              <Loader
                title='Carregando ranking...'
                style={{ padding: '50px' }}
              />
            ) : (
              <>
                <DataTableRankingCoupons
                  columns={columns(currentPage, perPage)}
                  data={coupons}
                  loading={loading}
                  totalRows={totalRows}
                  perPage={perPage}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  setPerPage={setPerPage}
                />
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </section>
  );
};

export default PageRakingCoupons;

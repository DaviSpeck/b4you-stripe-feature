import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { MultiSelect } from 'react-multi-select-component';
import useMedia from '../../../hooks/useMedia';
import BronzeMedal from '../../../icons/medals/bronze.svg';
import GoldMedal from '../../../icons/medals/gold.svg';
import SilverMedal from '../../../icons/medals/silver.svg';
import CalendarInline from '../../../jsx/components/CalendarInline';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import PageTitle from '../../../jsx/layouts/PageTitle';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import { notify } from '../../functions';
import RankingModalProductsAffiliations from '../ranking-modal-products-affiliations';
import { CardAffiliations } from './card';
import DataTableRankingAffiliations from './DataTable';
import { configSelect } from './multi-select-config';
import './styles.css';

export default function RankingAffiliations() {
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [affiliations, setAffiliations] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [productsAffiliations, setProductsAffiliations] = useState([]);
  const [filterDates, setFilterDates] = useState({
    start: moment().subtract(13, 'days').toDate(),
    end: moment().toDate(),
    option: 4,
  });
  const [show, setShow] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [bestAffiliates, setBestAffiliates] = useState([]);
  const [isLoadingBestAffiliates, setIsLoadingBestAffiliates] = useState(true);

  const mobile = useMedia('(max-width:768px)');

  const fetchAffiliations = async () => {
    try {
      setLoading(true);

      const start = moment(filterDates.start).format('YYYY-MM-DD');
      const end = moment(filterDates.end).format('YYYY-MM-DD');

      const products =
        selectedProducts.length > 0
          ? selectedProducts.map((product) => product.value)
          : null;

      const { data } = await api.get(
        `/affiliates/ranking?start=${start}&end=${end}&page=${currentPage}&size=${perPage}&products=${products}`
      );

      setAffiliations(data.rows);
      setTotalRows(data.count);
    } catch (error) {
      notify({
        message: 'Falha ao carregar ranking de afiliados.',
        type: 'error',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsAffiliations = async (selectedUser) => {
    try {
      setLoadingModal(true);

      const { data } = await api.get(`/affiliates/products/${selectedUser}`);
      setProductsAffiliations(data.rows);
    } catch (error) {
      notify({
        message: 'Falha ao carregar produtos do afiliado.',
        type: 'error',
      });

      return error;
    } finally {
      setLoadingModal(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const { data } = await api.get('/products?size=9999');

      const formattedProducts = data.rows.map((product) => ({
        label: product.name,
        value: product.id,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      notify({
        message: 'Falha ao carregar produtos.',
        type: 'error',
      });

      return error;
    }
  };

  const handleExport = async () => {
    const start = moment(filterDates.start).format('YYYY-MM-DD');
    const end = moment(filterDates.end).format('YYYY-MM-DD');

    const products =
      selectedProducts.length > 0
        ? selectedProducts.map((product) => product.value)
        : null;

    try {
      await api.get(
        `/affiliates/ranking/export?start=${start}&end=${end}&products=${products}`
      );

      notify({
        type: 'success',
        message: 'A planilha foi enviada para seu email',
      });
    } catch (error) {
      notify({
        message:
          'Não foi possível fazer a exportação. tente novamente mais terde',
        type: 'error',
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const handleGetBestAffiliates = useCallback(async () => {
    try {
      const start = moment(filterDates.start).format('YYYY-MM-DD');
      const end = moment(filterDates.end).format('YYYY-MM-DD');

      const products =
        selectedProducts.length > 0
          ? selectedProducts.map((product) => product.value)
          : null;

      const res = await api.get(
        `/affiliates/ranking/best-sellers?start=${start}&end=${end}&products=${products}`
      );

      setBestAffiliates(res.data);
    } catch (error) {
      notify({
        message: 'Não foi possível buscar dados dos melhores afiliados',
        type: 'error',
      });
    } finally {
      setIsLoadingBestAffiliates(false);
    }
  }, [filterDates, products]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (show) {
      setShow(false);
    }

    if (perPage !== 10 && currentPage !== 1) {
      setCurrentPage(1);
    }

    fetchAffiliations();
  }, [filterDates, currentPage, perPage, selectedProducts.length]);

  useEffect(() => {
    if (selectedUser) {
      fetchProductsAffiliations(selectedUser.id_user_affiliate);
    }
  }, [selectedUser]);

  useEffect(() => {
    handleGetBestAffiliates();
  }, [filterDates, products]);

  return (
    <section>
      <PageTitle title='Ranking de Afiliados' path={[]} />

      <Row>
        <Col lg={12}>
          <div className='d-flex flex-column flex-md-row align-items-center justify-content-between mb-4 w-100'>
            <div
              className='d-flex flex-column flex-md-row align-items-center mb-3 mb-md-0 w-100 w-md-auto'
              style={{
                gap: 12,
              }}
            >
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
                btnClassName='btn-md-full-width'
                fullWidth={mobile}
              />

              <MultiSelect
                className='multi-select-affiliations'
                options={products}
                value={selectedProducts}
                onChange={(value) => {
                  setCurrentPage(1);
                  setSelectedProducts(value);
                }}
                overrideStrings={configSelect}
              />
            </div>

            <ButtonDS
              size='md'
              variant='success'
              onClick={handleExport}
              className='btn-md-full-width'
              iconLeft='bxs-file-export'
              disabled={loadingExport}
              fullWidth={mobile}
              style={{
                minWidth: '180px',
                height: '40px',
              }}
            >
              {loadingExport ? 'Exportando...' : 'Exportar Dados'}
            </ButtonDS>
          </div>

          {affiliations.length > 3 && (
            <div
              className='d-flex flex-column flex-md-row mb-2 gap-small'
              style={{ gap: 20 }}
            >
              <CardAffiliations
                item={bestAffiliates[0]}
                img={GoldMedal}
                colorBorder='#EFC75E'
                loading={isLoadingBestAffiliates}
              />

              <CardAffiliations
                item={bestAffiliates[1]}
                img={SilverMedal}
                colorBorder='#BDBDBD'
                loading={isLoadingBestAffiliates}
              />

              <CardAffiliations
                item={bestAffiliates[2]}
                img={BronzeMedal}
                colorBorder='#ED9D5D'
                loading={isLoadingBestAffiliates}
              />
            </div>
          )}

          <Card style={{ height: 'max-content' }}>
            <Card.Body>
              {loading ? (
                <Loader
                  title='Carregando ranking...'
                  style={{ padding: '50px' }}
                />
              ) : (
                <DataTableRankingAffiliations
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  perPage={perPage}
                  setPerPage={setPerPage}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                  setSelectedUser={setSelectedUser}
                  affiliations={affiliations}
                  loading={loading}
                  totalRows={totalRows}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {openModal && (
        <RankingModalProductsAffiliations
          open={openModal}
          setOpen={setOpenModal}
          loadingModal={loadingModal}
          productsAffiliations={productsAffiliations}
          setProductsAffiliations={setProductsAffiliations}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
      )}
    </section>
  );
}

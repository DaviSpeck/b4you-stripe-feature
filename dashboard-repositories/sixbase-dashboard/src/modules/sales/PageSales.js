import _ from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import Dropzone from 'react-dropzone';
import readXlsxFile from 'read-excel-file';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import FilterListing from '../../jsx/components/FilterListing';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { useUser } from '../../providers/contextUser';
import Loader from '../../utils/loader';
import { currency, notify } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import { ExpandedComponent } from './components/ExpandedComponentTable';
import { ModalExport } from './components/ModalExport.js';
import Sale from './components/ModalSale';
import { columns } from './components/PageSalesColumns.js';
import { SaleStatusSummary } from './components/SaleStatusSummary.js';
import './style.scss';

const PageSales = () => {
  const [records, setRecords] = useState([]);
  const [modalSaleShow, setModalSaleShow] = useState(false);
  const [activeSale, setActiveSale] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [totalRows, setTotalRows] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterParams, setFilterParams] = useState();
  const [moreInfo, setMoreInfo] = useState(false);
  const [moreTracking, setMoreTracking] = useState(false);
  const [modalExport, setModalExport] = useState(false);
  const [modalExportTracking, setModalExportTracking] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [formatExport, setFormatExport] = useState('xlsx');
  const [email, setEmail] = useState('');

  const { user } = useUser();

  const uuidFromUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('uuid')
      : null;

  const getStatusName = (name) => {
    const statusDict = {
      pending: 'Aguardando',
      paid: 'Pago',
      denied: 'Negado',
      refunded: 'Reembolsado',
      chargeback: 'Chargeback',
      'request-refund': 'Solicitado',
      expired: 'Expirado',
      chargeback_dispute: 'Em disputa',
    };

    return statusDict[name];
  };

  const handleGetMetrics = useCallback(async () => {
    if (!filterParams) return;
    try {
      setLoadingMetrics(true);
      const res = await api.get(`/sales/metrics`, {
        params: filterParams,
      });
      setMetrics(res.data);
    } catch (error) {
      return error;
    } finally {
      setLoadingMetrics(false);
    }
  }, [filterParams]);

  const fetchPage = async () => {
    setShowCalendar(false);
    setLoading(true);

    try {
      const params =
        filterParams instanceof URLSearchParams
          ? new URLSearchParams(filterParams)
          : new URLSearchParams();

      if (uuidFromUrl) {
        params.set('uuid_sale', uuidFromUrl);
        params.set('is_url_query', 'true');
      }

      const res = await api.get(`/sales?size=${perPage}&page=${currentPage}`, {
        params: params,
      });
      setTotalRows(res.data.count);
      setRecords(res.data.rows);
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = (show, reload = false) => {
    if (reload) {
      fetchPage();
    }

    setModalSaleShow(!modalSaleShow);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const fetchExportFile = async () => {
    const params = { format: formatExport };

    if (Object.entries(filterParams || {})) {
      for (const [key, value] of filterParams.entries()) {
        params[key] = value;
      }
    }

    api
      .post('/sales/export', { email, params })
      .then(() => {
        notify({
          message:
            'Requisição feita com sucesso. Seu arquivo será processado e enviado em seu e-mail.',
          type: 'success',
        });
        setModalExport(false);
      })
      .catch(() => {
        notify({
          message: 'Erro ao exportar, tente novamente mais tarde.',
          type: 'error',
        });
      });
  };

  const fetchExportFileTracking = async () => {
    const params = { format: formatExport };
    for (const [key, value] of filterParams.entries()) {
      params[key] = value;
    }
    api
      .post('/sales/export/tracking', { email, params })
      .then(() => {
        notify({
          message:
            'Requisição feita com sucesso. Seu arquivo será processado e enviado em seu e-mail.',
          type: 'success',
        });
        setModalExportTracking(false);
      })
      .catch(() => {
        notify({
          message: 'Erro ao exportar, tente novamente mais tarde.',
          type: 'error',
        });
      });
  };

  const postFileUplod = async (rows) => {
    try {
      await api.post('/sales/export/tracking/upload', { rows });
    } catch {
      notify({
        message:
          'Erro ao importar, verifique se o arquivo importado está nos padrões corretos.',
        type: 'error',
      });
    }
  };

  const uploadFileTracking = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      notify({
        message: `Erro ao importar, verifique se o arquivo importado está nos padrões corretos.`,
        type: 'error',
      });
      return;
    }

    const [, ...rows] = await readXlsxFile(acceptedFiles[0]);
    for (const row of rows) {
      if (!row[4]) {
        notify({
          message: `Erro ao importar, verifique se o arquivo importado está nos padrões corretos.`,
          type: 'error',
        });
        return;
      }
    }

    try {
      setLoadingExport(true);

      for await (const [, chunk] of _.chunk(rows, 100).entries()) {
        await postFileUplod(chunk);
      }

      notify({
        message: `Vendas importadas com sucesso! Este processo pode levar alguns minutos até atualizar todas as vendas.`,
        type: 'success',
      });
    } catch (error) {
      notify({
        message: `Erro ao importar, verifique se o arquivo importado está nos padrões corretos.`,
        type: 'error',
      });
    } finally {
      setLoadingExport(false);
      setModalExportTracking(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (uuidFromUrl || filterParams) {
      fetchPage();
    }
  }, [currentPage, perPage, filterParams, uuidFromUrl]);

  useEffect(() => {
    handleGetMetrics();
  }, [filterParams]);

  return (
    <>
      {modalSaleShow && (
        <ModalGeneric
          show={modalSaleShow}
          setShow={toggleModal}
          title={'Detalhes da Venda'}
          size='md'
          centered
        >
          <Sale
            activeSale={activeSale}
            setActiveSale={setActiveSale}
            setShow={toggleModal}
          />
        </ModalGeneric>
      )}

      <section id='page-sales'>
        <PageTitle title='Vendas' />

        {loadingExport ? (
          <Loader title='Importando dados...' />
        ) : (
          <>
            <div>
              <FilterListing
                setFilterParams={setFilterParams}
                pageFilter={'sales'}
                calendar={true}
                showCalendar={showCalendar}
                setShowCalendar={setShowCalendar}
                configData={{
                  start: moment().subtract(29, 'days'),
                  end: moment().format(`DD/MM/YYYY`),
                  option: 5,
                }}
              />

              <div>
                <Row>
                  <SaleStatusSummary
                    loading={loadingMetrics}
                    fieldName='gross_total'
                    mainValue={metrics?.gross_total ?? 0}
                    subInformation={`Total faturado: ${
                      metrics?.paid?.count ?? 0
                    }`}
                  />
                  <SaleStatusSummary
                    loading={loadingMetrics}
                    fieldName='paid'
                    mainValue={metrics?.paid?.total ?? 0}
                    subInformation={`Total líquido: ${
                      metrics?.paid?.count ?? 0
                    }`}
                  />
                  <SaleStatusSummary
                    loading={loadingMetrics}
                    fieldName='pending'
                    mainValue={metrics?.pending?.total ?? 0}
                    subInformation={`Pendentes: ${
                      metrics?.pending?.count ?? 0
                    }`}
                  />
                  <SaleStatusSummary
                    loading={loadingMetrics}
                    fieldName='refund'
                    mainValue={`-${metrics?.refund?.total ?? 0}`}
                    subInformation={`Reembolsos: ${
                      (metrics?.refund?.count ?? 0) * -1
                    }`}
                  />
                </Row>

                {moreInfo && (
                  <Row>
                    <Col md={4} sm={6}>
                      <div className='card  bg-success'>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0 '>
                            {currency(metrics?.pix?.confirmed?.total)}
                          </h2>
                          <span className='fs-14'>
                            Pix Confirmados: {metrics?.pix?.confirmed?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card bg-light '>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0'>
                            {currency(metrics?.pix?.waiting?.total)}
                          </h2>
                          <span className='fs-14'>
                            Pix Pendentes: {metrics?.pix?.waiting?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card bg-light '>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0'>
                            {currency(metrics?.pix?.expired?.total)}
                          </h2>
                          <span className='fs-14'>
                            Pix Expirados: {metrics?.pix?.expired?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card  bg-success'>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0 '>
                            {currency(metrics?.billet?.confirmed?.total)}
                          </h2>
                          <span className='fs-14'>
                            Boletos Confirmados:{' '}
                            {metrics?.billet?.confirmed?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card bg-light '>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0'>
                            {currency(metrics?.billet?.waiting?.total)}
                          </h2>
                          <span className='fs-14'>
                            Boletos Pendentes: {metrics?.billet?.waiting?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card bg-light '>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0'>
                            {currency(metrics?.billet?.expired?.total)}
                          </h2>
                          <span className='fs-14'>
                            Boletos Expirados: {metrics?.billet?.expired?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card  bg-success'>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0 '>
                            {currency(metrics?.card?.confirmed?.total)}
                          </h2>
                          <span className='fs-14'>
                            Cartão Confirmados:{' '}
                            {metrics?.card?.confirmed?.count}
                          </span>
                        </div>
                      </div>
                    </Col>

                    <Col md={4} sm={6}>
                      <div className='card bg-light '>
                        <div className='card-body p-3 d-flex flex-column justify-content-center'>
                          <h2 className='fs-24 font-w600 mb-0'>
                            {currency(metrics?.card?.denied?.total)}
                          </h2>
                          <span className='fs-14'>
                            Cartão Negado: {metrics?.card?.denied?.count}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}

                {moreTracking && (
                  <Row className='justify-content-end'>
                    <Col>
                      <ButtonDS
                        variant='success'
                        className='d-flex align-items-center mb-4 mt-2'
                        iconLeft='bxs-file-export'
                        onClick={() => {
                          setModalExportTracking(true);
                          setEmail(user.email);
                        }}
                      >
                        <span style={{ fontSize: 15 }}>
                          Exportar planilha sem rastreio
                        </span>
                      </ButtonDS>
                    </Col>

                    <Col className='d-flex justify-content-end'>
                      <Dropzone
                        onDrop={(acceptedFiles) =>
                          uploadFileTracking(acceptedFiles)
                        }
                        accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div {...getRootProps()}>
                              <input {...getInputProps()} />
                              <ButtonDS
                                variant='success'
                                className='d-flex align-items-center mb-4 mt-2'
                                iconLeft='bxs-file-import'
                                onClick={() => {}}
                              >
                                <span style={{ fontSize: 15 }}>
                                  Importar planilha com rastreio
                                </span>
                              </ButtonDS>
                            </div>
                          </section>
                        )}
                      </Dropzone>
                    </Col>
                  </Row>
                )}

                <Row className='justify-content-end mb-2'>
                  <Col xs={4} className='mr-auto d-flex '>
                    <ButtonDS
                      className='mr-2'
                      size='sm'
                      outline
                      onClick={() => setMoreInfo(!moreInfo)}
                      style={{ minWidth: 165 }}
                    >
                      {moreInfo ? 'Menos Informações' : 'Mais Informações'}
                    </ButtonDS>

                    <ButtonDS
                      className='mt-0'
                      size='sm'
                      outline
                      onClick={() => setMoreTracking(!moreTracking)}
                      style={{ minWidth: 130 }}
                    >
                      {moreTracking ? '(-) Rastreio' : '(+) Rastreio'}
                    </ButtonDS>
                  </Col>
                </Row>

                <Row className='justify-content-end'>
                  <Col
                    xs={2}
                    className='col-export d-flex justify-content-end mb-4'
                  >
                    <ButtonDS
                      variant='success'
                      className='d-flex align-items-center'
                      iconLeft='bxs-file-export'
                      onClick={() => {
                        setModalExport(true);
                        setFormatExport('xlsx');
                        setEmail(user.email);
                      }}
                    >
                      <span style={{ fontSize: 15 }}>Exportar</span>
                    </ButtonDS>
                    <ButtonDS
                      onClick={fetchPage}
                      variant='light'
                      disabled={loading}
                      size='sm'
                      className={`ml-2`}
                    >
                      <svg
                        width='30'
                        height='30'
                        viewBox='0 0 30 30'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                        className={`${loading && 'bx-spin'}`}
                      >
                        <g clip-path='url(#clip0_2802_5208)'>
                          <path
                            d='M23.75 10L18.75 15H22.5C22.5 19.1438 19.1438 22.5 15 22.5C13.7313 22.5 12.5437 22.1813 11.4937 21.6313L9.66875 23.4562C11.2188 24.425 13.0375 25 15 25C20.525 25 25 20.525 25 15H28.75L23.75 10ZM7.5 15C7.5 10.8562 10.8562 7.5 15 7.5C16.2687 7.5 17.4563 7.81875 18.5063 8.36875L20.3312 6.54375C18.7812 5.575 16.9625 5 15 5C9.475 5 5 9.475 5 15H1.25L6.25 20L11.25 15H7.5Z'
                            fill='#888888'
                          />
                        </g>
                        <defs>
                          <clipPath id='clip0_2802_5208'>
                            <rect width='30' height='30' fill='white' />
                          </clipPath>
                        </defs>
                      </svg>
                    </ButtonDS>
                  </Col>
                </Row>
              </div>
            </div>

            <Row>
              <Col>
                <div className='container-datatable card'>
                  <DataTable
                    data={records}
                    striped
                    highlightOnHover
                    progressPending={loading}
                    noDataComponent={<NoDataComponentContent />}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationPerPage={perPage}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                    columns={columns(
                      setModalSaleShow,
                      setActiveSale,
                      getStatusName
                    )}
                    paginationComponentOptions={{
                      rowsPerPageText: 'Linhas por página',
                      rangeSeparatorText: 'de',
                      selectAllRowsItem: false,
                      selectAllRowsItemText: 'Todos',
                    }}
                    progressComponent={
                      <Loader
                        title='Carregando vendas...'
                        style={{ padding: '60px' }}
                      />
                    }
                  />
                </div>
              </Col>
            </Row>

            <ModalExport
              show={modalExport}
              onHide={() => setModalExport(false)}
              onSubmit={fetchExportFile}
              user={user}
              email={email}
              setEmail={setEmail}
            />

            <ModalExport
              show={modalExportTracking}
              onHide={() => setModalExportTracking(false)}
              onSubmit={fetchExportFileTracking}
              user={user}
              email={email}
              setEmail={setEmail}
            />
          </>
        )}
      </section>
    </>
  );
};

export default PageSales;

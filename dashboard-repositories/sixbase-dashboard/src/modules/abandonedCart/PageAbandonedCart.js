import memoizeOne from 'memoize-one';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import FilterListing from '../../jsx/components/FilterListing';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import formatDate from '../../utils/formatters';
import Loader from '../../utils/loader';
import { formatPhoneNumber, notify } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import ModalSelect3Steps from '../products/offers/modal-3steps';
import { SaleStatusSummary } from '../sales/components/SaleStatusSummary';
import ModalAbandonedCart from './ModalAbandonedCart';

const PageAbandonedCart = () => {
  const [filterParams, setFilterParams] = useState();
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState([]);
  const [modalActionShow, setModalActionShow] = useState(false);
  const [activeCart, setActiveCart] = useState(null);
  const [showModalLink, setShowModalLink] = useState(false);
  const [urlCheckout, setUrlCheckout] = useState('');
  const [totalOffers, setTotalOffers] = useState(0);
  const [loadingTotalOffers, setLoadingTotalOffers] = useState(false);

  const totalRowsFormatted = new Intl.NumberFormat('pt-BR').format(totalRows);

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const fetchData = () => {
    setLoading(true);
    api
      .get(`/checkout/abandoned?size=${perPage}&page=${currentPage}`, {
        params: filterParams,
      })
      .then((response) => {
        setTotalRows(response.data.count);
        setRecords(response.data.rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchTotalOffers = () => {
    setLoadingTotalOffers(true);
    api
      .get(`/checkout/abandoned/total`, {
        params: filterParams,
      })
      .then((response) => {
        setTotalOffers(response.data.total_offer);
      })
      .catch(() => {})
      .finally(() => setLoadingTotalOffers(false));
  };

  const fetchPage = () => {
    fetchData();
    fetchTotalOffers();
    setShowCalendar(false);
  };

  const handleExport = () => {
    setLoadingBtn(true);

    let isResponseReceived = false;

    const timeout = setTimeout(() => {
      if (isResponseReceived) {
        notify({
          message: 'A exportação está demorando mais do que o esperado...',
          type: 'warn',
        });
      }
    }, 5000);

    api
      .get(`/checkout/abandoned/export`, {
        responseType: 'blob',
        params: filterParams,
      })
      .then((response) => {
        isResponseReceived = true;

        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'carrinho-abandonado.csv');
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        isResponseReceived = true;

        notify({
          message: 'Erro ao exportar os dados',
          type: 'error',
        });

        return error;
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoadingBtn(false);
      });
  };

  const handleModalLink = () => {
    setShowModalLink(!showModalLink);
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    notify({ message: 'Link copiado!', type: 'success' });
  };

  const columns = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Nome' iconClassName='bx bx-user' />,
      cell: (item) => item.full_name,
      sortable: true,
    },
    {
      name: (
        <RenderNameDataTable name='Email' iconClassName='bx bx-mail-send' />
      ),
      cell: (item) => item.email,
      width: '200px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Whatsapp' iconClassName='bx bx-phone' />,
      cell: (item) => (
        <a
          style={{
            color: '#0f1b35',
            textDecoration: 'underline',
          }}
          href={`https://wa.me/+55${item.whatsapp}`}
          target='_blank'
          rel='noreferrer'
        >
          {formatPhoneNumber(item.whatsapp) || '-'}{' '}
        </a>
      ),
      width: '170px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Data' iconClassName='bx bx-calendar' />,
      cell: (item) => formatDate(item.updated_at, 'DD/MM/YYYY'),
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
      cell: (item) => item.product?.name,
      sortable: true,
    },
    {
      name: (
        <RenderNameDataTable
          name='Oferta'
          iconClassName='bx bx-dollar-circle'
        />
      ),
      cell: (item) => item.offer?.name,
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Tipo' iconClassName='bx bx-user' />,
      cell: (item) => (item.isAffiliated ? 'Afiliado' : 'Produtor'),
      sortable: true,
    },
    {
      name: (
        <RenderNameDataTable name='Gerado pelo' iconClassName='bx bx-user' />
      ),
      cell: (item) => (item.id_affiliate ? 'Afiliado' : 'Produtor'),
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Checkout' />,
      cell: (item) => (
        <OverlayTrigger
          placement='top'
          overlay={
            <Tooltip id={`tooltip-top`}>
              {item.checkout
                ? 'Selecionar link do checkout'
                : 'Oferta não encontrada'}
            </Tooltip>
          }
        >
          <ButtonDS
            size={'icon'}
            onClick={() => {
              handleModalLink();
              setUrlCheckout(item.checkout);
            }}
            disabled={!item.checkout}
            variant='primary'
          >
            <i className='bx bxs-copy'></i>
          </ButtonDS>
        </OverlayTrigger>
      ),
      center: true,
      width: '115px',
    },
    {
      name: <RenderNameDataTable name='Ações' />,
      cell: (item) => (
        <ButtonDS
          size={'icon'}
          variant='primary'
          onClick={() => {
            setModalActionShow(true);
            setActiveCart(item);
          }}
        >
          <i className='bx bxs-file'></i>
        </ButtonDS>
      ),
      center: true,
      width: '115px',
    },
  ]);

  useEffect(() => {
    if (filterParams) {
      fetchData();
    }
  }, [currentPage, perPage]);

  useEffect(() => {
    if (filterParams) {
      setCurrentPage(0);
      fetchData();
      fetchTotalOffers();
      setShowCalendar(false);
    }
  }, [filterParams]);

  return (
    <>
      <section id='page-abandoned-cart'>
        <PageTitle title='Carrinho Abandonado' />
        <div>
          <FilterListing
            setFilterParams={setFilterParams}
            pageFilter={'abandonedCart'}
            calendar={true}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            configData={{
              start: moment().subtract(29, 'days'),
              end: moment().format(`DD/MM/YYYY`),
              option: 5,
            }}
          />
        </div>

        <Row>
          <SaleStatusSummary
            loading={loading}
            fieldName='total_abandoned_cart'
            mainValue={totalRowsFormatted}
            subInformation='Carrinhos abandonados'
            isCurrency={false}
          />
          <SaleStatusSummary
            loading={loadingTotalOffers}
            fieldName='total_offer'
            mainValue={totalOffers}
            subInformation='Total das ofertas'
          />
        </Row>

        <Row className='justify-content-end mb-4 px-3'>
          <ButtonDS
            onClick={handleExport}
            variant='success'
            disabled={loading || loadingBtn}
            size='sm'
            iconLeft={'bxs-file-export'}
          >
            {loadingBtn ? 'Exportando...' : 'Exportar'}
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
        </Row>

        <Row>
          <Col>
            <div className='container-datatable card'>
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: false,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columns()}
                data={records}
                striped
                highlightOnHover
                progressPending={loading}
                progressComponent={
                  <Loader title='Carregando carrinho abandonado...' />
                }
                noDataComponent={<NoDataComponentContent />}
                paginationRowsPerPageOptions={[10, 20, 50]}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
              />
            </div>
          </Col>
        </Row>
      </section>

      {modalActionShow && (
        <ModalGeneric
          show={modalActionShow}
          setShow={() => setModalActionShow(!modalActionShow)}
          title={'Detalhes do Carrinho Abandonado'}
          size='md'
          centered
        >
          <ModalAbandonedCart activeCart={activeCart} />
        </ModalGeneric>
      )}

      {showModalLink && (
        <ModalGeneric
          show={showModalLink}
          setShow={handleModalLink}
          title={'Selecione o modelo de Checkout'}
          size='md'
          centered
        >
          <ModalSelect3Steps
            urlCheckout={urlCheckout}
            handleCopyLink={handleCopyLink}
            product={{
              available_checkout_link_types: 'all',
            }}
          />
        </ModalGeneric>
      )}
    </>
  );
};

export default PageAbandonedCart;

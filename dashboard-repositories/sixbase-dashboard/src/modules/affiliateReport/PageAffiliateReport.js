import { useEffect, useState } from "react";
import FilterListing from "../../jsx/components/FilterListing";
import PageTitle from "../../jsx/layouts/PageTitle";
import moment from "moment";
import { Col, Row} from "react-bootstrap";
import DataTable from "react-data-table-component";
import NoDataComponentContent from "../NoDataComponentContent";
import Loader from "../../utils/loader";
import api from "../../providers/api";
import ButtonDS from "../../jsx/components/design-system/ButtonDS";
import RenderNameDataTable from "../../jsx/components/RenderNameDataTable";
import memoizeOne from "memoize-one";
import ModalGeneric from "../../jsx/components/ModalGeneric";
import ModalAffiliateReport from "./ModalAffiliateReport";

const PageAffiliateReport = () => {
  const [filterParams, setFilterParams] = useState();
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState([]);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [records, setRecords] = useState([]);
  const [modalActionShow, setModalActionShow] = useState(false);
  const [activeAffiliate, setActiveAffiliate] = useState(null);

  useEffect(() => {
    if (filterParams) {
      fetchData();
      setShowCalendar(false);
    }
  }, [currentPage, perPage, filterParams]);

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

  const fetchPage = () => {
    fetchData();
    setShowCalendar(false);
  };

  const columns = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Nome' iconClassName='bx bx-user' />,
      cell: (item) => item.full_name,
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Email' iconClassName='bx bx-mail-send' />,
      cell: (item) => item.email,
      width: '200px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Número de Vendas' iconClassName='bx bx-purchase-tag-alt' />,
      cell: (item) => item.email,
      width: '200px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Total em vendas' iconClassName='bx bx-dollar-circle' />,
      cell: (item) => item.email,
      width: '200px',
      sortable: true,
    },
    {
      name: <RenderNameDataTable name='Ações' />,
      cell: (item) => (
        <ButtonDS
          size={'icon'}
          variant='primary'
          onClick={() => {
            setModalActionShow(true);
            setActiveAffiliate(item);
          }}
        >
          <i className='bx bxs-file'></i>
        </ButtonDS>
      ),
      center: true,
      width: '115px',
    },
  ]);

  return (
    <>
     <section id='page-affiliate-report'>
      <PageTitle title='Relatório de Afiliados' />
      <div>
        <FilterListing
          setFilterParams={setFilterParams}
          pageFilter={'affiliateReport'}
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
        <Row className='justify-content-end'>
                <Col
                  xs={2}
                  className='col-export d-flex justify-content-end mb-4'
                >
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
                progressComponent={<Loader title='Carregando carrinho abandonado...' />}
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
          setShow={()=>setModalActionShow(!modalActionShow)}
          title={'Detalhes do Relatório de Afiliados'}
          size='md'
          centered
        >
         <ModalAffiliateReport activeAffiliate={activeAffiliate} />
        </ModalGeneric>
      )}
    </>);
};
export default PageAffiliateReport;

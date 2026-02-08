import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { currency } from '../../modules/functions';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import FilterListing from '../../jsx/components/FilterListing';
import Loader from '../../utils/loader';
import DataTable from 'react-data-table-component';
import formatDate from '../../utils/formatters';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import memoizeOne from 'memoize-one';
import NoDataComponentContent from '../NoDataComponentContent';

const columns = memoizeOne((renderPlugin, renderActions) => [
  {
    name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
    cell: (item) => (
      <>
        {item.product.name}
        <br />
        {formatDate(item.created_at)}
      </>
    ),
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Cliente' iconClassName='bx bx-user' />,
    cell: (item) => (
      <>
        {item.receiver.full_name} <br /> {item.receiver.document}
      </>
    ),
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Tipo' iconClassName='bx bx-tag' />,
    cell: (item) => item.type.label,

    sortable: true,
  },
  {
    name: (
      <RenderNameDataTable name='Preço' iconClassName='bx bx-dollar-circle' />
    ),
    cell: (item) => currency(item.price),
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Automação' iconClassName='bx bx-cube' />,
    cell: (item) => renderPlugin(item.plugin),
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
    cell: (item) => renderActions(item),
    sortable: true,
    center: true,
  },
]);

const PageInvoices = () => {
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterParams, setFilterParams] = useState(null);

  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filterParams, currentPage]);

  const fetchData = () => {
    api
      .get(`/invoices?size=${perPage}&page=${currentPage}`, {
        params: filterParams,
      })
      .then((response) => {
        setRecords(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch(() => {});
  };

  const renderPlugin = (item) => {
    return <>{item ? <span>{item.name}</span> : <span>-</span>}</>;
  };

  const renderActions = (item) => {
    return (
      <>
        {item.type.type === 'receipt' && (
          <ButtonDS
            size={'icon'}
            variant='primary'
            onClick={() => {
              printReceipt(item);
            }}
            title='Imprimir Recibo'
          >
            <i className='bx bxs-file'></i>
          </ButtonDS>
        )}
      </>
    );
  };

  const printReceipt = (item) => {
    api
      .get(`/invoices/${item.uuid}/print`, { responseType: 'blob' })
      .then((blob) => {
        const fileURL = window.URL.createObjectURL(blob.data);
        window.open(fileURL);
      })
      .catch(() => {});
  };

  const exportUrl = () => {
    return '/invoices/xls/?start_date=2020-02-01&end_date=2021-11-11';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  return (
    <>
      <section id='page-invoices'>
        <PageTitle title='Notas Fiscais - Recibos' />
        <div>
          <FilterListing
            pageFilter={'invoices'}
            exportUrl={exportUrl()}
            filterParams={filterParams}
            setFilterParams={setFilterParams}
          />
        </div>
        <Row>
          <Col>
            <div className='container-datatable card'>
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columns(renderPlugin, renderActions)}
                data={records}
                striped
                highlightOnHover
                progressComponent={<Loader title='Carregando afiliados...' />}
                noDataComponent={<NoDataComponentContent />}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
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
    </>
  );
};

export default PageInvoices;

import { useEffect, useState } from 'react';
import api from '../../../providers/api';
import 'react-datepicker/dist/react-datepicker.css';
import './modal-offer.scss';
import './modal-abandoned.scss';
import DataTable from 'react-data-table-component';
import Loader from '../../../utils/loader';
import formatDate from '../../../utils/formatters';
import { useProduct } from '../../../providers/contextProduct';
import RenderNameDataTable from '../../../jsx/components/RenderNameDataTable';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import NoDataComponentContent from '../../NoDataComponentContent';

const columns = [
  {
    name: <RenderNameDataTable name='Nome' iconClassName='bx bx-user' />,
    cell: (item) => item.full_name,
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='Email' iconClassName='bx bx-envelope' />,
    cell: (item) => item.email,
    sortable: true,
  },
  {
    name: <RenderNameDataTable name='WhatsApp' iconClassName='bx bxs-phone' />,
    cell: (item) => (
      <ButtonDS variant='link'>
        <a
          href={`https://wa.me/55${item.whatsapp.match(/\d+/g).join('')}`}
          target='_blank'
          rel='noreferrer'
        >
          {item.whatsapp}
        </a>
      </ButtonDS>
    ),
    sortable: true,
    maxWidth: '180px',
  },
  {
    name: (
      <RenderNameDataTable name='Data' iconClassName='bx bx-calendar-week' />
    ),
    cell: (item) => formatDate(item.updated_at),
    sortable: true,
    maxWidth: '180px',
  },
];

const ModalAbandoned = ({ activeOffer }) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const { product } = useProduct();

  const [records, setRecords] = useState([]);

  const fetchData = () => {
    setLoading(true);

    api
      .get(
        `/cart/abandoned/${activeOffer.uuid}?size=${perPage}&page=${currentPage}`
      )
      .then((response) => {
        setTotalRows(response.data.count);
        setRecords(response.data.rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  return (
    <>
      <div className='cart-info mb-3'>
        <div className='wrap'>
          <span>Produto:</span> {product.name}
        </div>
        <div className='wrap'>
          <span>Oferta:</span> {activeOffer.name}
        </div>
      </div>

      <DataTable
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: true,
          selectAllRowsItemText: 'Todos',
        }}
        columns={columns}
        data={records}
        striped
        highlightOnHover
        progressPending={loading}
        progressComponent={
          <Loader title='Carregando carrinhos abandonados...' />
        }
        noDataComponent={<NoDataComponentContent />}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
      />
    </>
  );
};

export default ModalAbandoned;

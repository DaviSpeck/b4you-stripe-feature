import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { currency } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';

const columns = [
  {
    name: 'Nome',
    selector: 'name',
    sortable: true,
    wrap: true,
  },
  {
    name: 'Preço',
    selector: 'price',
    sortable: true,
    width: '130px',
    wrap: true,
    cell: (row) => {
      return (
        <div style={{ lineHeight: '19px' }}>
          {row.price === 0
            ? 'Disponível ao acessar checkout.'
            : currency(row.price)}
        </div>
      );
    },
  },
  {
    name: 'Link',
    center: true,
    sortable: true,
    width: '80px',
    cell: (row) => {
      return (
        <a key={row.uuid} target='_blank' href={row.url} rel='noreferrer'>
          <Button size={'xs'} className='mr-1 sharp' variant='info'>
            <i className='fa fa-link'></i>
          </Button>
        </a>
      );
    },
  },
];

const ModalCoproductionOffer = ({
  show,
  setShow,
  centered = false,
  activeCoproduction,
}) => {
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [objectData, setObjectData] = useState([]);

  const fetchData = () => {
    setLoading(true);
    api
      .get(
        `/products/coproductions/links/${activeCoproduction.uuid}?page=${currentPage}&size=${perPage}`
      )
      .then((response) => {
        setTotalRows(response.data.count);
        setObjectData(response.data.rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, perPage]);

  return (
    <ModalGeneric
      show={show}
      size={'md'}
      setShow={setShow}
      centered={centered}
      title='Ofertas do produto'
      id='modal-coproduction-offer'
    >
      <DataTable
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: true,
          selectAllRowsItemText: 'Todos',
        }}
        columns={columns}
        data={objectData}
        striped
        highlightOnHover
        progressPending={loading}
        progressComponent={<Loader title='Carregando ofertas...' />}
        noDataComponent={<NoDataComponentContent />}
        pagination
        paginationServer
        paginationRowsPerPageOptions={[10]}
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
      />
    </ModalGeneric>
  );
};

export default ModalCoproductionOffer;

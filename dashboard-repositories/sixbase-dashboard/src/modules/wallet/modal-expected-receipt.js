import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import api from '../../providers/api';
import formatDate from '../../utils/formatters';
import Loader from '../../utils/loader';
import { currency } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import './style.scss';

const columns = memoizeOne(() => [
  {
    name: <RenderNameDataTable name='Data' color='#929597' />,
    selector: (item) => (
      <span>{formatDate(item.release_date, 'DD/MM/YYYY')}</span>
    ),
  },
  {
    name: <RenderNameDataTable name='Valor' color='#929597' />,
    selector: (item) => <span>{currency(item.amount)}</span>,
  },
]);

const ModalExpectedReceipt = () => {
  const [records, setRecords] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const fetchUserBalance = async () => {
    try {
      setRequesting(true);

      const { data } = await api.get('/users/balance', {
        params: {
          page: currentPage,
          size: perPage,
        },
      });

      setRecords(data.data);
      setTotalRows(data.total);
    } catch (error) {
      return error;
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    fetchUserBalance();
  }, [currentPage, perPage]);

  return (
    <div>
      <DataTable
        className='dataTables_wrapper'
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: true,
          selectAllRowsItemText: 'Todos',
        }}
        data={records}
        columns={columns()}
        striped
        highlightOnHover
        progressPending={requesting}
        progressComponent={
          <div className='p-4'>
            <Loader title='Carregando lançamentos futuros...' />
          </div>
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
    </div>
  );
};

export default ModalExpectedReceipt;

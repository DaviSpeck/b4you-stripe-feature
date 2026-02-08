import DataTable from 'react-data-table-component';
import Loader from '../../../utils/loader';
import NoDataComponentContent from '../../NoDataComponentContent';
import { columns } from './columns';

const DataTableRankingAffiliations = ({
  currentPage,
  setCurrentPage,
  perPage,
  setPerPage,
  openModal,
  setOpenModal,
  setSelectedUser,
  affiliations,
  loading,
  totalRows,
}) => {
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage) => {
    setPerPage(newPerPage);
  };

  return (
    <DataTable
      paginationComponentOptions={{
        rowsPerPageText: 'Linhas por página',
        rangeSeparatorText: 'de',
        selectAllRowsItem: true,
        selectAllRowsItemText: 'Todos',
      }}
      columns={columns({
        currentPage,
        perPage,
        openModal,
        setOpenModal,
        setSelectedUser,
      })}
      data={affiliations}
      striped
      highlightOnHover
      progressPending={loading}
      progressComponent={<Loader title='Carregando ranking...' />}
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
  );
};

export default DataTableRankingAffiliations;

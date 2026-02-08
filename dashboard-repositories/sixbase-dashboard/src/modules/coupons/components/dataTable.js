import DataTable from 'react-data-table-component';
import Loader from '../../../utils/loader';
import NoDataComponentContent from '../../NoDataComponentContent';

const DataTableRankingCoupons = ({
  columns,
  data,
  loading,
  totalRows,
  perPage,
  currentPage,
  setCurrentPage,
  setPerPage,
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
      columns={columns}
      data={data}
      striped
      highlightOnHover
      progressPending={loading}
      progressComponent={<Loader title='Carregando dados...' />}
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

export default DataTableRankingCoupons;

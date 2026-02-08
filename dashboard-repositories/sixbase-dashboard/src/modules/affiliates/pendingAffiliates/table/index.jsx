import DataTable from 'react-data-table-component';
import { tableColumns } from './columns';
import Loader from '../../../../utils/loader';
import NoDataComponentContent from '../../../NoDataComponentContent';

export const PendingAfiiliatesTable = (props) => {
  const {
    tableData,
    perPage,
    totalRows,
    isLoading,
    isLoadingLineAction,
    onPageChange,
    onPageSize,
    onRefresh,
    onLoadingLineAction,
  } = props;

  return (
    <div style={{ height: 'auto' }} className='container-datatable card'>
      <DataTable
        columns={tableColumns({
          onRefresh,
          isLoading: isLoadingLineAction,
          onLoading: onLoadingLineAction,
        })}
        data={tableData}
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: false,
        }}
        striped
        highlightOnHover
        progressPending={isLoading}
        progressComponent={<Loader title='Carregando afiliados...' />}
        noDataComponent={<NoDataComponentContent />}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        onChangeRowsPerPage={onPageSize}
        onChangePage={onPageChange}
        responsive
      />
    </div>
  );
};

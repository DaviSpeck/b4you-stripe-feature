import DataTable from 'react-data-table-component';
import Loader from '../../../utils/loader';
import NoDataComponentContent from '../../NoDataComponentContent';
import { getSubscriptionColumns } from './subscriptionColumns';

const SubscriptionsTable = ({
  records,
  loading,
  totalRows,
  perPage,
  onPageChange,
  onPerRowsChange,
  renderPlan,
  renderPrice,
  renderViewDetails,
}) => {
  const columns = getSubscriptionColumns(
    renderPlan,
    renderPrice,
    renderViewDetails
  );

  return (
    <div className='container-datatable'>
      <DataTable
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: true,
          selectAllRowsItemText: 'Todos',
        }}
        data={records}
        columns={columns}
        striped
        highlightOnHover
        progressPending={loading}
        progressComponent={<Loader title='Carregando assinaturas...' />}
        noDataComponent={<NoDataComponentContent />}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        onChangeRowsPerPage={onPerRowsChange}
        onChangePage={onPageChange}
      />
    </div>
  );
};

export default SubscriptionsTable;

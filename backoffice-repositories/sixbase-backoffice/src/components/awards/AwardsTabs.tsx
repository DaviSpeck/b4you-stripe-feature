import { FC } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { AwardsTabsProps } from '../../interfaces/awards.interface';

const AwardsTabs: FC<AwardsTabsProps> = ({
  activeTab,
  pendingProducers,
  sentProducers,
  pendingTotal,
  sentTotal,
  loading,
  skin,
  pendingColumns,
  sentColumns,
  onPendingPageChange,
  onPendingRowsPerPageChange,
  onSentPageChange,
  onSentRowsPerPageChange,
}) => {
  return (
    <TabContent activeTab={activeTab}>
      <TabPane tabId="pending">
        <DataTable
          columns={pendingColumns}
          data={pendingProducers}
          pagination
          progressPending={loading}
          progressComponent={<span>Carregando...</span>}
          paginationServer
          paginationTotalRows={pendingTotal}
          onChangePage={onPendingPageChange}
          onChangeRowsPerPage={onPendingRowsPerPageChange}
          paginationComponentOptions={{
            noRowsPerPage: true,
            rangeSeparatorText: 'de',
          }}
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          noDataComponent={
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                Nenhuma recompensa pendente para este marco
              </p>
            </div>
          }
        />
      </TabPane>

      <TabPane tabId="sent">
        <DataTable
          columns={sentColumns}
          data={sentProducers}
          pagination
          progressPending={loading}
          progressComponent={<span>Carregando...</span>}
          paginationServer
          paginationTotalRows={sentTotal}
          onChangePage={onSentPageChange}
          onChangeRowsPerPage={onSentRowsPerPageChange}
          paginationComponentOptions={{
            noRowsPerPage: true,
            rangeSeparatorText: 'de',
          }}
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          noDataComponent={
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                Nenhuma recompensa enviada para este marco
              </p>
            </div>
          }
        />
      </TabPane>
    </TabContent>
  );
};

export default AwardsTabs;

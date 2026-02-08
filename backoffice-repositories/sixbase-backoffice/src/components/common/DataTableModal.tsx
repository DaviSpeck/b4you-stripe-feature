import { FC } from 'react';
import DataTable from 'react-data-table-component';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { useSkin } from '../../utility/hooks/useSkin';

export interface DataTableModalProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  description?: string;
  columns: any[];
  data: any[];
  loading?: boolean;
  pagination?: boolean;
  paginationServer?: boolean;
  paginationTotalRows?: number;
  paginationDefaultPage?: number;
  paginationPerPage?: number;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (perPage: number, page: number) => void;
  paginationRowsPerPageOptions?: number[];
  noDataComponent?: string;
  size?: 'sm' | 'lg' | 'xl';
}

const DataTableModal: FC<DataTableModalProps> = ({
  isOpen,
  onToggle,
  title,
  description,
  columns,
  data,
  loading = false,
  pagination = true,
  paginationServer = false,
  paginationTotalRows,
  paginationDefaultPage,
  paginationPerPage,
  onChangePage,
  onChangeRowsPerPage,
  paginationRowsPerPageOptions,
  noDataComponent = 'Nenhum registro encontrado',
  size = 'xl',
}) => {
  const { skin } = useSkin();

  return (
    <Modal
      isOpen={isOpen}
      toggle={onToggle}
      size={size}
      centered
      style={{
        maxWidth: 'calc(100vw - 280px)',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
      contentClassName="modal-content-container"
    >
      <ModalHeader toggle={onToggle}>{title}</ModalHeader>
      <ModalBody>
        {description && <p className="mb-2">{description}</p>}
        <DataTable
          className="mb-2"
          columns={columns}
          data={data}
          progressPending={loading}
          pagination={pagination}
          paginationServer={paginationServer}
          paginationTotalRows={paginationTotalRows}
          paginationDefaultPage={paginationDefaultPage}
          paginationPerPage={paginationPerPage}
          onChangePage={onChangePage}
          onChangeRowsPerPage={onChangeRowsPerPage}
          paginationRowsPerPageOptions={paginationRowsPerPageOptions}
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página:',
            rangeSeparatorText: 'de',
          }}
          noDataComponent={noDataComponent}
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
        />
      </ModalBody>
    </Modal>
  );
};

export default DataTableModal;

import { useEffect, useState, FC } from 'react';
import { api } from '../../services/api';
import { Spinner, Modal, ModalHeader, ModalBody } from 'reactstrap';
import memoizeOne from 'memoize-one';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import {
  BlockRecord,
  ApiResponse,
  SelectedDetails,
} from '../../interfaces/reports.interface';
import { useSkin } from '../../utility/hooks/useSkin';

const Blocks: FC = () => {
  const [records, setRecords] = useState<BlockRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [recordsCount, setRecordsCount] = useState<number>(0);
  const [recordsPerPage, setRecordsPerPage] = useState<number>(10);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] =
    useState<SelectedDetails | null>(null);
  const { skin } = useSkin();

  useEffect(() => {
    fetchData();
  }, []);

  const toggleModal = (details: SelectedDetails | null): void => {
    setSelectedDetails(details);
    setModalOpen(!modalOpen);
  };

  const fetchData = async (
    page: number = 0,
    newPerPage: number | null = null,
  ): Promise<void> => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append(
        'size',
        (newPerPage ? newPerPage : recordsPerPage).toString(),
      );
      const response = await api.get<ApiResponse>(`blocks?${query.toString()}`);
      setRecords(response.data.rows);
      setRecordsCount(response.data.count);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordsPerPageChange = async (
    newPerPage: number,
    page: number,
  ): Promise<void> => {
    await fetchData(page - 1, newPerPage);
    setRecordsPerPage(newPerPage);
  };

  const handleRecordsPageChange = (page: number): void => {
    fetchData(page - 1);
  };

  const columns = memoizeOne(() => [
    {
      name: 'ID',
      cell: (row: BlockRecord) => row.id,
      width: '60px',
    },
    {
      name: 'Bloqueio por',
      cell: (row: BlockRecord) => row.type,
    },
    {
      name: 'Oferta',
      cell: (row: BlockRecord) => (
        <a
          href={`https://checkout.b4you.com.br/${row.body.offer_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {`Ver Oferta - ${row.body.offer_id}`}
        </a>
      ),
    },
    {
      name: 'Email',
      width: '220px',
      cell: (row: BlockRecord) => row.email,
    },
    {
      name: 'Nome',
      width: '180px',
      cell: (row: BlockRecord) => row.full_name,
    },
    {
      name: 'CPF',
      cell: (row: BlockRecord) => row.document_number,
    },
    {
      name: 'Telefone',
      cell: (row: BlockRecord) => row.phone,
    },
    {
      name: 'Ip',
      cell: (row: BlockRecord) => row.ip,
    },
    {
      name: 'Criado em',
      width: '170px',
      cell: (row: BlockRecord) =>
        moment(row.created_at).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      name: 'Detalhes',
      width: '110px',
      cell: (row: BlockRecord) => (
        <button
          onClick={() =>
            toggleModal({
              body: row.body,
              address: row.address,
              cookies: row.cookies,
            })
          }
          className="btn btn-link"
        >
          Ver
        </button>
      ),
    },
  ]);

  return (
    <div>
      <div>
        <DataTable
          columns={columns()}
          data={records}
          progressPending={loading}
          progressComponent={<Spinner />}
          noDataComponent={<>Não há resultado</>}
          paginationServer
          theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
          pagination
          paginationTotalRows={recordsCount}
          onChangeRowsPerPage={handleRecordsPerPageChange}
          onChangePage={handleRecordsPageChange}
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página:',
            rangeSeparatorText: 'de',
            noRowsPerPage: false,
          }}
        />
        <Modal isOpen={modalOpen} toggle={() => toggleModal(null)}>
          <ModalHeader toggle={() => toggleModal(null)}>Detalhes</ModalHeader>
          <ModalBody>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontWeight: 'bold',
              }}
            >
              {selectedDetails
                ? JSON.stringify(selectedDetails, null, 2)
                : 'Nenhum detalhe disponível.'}
            </pre>
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default Blocks;

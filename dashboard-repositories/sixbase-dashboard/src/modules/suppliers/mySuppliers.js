import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import { notify } from '../../modules/functions';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import { ModalMySuppliersProducts } from './modalMySuppliersProducts';

export const MySuppliers = () => {
  const [requesting, setRequesting] = useState(false);
  const [records, setRecords] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const columns = memoizeOne(() => [
    {
      name: (
        <RenderNameDataTable name='Fornecedor' iconClassName='bx bx-cube' />
      ),
      cell: (item) => item.full_name,
    },
    {
      name: (
        <RenderNameDataTable name='E-mail' iconClassName='bx bx-envelope' />
      ),
      cell: (item) => item.email,
    },
    {
      name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
      cell: (item) => {
        return (
          <div className='d-flex align-items-center'>
            <ButtonDS
              size='icon'
              variant='primary'
              onClick={() => {
                setOpenModal(!openModal);
                setSelectedRecord(item);
              }}
            >
              <i class='bx bxs-file'></i>
            </ButtonDS>
          </div>
        );
      },
      center: true,
    },
  ]);

  const fetchData = async () => {
    try {
      setRequesting(true);

      const { data } = await api.get('suppliers/mySuppliers');
      setRecords(data);
    } catch (error) {
      notify({
        message: 'Erro ao buscar as ofertas do produto',
        type: 'error',
      });

      return error;
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <DataTable
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: true,
          selectAllRowsItemText: 'Todos',
        }}
        columns={columns()}
        data={records}
        striped
        highlightOnHover
        progressPending={requesting}
        progressComponent={
          <div className='p-4'>
            <Loader title='Carregando...' />
          </div>
        }
        noDataComponent={<NoDataComponentContent />}
        responsive
      />

      {openModal && (
        <ModalMySuppliersProducts
          openModal={openModal}
          setOpenModal={setOpenModal}
          user={selectedRecord}
        />
      )}
    </>
  );
};

import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import { ModalMySuppliersOffers } from './modalMySuppliersOffers';

export const ModalMySuppliersProducts = ({ openModal, setOpenModal, user }) => {
  const [requesting, setRequesting] = useState(true);
  const [openModalOffer, setOpenModalOffer] = useState(false);
  const [productSelected, setProductSelected] = useState(null);
  const [records, setRecords] = useState([]);

  const columns = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
      cell: (item) => item.product_name,
    },
    {
      name: 'Ações',
      cell: (item) => {
        return (
          <div className='d-flex align-items-center'>
            <ButtonDS
              size='icon'
              variant='primary'
              onClick={() => {
                setOpenModalOffer(!openModalOffer);
                setProductSelected(item);
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

      const { data } = await api.get(
        `suppliers/mySuppliers/products/${user.id}`
      );

      setRecords(data);
    } catch (error) {
      return error;
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ModalGeneric
      title={`${user.full_name}`}
      show={openModal}
      setShow={setOpenModal}
      id='modal-calendar'
      centered
      size='xl'
    >
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

      {openModalOffer && (
        <ModalMySuppliersOffers
          openModal={openModalOffer}
          setOpenModal={setOpenModalOffer}
          user={user}
          productSelected={productSelected}
        />
      )}
    </ModalGeneric>
  );
};

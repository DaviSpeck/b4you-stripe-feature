import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import { ModalOffers } from './modalOffers';

const Suppliers = () => {
  const [requesting, setRequesting] = useState(true);
  const [records, setRecords] = useState([]);
  const [product, setProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const columns = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
      cell: (item) => item.product_name,
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
                setProduct(item);
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

  const fetchData = () => {
    setRequesting(true);
    api
      .get(`/suppliers/group`)
      .then((r) => {
        setRecords(r.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
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
        <ModalOffers
          openModal={openModal}
          setOpenModal={setOpenModal}
          product={product}
        />
      )}
    </>
  );
};

export default Suppliers;

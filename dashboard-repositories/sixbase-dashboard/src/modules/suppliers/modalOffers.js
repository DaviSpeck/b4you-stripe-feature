import { Divider } from '@material-ui/core';
import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import { currency, notify } from '../../modules/functions';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';

export const ModalOffers = ({ openModal, setOpenModal, product }) => {
  const [supplierDefault, setSupplierDefault] = useState(null);
  const [requesting, setRequesting] = useState(true);
  const [records, setRecords] = useState([]);

  const columns = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Oferta' iconClassName='bx bx-cube' />,
      cell: (item) => item.offer_name,
    },
    {
      name: (
        <RenderNameDataTable name='Comissão' iconClassName='bx bx-dollar' />
      ),
      cell: (item) => currency(item.amount),
    },
    {
      name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
      cell: (item) => (
        <BadgeDS variant={item.status.key}>{item.status.label}</BadgeDS>
      ),
    },
    {
      name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
      cell: (item) => {
        const changeSupplierStatus = (status) => {
          api
            .put(`/suppliers`, { id: item.id, status: status })
            .then((response) => {
              const updatedStatus = response.data.status;
              setRecords((prevRecords) => {
                const newRecords = prevRecords.map((record) =>
                  record.id === item.id
                    ? { ...record, status: updatedStatus }
                    : record
                );
                return newRecords;
              });
              if (status === 2) {
                notify({ message: `Solicitação aceita`, type: 'success' });
              } else {
                notify({ message: `Cancelado com sucesso`, type: 'success' });
              }
            })
            .catch(() => {
              if (status === 2) {
                notify({
                  message: `Falha ao aceitar solicitação`,
                  type: 'error',
                });
              } else {
                notify({
                  message: `Falha ao cancelar solicitação`,
                  type: 'error',
                });
              }
            });
        };

        return (
          <div>
            {item.status.id === 1 && (
              <div className='d-flex align-items-center'>
                <ButtonDS
                  size='icon'
                  variant='success'
                  onClick={() => changeSupplierStatus(2)}
                >
                  <i class='bx bx-check'></i>
                </ButtonDS>
                <ButtonDS
                  size='icon'
                  variant='danger'
                  className={'ml-1'}
                  onClick={() => changeSupplierStatus(3)}
                >
                  <i class='bx bx-x'></i>
                </ButtonDS>
              </div>
            )}
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
        `suppliers/products/${product.id_product}`
      );

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

  const fetchSupplierDefault = async () => {
    try {
      setRequesting(true);

      const { data } = await api.get(
        `suppliers/verifyProductDefault/${product.id_product}`
      );

      if (data.length > 0) {
        setSupplierDefault(data[0]);
      } else {
        setSupplierDefault(null);
      }
    } catch (error) {
      notify({
        message: 'Erro ao verificar convite de fornecedor padrão',
        type: 'error',
      });

      return error;
    } finally {
      setRequesting(false);
    }
  };

  const acceptSupplierDefault = async () => {
    try {
      setRequesting(true);

      await api.put(
        `/suppliers/default/${supplierDefault.id}/${supplierDefault.id_product}/accept`
      );

      notify({
        message: 'Convite aceito com sucesso',
        type: 'success',
      });

      await fetchData();
      await fetchSupplierDefault();
    } catch (error) {
      notify({
        message: 'Erro ao aceitar convite de fornecedor padrão',
        type: 'error',
      });

      return error;
    } finally {
      setRequesting(false);
    }
  };

  const rejectSupplierDefault = async () => {
    try {
      setRequesting(true);

      await api.put(
        `/suppliers/default/${supplierDefault.id}/${supplierDefault.id_product}/reject`
      );

      notify({
        message: 'Convite rejeitado com sucesso',
        type: 'success',
      });

      await fetchData();
      await fetchSupplierDefault();
    } catch (error) {
      notify({
        message: 'Erro ao rejeitar convite de fornecedor padrão',
        type: 'error',
      });

      return error;
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSupplierDefault();
  }, []);

  return (
    <ModalGeneric
      title={`Produto: ${product.product_name}`}
      show={openModal}
      setShow={setOpenModal}
      id='modal-calendar'
      centered
      size='xl'
    >
      {supplierDefault && !requesting && (
        <>
          <div>
            <p className='text-muted'>
              Você recebeu um convite para se tornar fornecedor padrão desse
              produto. Ao aceitar, você se tornará fornecedor de todas as
              ofertas vinculadas.
            </p>

            <p className='text-muted'>
              Status da solicitação:{' '}
              <BadgeDS size='sm' variant={supplierDefault.status.key}>
                {supplierDefault.status.label}
              </BadgeDS>
            </p>

            {supplierDefault.status.id === 1 && (
              <div className='d-flex'>
                <ButtonDS
                  className='mr-2'
                  size='sm'
                  variant='success'
                  onClick={acceptSupplierDefault}
                >
                  Aceitar
                </ButtonDS>

                <ButtonDS
                  size='sm'
                  variant='danger'
                  onClick={rejectSupplierDefault}
                >
                  Rejeitar
                </ButtonDS>
              </div>
            )}
          </div>

          <Divider className='mt-4 mb-3' />
        </>
      )}

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
        noDataComponent={
          <NoDataComponentContent text='Sem ofertas vinculadas como fornecedor' />
        }
        responsive
      />
    </ModalGeneric>
  );
};

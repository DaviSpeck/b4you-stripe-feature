import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import CurrencyInput from 'react-currency-input';
import DataTable from 'react-data-table-component';
import Switch from 'react-switch';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import { notify } from '../functions';

export const ModalMySuppliersOffers = ({
  openModal,
  setOpenModal,
  user,
  productSelected,
}) => {
  const [requesting, setRequesting] = useState(true);
  const [records, setRecords] = useState([]);

  const columns = memoizeOne(() => [
    {
      name: <RenderNameDataTable name='Oferta' iconClassName='bx bx-cube' />,
      cell: (item) => item.offer_name,
      width: '300px',
    },
    {
      name: `Comissão`,
      cell: (item) => {
        const [edit, setEdit] = useState(false);
        const [valueNewAmount, setValueNewAmount] = useState(item.amount);

        const newAmount = () => {
          api
            .put(
              `/products/offers/${productSelected.product_uuid}/${item.offer_uuid}/suppliers/${item.id}`,
              {
                amount: valueNewAmount,
                receives_shipping_amount: item.receives_shipping_amount,
              }
            )
            .then(() => {
              user.amount = valueNewAmount;

              notify({
                message: 'Sucesso ao alterar comissão',
                type: 'success',
              });
            })
            .catch(() => {
              notify({
                message: 'Falha ao alterar comissão',
                type: 'error',
              });
            })
            .finally(() => setEdit(false));
        };

        return (
          <div className='d-flex justify-content-between w-100'>
            <div className='d-flex align-items-center'>
              {!edit ? (
                <>
                  <div
                    className='d-flex'
                    style={{
                      minWidth: 20,
                    }}
                  >
                    R$
                  </div>
                  {valueNewAmount}
                </>
              ) : (
                <>
                  <CurrencyInput
                    className='form-control'
                    name='value_supplier'
                    placeholder={item.amount}
                    value={valueNewAmount}
                    decimalsLimit={2}
                    decimalSeparator=','
                    groupSeparator='.'
                    prefix='R$ '
                    onChange={(_, value) => {
                      setValueNewAmount(value);
                    }}
                  />
                </>
              )}
            </div>
            <div className='d-flex align-items-center'>
              {!edit ? (
                <ButtonDS
                  size={'icon'}
                  className='ml-2'
                  onClick={() => setEdit(true)}
                  outline
                  style={{ width: 22, height: 22 }}
                >
                  <i className='bx bxs-pencil' style={{ fontSize: 14 }}></i>
                </ButtonDS>
              ) : (
                <>
                  <ButtonDS
                    size={'icon'}
                    className='ml-2'
                    onClick={() => newAmount()}
                    outline
                    variant='success'
                    style={{ width: 22, height: 22 }}
                  >
                    <i className='bx bx-check'></i>
                  </ButtonDS>
                  <ButtonDS
                    size={'icon'}
                    className='ml-1'
                    onClick={() => setEdit(false)}
                    outline
                    variant='danger'
                    style={{ width: 22, height: 22 }}
                  >
                    <i className='bx bx-x'></i>
                  </ButtonDS>
                </>
              )}
            </div>
          </div>
        );
      },
      minWidth: '200px',
    },
    {
      name: `Recebe Frete`,
      cell: (item) => {
        const [receivesShipping, setReceivesShipping] = useState(
          item.receives_shipping_amount
        );
        const [loading, setLoading] = useState(false);

        const toggleShipping = () => {
          const newValue = !receivesShipping;
          setReceivesShipping(newValue);
          setLoading(true);

          api
            .put(
              `/products/offers/${productSelected.product_uuid}/${item.offer_uuid}/suppliers/${item.id}`,
              { receives_shipping_amount: newValue, amount: item.amount }
            )
            .then(() => {
              item.receives_shipping_amount = newValue;
              notify({
                message: 'Frete atualizado com sucesso',
                type: 'success',
              });
            })
            .catch(() => {
              // rollback state
              setReceivesShipping(!newValue);
              notify({
                message: 'Erro ao atualizar frete',
                type: 'error',
              });
            })
            .finally(() => setLoading(false));
        };

        return (
          <div className='d-flex align-items-center'>
            <Switch
              checked={receivesShipping}
              onChange={toggleShipping}
              disabled={loading}
              onColor='#4CAF50'
              offColor='#ccc'
              checkedIcon={false}
              uncheckedIcon={false}
              height={20}
              width={40}
            />
          </div>
        );
      },
      minWidth: '200px',
    },
    {
      name: `Status`,
      cell: ({ status }) => (
        <BadgeDS variant={status.key}>{status.label}</BadgeDS>
      ),
    },
    {
      name: `Remover`,
      cell: (item) => (
        <ButtonDS
          variant='danger'
          size='icon'
          onClick={() => {
            api
              .delete(
                `/products/offers/${productSelected.product_uuid}/${item.offer_uuid}/suppliers/${item.id}`
              )
              .then(() => {
                setRecords((prev) =>
                  prev.filter((element) => element.id !== item.id)
                );

                notify({
                  message: 'Sucesso ao remover fornecedor',
                  type: 'success',
                });
              })
              .catch(() => {
                notify({
                  message: 'Falha ao remover fornecedor',
                  type: 'error',
                });
              });
          }}
        >
          <i className='bx bx-trash-alt'></i>
        </ButtonDS>
      ),
      center: true,
    },
  ]);

  const fetchData = async () => {
    try {
      setRequesting(true);

      const { data } = await api.get(
        `suppliers/mySuppliers/offers/${user.id}/${productSelected.product_uuid}`
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
    </ModalGeneric>
  );
};

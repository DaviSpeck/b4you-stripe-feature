import { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { notify } from '../functions';
import FormSupplier from '../products/supplier/FormSupplier';
import { columns } from '../products/supplier/columns';

const SupplierContent = ({ productUuid }) => {
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSupplier = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/products/${productUuid}/suppliers/default`
      );

      setSuppliers(data);
    } catch (error) {
      notify({
        message: 'Erro ao buscar fornecedor padrão',
        type: 'error',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async () => {
    try {
      setLoading(true);

      await api.delete(
        `/products/${productUuid}/suppliers/default/${selectedSupplier.id}`
      );

      notify({
        message: 'Fornecedor padrão excluído com sucesso',
        type: 'success',
      });

      await fetchSupplier();
      setShowModalDelete(false);
    } catch (error) {
      notify({
        message: 'Erro ao excluir fornecedor padrão',
        type: 'error',
      });

      return error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productUuid) {
      fetchSupplier();
    }
  }, [productUuid]);

  return (
    <div>
      <Row>
        <Col md={12} className='mb-3'>
          <h4>Fornecedor</h4>
          <small>
            Cadastre/Edite um fornecedor padrão que será aplicado para todas as
            ofertas desse produto.
          </small>
        </Col>

        <Col md={12}>
          <Card>
            <Card.Body>
              {!loading ? (
                <>
                  {edit ? (
                    <FormSupplier
                      supplier={selectedSupplier}
                      setEdit={setEdit}
                      fetchSupplier={fetchSupplier}
                      uuidProduct={productUuid}
                    />
                  ) : (
                    <Col>
                      <div
                        className={`${
                          suppliers.length === 0
                            ? 'text-center d-flex flex-column justify-content-center align-items-center'
                            : ''
                        }`}
                      >
                        {suppliers.length > 0 ? (
                          <DataTable
                            columns={columns(
                              setEdit,
                              setShowModalDelete,
                              setSelectedSupplier
                            )}
                            data={suppliers}
                            striped
                          />
                        ) : (
                          <p className='mt-2'>
                            Não há fornecedor padrão cadastrado para esse
                            produto.
                          </p>
                        )}

                        <ButtonDS
                          size='md'
                          className='mt-3'
                          onClick={() => {
                            setEdit(true);
                            setSelectedSupplier(null);
                          }}
                        >
                          Adicionar Fornecedor
                        </ButtonDS>
                      </div>
                    </Col>
                  )}
                </>
              ) : (
                <Loader title='Carregando dados...' />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showModalDelete && (
        <ConfirmAction
          title={'Excluir Fornecedor do Produto'}
          show={showModalDelete}
          setShow={setShowModalDelete}
          handleAction={deleteSupplier}
          confirmText={selectedSupplier?.email}
          description={selectedSupplier?.email}
          centered
        />
      )}
    </div>
  );
};

export default SupplierContent;

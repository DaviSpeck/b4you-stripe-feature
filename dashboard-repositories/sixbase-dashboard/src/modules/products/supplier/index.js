import { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useParams } from 'react-router-dom';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import api from '../../../providers/api';
import Loader from '../../../utils/loader';
import { notify } from '../../functions';
import FormSupplier from './FormSupplier';
import { columns } from './columns';

const PageProductEditSupplier = () => {
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const { uuidProduct } = useParams();

  const fetchSupplier = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        `/products/${uuidProduct}/suppliers/default`
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
        `/products/${uuidProduct}/suppliers/default/${selectedSupplier.id}`
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
    fetchSupplier();
  }, []);

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

export default PageProductEditSupplier;

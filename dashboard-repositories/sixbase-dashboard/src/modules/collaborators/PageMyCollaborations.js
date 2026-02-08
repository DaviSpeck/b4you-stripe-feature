import { Fragment, useEffect, useState } from 'react';
import { Col, Row, Spinner, Table } from 'react-bootstrap';
import DataTable from '../../jsx/components/DataTable';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import { useCollaborator } from '../../providers/contextCollaborator';
import { useUser } from '../../providers/contextUser';
import formatDate from '../../utils/formatters';
import { notify } from '../functions';
import './style.scss';

export default function PageMyCollaborations() {
  const [modalPendingShow, setModalPendingShow] = useState(false);
  const [objectData, setObjectData] = useState({ data: [], columns: [] });
  const [requesting, setRequesting] = useState(true);
  const [pending, setPending] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [modalShowPermissions, setModalShowPermissions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { setCollaborator } = useCollaborator();
  const { setUser } = useUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setIsLoading(true);
    api
      .get('/collaborators/current-collaborations')
      .then((response) => {
        setRequesting(false);
        setDataTable(response.data);
      })
      .finally(() => setIsLoading(false));

    api.get('/collaborators/invites').then((response) => {
      setPending(response.data.rows);
    });
  };

  const setDataTable = (rows) => {
    let preparedData = [];
    rows.forEach((item) => {
      let newRow = [
        item.full_name,
        item.permissions && renderPermission(item.permissions),
        !item.is_current_account && renderActions(item),
      ];
      preparedData.push(newRow);
    });

    const object = {
      data: preparedData,
      columns: ['Colaborador', 'Permissões', 'Ações'],
    };

    setObjectData(object);
  };

  const renderPermission = (permission) => {
    return (
      <>
        <ButtonDS
          size={'icon'}
          variant='light'
          className='mr-2'
          onClick={() => {
            setModalShowPermissions(true);
            setPermissions(permission);
          }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <i className='bx bx-info-circle' style={{ fontSize: 18 }}></i>
        </ButtonDS>
      </>
    );
  };

  const renderActions = (collaborator) => {
    return (
      <>
        <ButtonDS
          size={'icon'}
          variant='primary'
          onClick={() => {
            changeAccountCollaborator(collaborator);
          }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <i className='bx bx-refresh'></i>
        </ButtonDS>
      </>
    );
  };

  const changeAccountCollaborator = (collaborator) => {
    api
      .put(`auth/change-account/${collaborator.uuid}`)
      .then((response) => {
        if (response?.data) {
          setUser(response.data);
        }
        fetchData();
        notify({
          message: 'Conta trocada com sucesso',
          type: 'success',
        });
        if (collaborator.original_account) {
          return setCollaborator(null);
        }
        setCollaborator(collaborator);
      })
      .catch(() => {
        notify({
          message: 'Falha ao trocar de conta',
          type: 'error',
        });
      });
  };

  const pendingResponse = (response, invite) => {
    setRequesting(true);

    api
      .put(`collaborators/${invite.uuid}/change-status/${response}`)
      .then(() => {
        setRequesting(false);
        fetchData();
        notify({
          message: response
            ? 'Convite aceito com sucesso'
            : 'Convite rejeitado com sucesso',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao executar ação',
          type: 'error',
        });
      });
  };

  return (
    <Fragment>
      <ModalGeneric
        show={modalPendingShow}
        setShow={setModalPendingShow}
        title={'Solicitações de colaborador pendentes'}
        centered
        size='xl'
        id='modal-pending'
      >
        <Table>
          <thead>
            <tr>
              <th>Produtor</th>
              <th>Permissões</th>
              <th>Criado em</th>
              <th className='text-center'>Aceitar ou Rejeitar</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((item) => {
              return (
                <tr key={item.uuid}>
                  <td>{item.producer_name}</td>
                  <td>
                    <ul>
                      {item.permissions.map((item) => {
                        return <li key={item.id}>{item.label}</li>;
                      })}
                    </ul>
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                  <td className='text-center'>
                    {!requesting ? (
                      <>
                        <div className='d-flex justify-content-center'>
                          <div className='mr-1'>
                            <ButtonDS
                              size={'icon'}
                              variant='success'
                              className='mr-4'
                              onClick={() => {
                                pendingResponse(true, item);
                              }}
                              style={{ fontSize: 20 }}
                            >
                              <i className='bx bxs-like'></i>
                            </ButtonDS>
                          </div>
                          <div>
                            <ButtonDS
                              size={'icon'}
                              variant='danger'
                              onClick={() => {
                                pendingResponse(false, item);
                              }}
                            >
                              <i className='bx bxs-dislike'></i>
                            </ButtonDS>
                          </div>
                        </div>
                      </>
                    ) : (
                      'aguarde...'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ModalGeneric>

      <ModalGeneric
        show={modalShowPermissions}
        setShow={setModalShowPermissions}
        title={'Permissões'}
        centered
      >
        <ul style={{ paddingLeft: 20 }}>
          {permissions.map((permission, index) => {
            return (
              <li key={index} style={{ listStyleType: 'disc' }}>
                {permission}
              </li>
            );
          })}
        </ul>
      </ModalGeneric>

      <section id='PageCollaborators'>
        <PageTitle
          title='Minhas Colaborações'
          motherMenu='Colaboradores'
          path={[
            { url: '/colaboradores', text: 'Colaborações' },
            { url: null, text: 'Minhas Colaborações' },
          ]}
        />
        <Row>
          <Col xs={12} className='mb-4'>
            <ButtonDS
              variant='primary'
              size='sm'
              onClick={() => {
                setModalPendingShow(true);
              }}
              disabled={pending.length === 0}
              iconLeft={'bx-envelope'}
            >
              Convites Pendentes
              <span
                className='counter'
                style={{
                  background: 'white',
                  color: '#0f1b35',
                  borderRadius: '100%',
                  width: '18px',
                  display: 'inline-block',
                  marginLeft: '5px',
                  fontSize: 12,
                }}
              >
                {pending.length}
              </span>
            </ButtonDS>
          </Col>
          <Col>
            <DataTable
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: true,
                selectAllRowsItemText: 'Todos',
              }}
              object={objectData}
              perPage={10}
              unit={`colaboradores`}
              skeleton={requesting || isLoading}
            />
          </Col>
        </Row>
      </section>
    </Fragment>
  );
}

import { Fragment, useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import DataTable from '../../jsx/components/DataTable';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import PageTitle from '../../jsx/layouts/PageTitle';
import api from '../../providers/api';
import regexEmail from '../../utils/regex-email';
import './style.scss';

export default function PageCollaborators() {
  const [modalEditShow, setModalEditShow] = useState(false);
  const [activeCollaborator, setActiveCollaborator] = useState(null);
  const [objectData, setObjectData] = useState({ data: [], columns: [] });
  const [requesting, setRequesting] = useState(true);
  const [modules, setModules] = useState([]);
  const [alert, setAlert] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!modalEditShow) {
      setPermissions({});
    }
  }, [modalEditShow]);

  const {
    register,
    reset,
    getValues,
    errors,
    formState,
    handleSubmit,
    trigger,
  } = useForm({
    mode: 'onChange',
  });

  const { isValid } = formState;

  useEffect(() => {
    if (modalEditShow === false) {
      fetchData();
      setActiveCollaborator(null);
    }
  }, [modalEditShow]);

  const fetchData = () => {
    setIsLoading(true);
    api
      .get('/collaborators')
      .then((response) => {
        setRequesting(false);
        setDataTable(response.data.rows);
      })
      .finally(() => setIsLoading(false));

    api
      .get('/collaborators/permissions')
      .then((response) => {
        setModules(response.data);
      })
      .catch(() => {});
  };

  const setDataTable = (rows) => {
    let preparedData = [];
    rows.forEach((item) => {
      let newRow = [
        item.email,
        <BadgeDS key={item.uuid} disc>
          {item.status.name}
        </BadgeDS>,
        renderActions(item),
      ];
      preparedData.push(newRow);
    });

    const object = {
      data: preparedData,
      columns: ['Colaborador', 'Status', 'Ações'],
    };

    setObjectData(object);
  };

  const renderActions = (collaborator) => {
    return (
      <>
        <ButtonDS
          size={'icon'}
          variant='primary'
          className='mr-2'
          onClick={() => {
            setActiveCollaborator(collaborator);
            setPermissions(collaborator.permissions);
            setModalEditShow(true);
          }}
        >
          <i className='bx bxs-pencil'></i>
        </ButtonDS>
      </>
    );
  };

  const onSubmit = (data) => {
    setRequesting('post');

    let fields = data;

    if (!activeCollaborator) {
      api
        .post(`collaborators/invite`, fields)
        .then(() => {
          setRequesting(false);
          setModalEditShow(false);
        })
        .catch((err) => {
          setAlert(err.response.data.message);
          setRequesting(false);
        });
    } else {
      api
        .put(`collaborators/${activeCollaborator.uuid}`, fields)
        .then(() => {
          setRequesting(false);
          setModalEditShow(false);
        })
        .catch((err) => {
          setAlert(err.response.data.message);
          setRequesting(false);
        });
    }
  };

  const handleRemove = () => {
    setRequesting('delete');

    api
      .delete(`collaborators/${activeCollaborator.uuid}`)
      .then(() => {
        setRequesting(false);
        setModalEditShow(false);
      })
      .catch((err) => {
        setAlert(err.response.data.message);
        setRequesting(false);
      });
  };

  const formValid = () => {
    let valid = true;
    let fields = getValues();

    if (!isValid) {
      valid = false;
    }
    if (fields.permissions && fields.permissions.length === 0) {
      valid = false;
    }

    return valid;
  };

  return (
    <Fragment>
      <ModalGeneric
        show={modalEditShow}
        setShow={setModalEditShow}
        title={activeCollaborator ? 'Alterar colaborador' : 'Novo Colaborador'}
        centered
      >
        <Row>
          {alert && (
            <Col md={12} className='mb-4'>
              <AlertDS text={alert} />
            </Col>
          )}
          <Col>
            <div>
              <Form.Control
                ref={register({
                  required: true,
                  validate: (value) => {
                    return regexEmail(value);
                  },
                })}
                name='email'
                type='email'
                value={activeCollaborator?.email}
                isInvalid={errors.email}
                placeholder='E-mail do colaborador...'
                disabled={activeCollaborator}
              />
            </div>
          </Col>
        </Row>

        <Row style={{ margin: '20px 0' }}>
          {modules.map((item, index) => {
            return (
              <Col md={6} key={index}>
                <label
                  className='d-inline-block pointer'
                  style={{ fontSize: 14 }}
                >
                  <input
                    className='mr-2'
                    type='checkbox'
                    name='permissions[]'
                    value={item.key}
                    ref={register}
                    checked={permissions[item.key]}
                    onChange={() => {
                      setPermissions((prevPermissions) => ({
                        ...prevPermissions,
                        [item.key]: !prevPermissions[item.key],
                      }));
                      trigger();
                    }}
                  />
                  {item.label}
                </label>
              </Col>
            );
          })}
        </Row>
        <Row>
          <Col>
            {activeCollaborator && (
              <ButtonDS
                size='xs'
                onClick={handleRemove}
                variant='light'
                disabled={requesting}
              >
                {requesting === false
                  ? 'Remover Colaborador'
                  : requesting === 'delete'
                  ? 'removendo...'
                  : 'Remover Colaborador'}
              </ButtonDS>
            )}
          </Col>
          <Col className='d-flex justify-content-end'>
            <ButtonDS
              size='xs'
              disabled={!formValid() || requesting}
              onClick={handleSubmit(onSubmit)}
            >
              {requesting === false
                ? 'Salvar'
                : requesting === 'post'
                ? 'salvando...'
                : 'Salvar'}
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>

      <section id='PageCollaborators'>
        <PageTitle
          title='Meus Colaboradores'
          motherMenu='Colaboradores'
          active='coproduction'
          path={[
            { url: '/colaboradores', text: 'Colaborações' },
            { url: null, text: 'Meus Colaboradores' },
          ]}
        />
        <Row>
          <Col xs={12} className='d-flex justify-content-between mb-4'>
            <ButtonDS
              size={'sm'}
              onClick={() => {
                setModalEditShow(true);
                reset({});
              }}
            >
              Novo Colaborador
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
              title='Colaboradores'
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

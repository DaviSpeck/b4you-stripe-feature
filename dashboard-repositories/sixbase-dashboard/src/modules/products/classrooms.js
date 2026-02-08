import { Fragment, useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import api from '../../providers/api';
import Crud from './classrooms/crud';
import Migrate from './classrooms/migrate';
import { notify } from '../functions';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';

export default function PageProductsEditClassrooms() {
  const { uuidProduct } = useParams();
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [modalFilterShow] = useState(false);
  const [modalEditShow, setModalEditShow] = useState(false);
  const [modalMigrateShow, setModalMigrateShow] = useState(false);
  const [filters] = useState({});
  const [classrooms, setClassrooms] = useState([]);
  const [modules, setModules] = useState([]);

  const { reset } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (modalFilterShow === true) {
      reset(filters);
    }
  }, [modalFilterShow]);

  useEffect(() => {
    if (modalEditShow === false && modalMigrateShow === false) {
      fetchData();
    }
  }, [modalEditShow, modalMigrateShow]);

  const fetchData = () => {
    api
      .get('/products/classrooms/' + uuidProduct)
      .then((response) => {
        setClassrooms(response.data);
      })
      .catch(() => {});
    api
      .get('/products/modules/' + uuidProduct)
      .then((response) => {
        let array = [];

        response.data.map((item) => {
          let module = {
            uuid: item.uuid,
            title: item.title,
            order: item.order,
            lessons_quantity: item.lessons_quantity,
          };
          return array.push(module);
        });
        setModules(array);
      })
      .catch(() => {});
  };

  const handleEdit = (classroom) => {
    setActiveClassroom(classroom);
    setModalEditShow(true);
  };
  const handleMigrate = (classroom) => {
    setActiveClassroom(classroom);
    setModalMigrateShow(true);
  };

  return (
    <Fragment>
      {modalEditShow && (
        <ModalGeneric
          show={modalEditShow}
          setShow={setModalEditShow}
          title={!activeClassroom ? 'Nova Turma' : 'Alterar Turma'}
          centered
        >
          <Crud
            activeClassroom={activeClassroom}
            setActiveClassroom={setActiveClassroom}
            modules={modules}
            uuidProduct={uuidProduct}
            show={modalEditShow}
            setShow={setModalEditShow}
            notify={notify}
          />
        </ModalGeneric>
      )}
      {modalMigrateShow && (
        <ModalGeneric
          show={modalMigrateShow}
          setShow={setModalMigrateShow}
          title={'Migrar Alunos'}
          centered
        >
          <Migrate
            activeClassroom={activeClassroom}
            setActiveClassroom={setActiveClassroom}
            uuidProduct={uuidProduct}
            show={modalMigrateShow}
            setShow={setModalMigrateShow}
            classrooms={classrooms}
            notify={notify}
          />
        </ModalGeneric>
      )}
      <section id='classrooms'>
        <Row>
          <Col>
            <Row>
              <Col xs={12} className='mb-4'>
                <ButtonDS
                  onClick={() => {
                    setActiveClassroom(null);
                    setModalEditShow(true);
                  }}
                  size='xs'
                >
                  Nova Turma
                </ButtonDS>
              </Col>
              {classrooms.map((item, index) => {
                return (
                  <Col md={6} lg={4} key={index}>
                    <Card>
                      <Card.Header className='align-items-center'>
                        <h4 className='mb-0'>
                          {item.is_default && (
                            <i className='la la-star mr-2 text-primary' />
                          )}
                          {item.label}
                        </h4>
                        <div className='d-flex'>
                          <div className='mr-1'>
                            <ButtonDS
                              variant='light'
                              size='icon'
                              onClick={() => {
                                handleMigrate(item);
                              }}
                            >
                              <i className='bx bx-group'></i>
                            </ButtonDS>
                          </div>
                          <div>
                            <ButtonDS
                              variant='primary'
                              size='icon'
                              onClick={() => {
                                handleEdit(item);
                              }}
                            >
                              <i className='bx bxs-pencil'></i>
                            </ButtonDS>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className='stats'>
                          <ul>
                            <li>Módulos Liberados</li>
                            <li>{item.modules_count}</li>
                          </ul>
                          <ul>
                            <li>Aulas</li>
                            <li>{item.lessons_count}</li>
                          </ul>
                        </div>
                        {false && (
                          <div className='modules'>
                            <div className='title'>Módulos Liberados</div>
                            <ul>
                              <li>
                                <i className='las la-check-circle'></i>{' '}
                                <span>[module]</span>
                              </li>
                              <li>
                                <i className='las la-check-circle'></i>{' '}
                                <span>[module]</span>
                              </li>
                              <li>
                                <i className='las la-check-circle'></i>{' '}
                                <span>[module]</span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </section>
    </Fragment>
  );
}

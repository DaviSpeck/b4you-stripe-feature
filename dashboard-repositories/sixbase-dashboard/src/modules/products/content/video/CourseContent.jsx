import { useEffect, useState } from 'react';
import Board, { moveCard, moveColumn } from '@asseinfo/react-kanban';
import dragIcon from '../../../../images/module-content/drag.svg';
import ModalLesson from './modal-lesson';
import ModalModule from './modal-module';
import { notify } from '../../../functions';
import { useParams } from 'react-router-dom';
import api from '../../../../providers/api';
import { Col, Row } from 'react-bootstrap';
import ModalPreview from './modal-preview';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import AnchorsModules from './anchors/AnchorsModules';

const nav = [
  { label: 'Módulos e Aulas', route: `modules` },
  { label: 'Seções', route: `sections` },
];

const CourseContent = () => {
  const { uuidProduct } = useParams();

  const [showModalModule, setShowModalModule] = useState(null);
  const [showModalPreview, setShowModalPreview] = useState(null);
  const [showModalLesson, setShowModalLesson] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  const [activeNav, setActiveNav] = useState('modules');

  const [data, setData] = useState(null);
  const [board, setBoard] = useState({
    columns: [],
  });

  const fetchModules = () => {
    api
      .get('/products/modules/' + uuidProduct)
      .then((response) => {
        setData(response.data);
      })
      .catch(() => {});
  };
  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    let fetchData = false;
    if (showModalModule === false) {
      fetchData = true;
    }
    if (showModalLesson === false) {
      fetchData = true;
    }

    if (fetchData) {
      fetchModules();
    }
  }, [showModalModule, showModalLesson]);

  useEffect(() => {
    if (data) {
      let teste = [];
      data.map((module, indexM) => {
        let cards = [];
        module.lessons.map((lesson, indexL) => {
          let newCard = {
            id: lesson.uuid,
            title: lesson.title,
            description: lesson.description,
            index: indexL,
            lesson: lesson,
            moduleId: module.uuid,
          };

          cards.push(newCard);
        });

        let newColumn = {
          id: module.uuid,
          title: module.title,
          index: indexM,
          cards: cards,
          module: module,
        };

        teste.push(newColumn);
      });

      setBoard({
        columns: teste,
      });
    }
  }, [data]);

  function handleCardMove(_card, source, destination) {
    let moduleId = destination.toColumnId;
    let reorderRoute = '';
    const updatedBoard = moveCard(board, source, destination);

    if (source.fromColumnId !== destination.toColumnId) {
      // mudou o modulo
      reorderRoute =
        '/products/lessons/' + uuidProduct + '/' + moduleId + '/change/module';
    } else {
      // mesmo modulo
      reorderRoute =
        '/products/lessons/' + uuidProduct + '/' + moduleId + '/reorder';
    }

    let array = [];

    updatedBoard.columns.map((module) => {
      if (module.id === destination.toColumnId) {
        module.cards.map((lesson) => {
          array.push(lesson.id);
        });
      }
    });

    setBoard(updatedBoard);

    api
      .put(reorderRoute, { lessons_ids: array })
      .then(() => {})
      .catch(() => {});
  }

  function handleColumnMove(_card, source, destination) {
    const updatedBoard = moveColumn(board, source, destination);

    setBoard(updatedBoard);

    let array = [];

    updatedBoard.columns.map((module) => {
      array.push(module.id);
    });

    setBoard(updatedBoard);

    api
      .put('products/modules/' + uuidProduct + '/reorder', {
        modules_ids: array,
      })
      .then(() => {})
      .catch(() => {});
  }

  const handleEditModule = (module) => {
    setActiveModule(module);
    setShowModalModule(true);
  };

  const handleEditLesson = (lesson, moduleId) => {
    setActiveModule(moduleId);
    setActiveLesson(lesson);
    setShowModalLesson(true);
  };

  return (
    <section id='page-board'>
      {data && (
        <Row>
          <Col>
            <div className='list-navs-content'>
              {nav.map((item) => (
                <div
                  key={item.route}
                  className={`nav-item ${item.route === activeNav && 'active'}`}
                  onClick={() => setActiveNav(item.route)}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {activeNav === 'modules' ? (
              <>
                <div
                  style={{
                    maxWidth: '810px',
                    marginTop: '24px',
                    marginBottom: '24px',
                  }}
                >
                  <h2>Organizar aulas em módulos</h2>
                  <p className='mb-0'>
                    Aqui você pode criar, organizar, ordenar e configurar
                    facilmente as aulas em módulos.
                  </p>
                </div>
                <div>
                  <div className='d-flex justify-content-between mb-4'>
                    <ButtonDS
                      onClick={() => {
                        setActiveModule(null);
                        setShowModalModule(true);
                      }}
                      variant='primary'
                      size='sm'
                      iconRight={'bx-plus'}
                      outline
                    >
                      <span>Novo Módulo</span>
                    </ButtonDS>
                    <ButtonDS
                      variant='primary'
                      size={'sm'}
                      onClick={() => setShowModalPreview(true)}
                    >
                      <span>Pré-visualizar curso</span>
                    </ButtonDS>
                  </div>
                  <div>
                    {showModalPreview && (
                      <ModalPreview
                        setShow={setShowModalPreview}
                        uuidProduct={uuidProduct}
                      />
                    )}
                    {showModalModule && (
                      <ModalModule
                        uuidProduct={uuidProduct}
                        show={showModalModule}
                        setShow={setShowModalModule}
                        activeModule={activeModule}
                        notify={notify}
                      />
                    )}
                    {showModalLesson && (
                      <ModalLesson
                        uuidProduct={uuidProduct}
                        show={showModalLesson}
                        setShow={setShowModalLesson}
                        activeModule={activeModule}
                        setActiveModule={setActiveModule}
                        activeLesson={activeLesson}
                        setActiveLesson={setActiveLesson}
                        notify={notify}
                      />
                    )}
                  </div>
                  <div
                    className='dnd mt-2'
                    id='board-content'
                    style={{
                      minHeight: '300px',
                    }}
                  >
                    <Board
                      onCardDragEnd={handleCardMove}
                      onColumnDragEnd={handleColumnMove}
                      renderCard={(
                        { title, index, lesson, moduleId },
                        { dragging }
                      ) => (
                        <div
                          className={
                            lesson.active === true
                              ? 'custom-card ' + dragging
                              : 'custom-card inactive ' + dragging
                          }
                          dragging={dragging ? dragging : undefined}
                          key={index}
                          onClick={() => {
                            handleEditLesson(lesson, moduleId);
                          }}
                        >
                          <div className='top-bar'>
                            <div className='d-flex align-items-center'>
                              <div className='class-ready'>
                                {lesson.active ? (
                                  <i className='bx bx-show-alt'></i>
                                ) : (
                                  <i className='bx bx-hide'></i>
                                )}
                                <span>
                                  {lesson.active ? 'Visível' : 'Não visível'}
                                </span>
                              </div>
                              <div
                                className='number-lessons ml-2 '
                                style={{ minWidth: '23px', height: '23px' }}
                              >
                                {index + 1}
                              </div>
                            </div>

                            <div className='icons-right'>
                              <i className='bx bxs-pencil'></i>
                            </div>
                          </div>
                          <div className='title d-flex justify-content-between'>
                            <span className='text-wrap'>{title}</span>
                          </div>
                          {lesson.description &&
                          lesson.description.replace(/<\/?p[^>]*>/g, '')
                            .length > 1 ? (
                            <div className='description'>
                              {lesson.description &&
                                lesson.description.replace(/<\/?p[^>]*>/g, '')
                                  .length > 1 && (
                                  <div
                                    className='text-wrap'
                                    dangerouslySetInnerHTML={{
                                      __html:
                                        lesson.description.length > 50
                                          ? lesson.description.slice(0, 50) +
                                            '...'
                                          : lesson.description,
                                    }}
                                  ></div>
                                )}
                            </div>
                          ) : null}
                          {lesson.vimeo.video_uploaded ||
                          lesson.attachments.length > 0 ||
                          lesson.vimeo.duration !== 0 ||
                          (lesson.description &&
                            lesson.description.replace(/<\/?p[^>]*>/g, '')
                              .length > 1) ? (
                            <div className='bottom-items'>
                              {lesson.vimeo.video_uploaded ||
                              lesson.attachments.length > 0 ||
                              (lesson.description &&
                                lesson.description.replace(/<\/?p[^>]*>/g, '')
                                  .length > 1) ? (
                                <div className='info'>
                                  {lesson.vimeo.video_uploaded && (
                                    <i className='bx bx-video-plus'></i>
                                  )}
                                  {lesson.attachments.length > 0 && (
                                    <i className='bx bx-paperclip'></i>
                                  )}
                                  {lesson.description &&
                                    lesson.description.replace(
                                      /<\/?p[^>]*>/g,
                                      ''
                                    ).length > 1 && (
                                      <i className='bx bx-right-indent'></i>
                                    )}
                                </div>
                              ) : null}

                              {lesson.vimeo.duration !== 0 && (
                                <div className='time'>
                                  <i className='bx bx-time-five'></i>
                                  <span>{lesson.vimeo.duration}</span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                      renderColumnHeader={({ title, index, module }) => (
                        <div>
                          <div className='column-header' key={index}>
                            <div className='d-flex justify-content-between'>
                              <div className='column-header-first'>
                                <img src={dragIcon} className='drag-icon' />
                                <span className='number-lessons'>
                                  {module.lessons.length}
                                </span>
                              </div>
                              <span className='menu-right'>
                                <div
                                  className='column-add-card'
                                  onClick={() => {
                                    setActiveModule(module.uuid);
                                    setActiveLesson(null);
                                    setShowModalLesson(true);
                                  }}
                                >
                                  <i className='bx bx-plus'></i>
                                </div>
                                <div
                                  className='column-ham'
                                  onClick={() => {
                                    handleEditModule(module);
                                  }}
                                >
                                  <i
                                    className='bx bxs-pencil'
                                    style={{ fontSize: '18px' }}
                                  ></i>
                                </div>
                              </span>
                            </div>

                            <div className='column-title'>{title}</div>
                          </div>
                        </div>
                      )}
                    >
                      {board}
                    </Board>
                  </div>
                </div>
              </>
            ) : (
              activeNav === 'sections' && <AnchorsModules />
            )}
          </Col>
        </Row>
      )}
    </section>
  );
};

export default CourseContent;

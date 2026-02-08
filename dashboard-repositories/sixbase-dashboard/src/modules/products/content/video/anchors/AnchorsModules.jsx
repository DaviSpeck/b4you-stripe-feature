import { useEffect, useState } from 'react';
import Board, { moveCard, moveColumn } from '@asseinfo/react-kanban';
import dragIcon from '../../../../../images/module-content/drag.svg';
import { notify } from '../../../../functions';
import { useParams } from 'react-router-dom';
import api from '../../../../../providers/api';
import { Col, Row } from 'react-bootstrap';
import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import ModalAnchor from './ModalAnchor';
import ModalLinkAnchor from './ModalLinkAnchor';
import './style.scss';
import AlertDS from '../../../../../jsx/components/design-system/AlertDS';

const AnchorsModules = () => {
  const { uuidProduct } = useParams();
  const [requestingAnchor, setRequestingAnchor] = useState(false);
  const [type, setType] = useState('create');
  const [showModalAnchor, setShowModalAnchor] = useState(false);
  const [showModalLinkAnchor, setShowModalLinkAnchor] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [modules, setModules] = useState([]);
  const [anchorView, setAnchorView] = useState(false);

  const [board, setBoard] = useState({
    columns: [],
  });

  const fetchAnchors = () => {
    api
      .get(`products/anchors/${uuidProduct}`)
      .then((response) => {
        setBoard({
          columns: response.data.map(
            ({ uuid, label, order, modules }, indexAnchor) => ({
              id: uuid,
              uuid,
              label,
              order,
              index: indexAnchor,
              cards: modules.map((module, indexModule) => ({
                id: module.uuid,
                uuid: module.uuid,
                label: module.label,
                index: indexModule,
                anchor_uuid: uuid,
              })),
            })
          ),
        });
      })
      .catch(() => {});
  };

  const fetchModules = () => {
    api.get(`products/anchors/${uuidProduct}/modules`).then((response) => {
      setModules(response.data);
    });
  };

  const getAnchorView = () => {
    api.get(`/products/anchors/${uuidProduct}/anchor-view`).then(({ data }) => {
      setAnchorView(data.anchor_view);
    });
  };

  useEffect(() => {
    getAnchorView();
    fetchModules();
    fetchAnchors();
  }, []);

  const createAnchor = ({ label }) => {
    setRequestingAnchor(true);
    api
      .post(`/products/anchors/${uuidProduct}`, {
        label,
      })
      .then(({ data }) => {
        setBoard((prevBoard) => ({
          columns: [
            ...prevBoard.columns,
            {
              id: data.uuid,
              uuid: data.uuid,
              label: data.label,
              order: data.order,
              index: prevBoard.columns.length,
              cards: [],
            },
          ],
        }));
        setShowModalAnchor(false);
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Erro ao salvar', type: 'error' });
      })
      .finally(() => setRequestingAnchor(false));
  };

  const deleteAnchor = () => {
    api
      .delete(`/products/anchors/${uuidProduct}/${anchor.uuid}`)
      .then(() => {
        setBoard((prevBoard) => {
          prevBoard.columns = prevBoard.columns.filter(
            (c) => c.uuid !== anchor.uuid
          );
          return prevBoard;
        });
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setShowModalAnchor(false);
        fetchModules();
      })
      .catch(() => {
        notify({ message: 'Erro ao salvar', type: 'error' });
      });
  };

  const editAnchor = ({ label, uuid, index }) => {
    setRequestingAnchor(true);
    api
      .put(`/products/anchors/${uuidProduct}/${uuid}`, {
        label,
      })
      .then(({ data }) => {
        const updatedAnchor = {
          id: data.uuid,
          uuid: data.uuid,
          label: data.label,
          order: data.order,
          index,
          cards: data.modules.map((module, indexModule) => ({
            id: module.uuid,
            uuid: module.uuid,
            label: module.label,
            index: indexModule,
            order: module.order,
            anchor_uuid: uuid,
          })),
        };
        setBoard((prevBoard) => {
          prevBoard.columns[index] = updatedAnchor;
          return prevBoard;
        });
        setShowModalAnchor(false);
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Erro ao salvar', type: 'error' });
      })
      .finally(() => setRequestingAnchor(false));
  };

  const linkModule = ({ uuid }) => {
    setRequestingAnchor(true);
    api
      .post(`/products/anchors/${uuidProduct}/${anchor.uuid}/${uuid}`)
      .then(({ data }) => {
        fetchModules();
        const newModule = {
          id: data.uuid,
          uuid: data.uuid,
          label: data.label,
          order: data.order,
          anchor_uuid: anchor.uuid,
        };
        setBoard((prevBoard) => {
          prevBoard.columns[anchor.index] = {
            ...prevBoard.columns[anchor.index],
            cards: [...prevBoard.columns[anchor.index].cards, newModule],
          };
          return prevBoard;
        });
        setShowModalLinkAnchor(false);
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch(() => {
        notify({ message: 'Erro ao salvar', type: 'error' });
      })
      .finally(() => setRequestingAnchor(false));
  };

  const unlinkModule = ({ uuid, selectedAnchor }) => {
    setRequestingAnchor(true);
    api
      .put(`/products/anchors/${uuidProduct}/${selectedAnchor.uuid}/${uuid}`)
      .then(() => {
        setBoard((prevBoard) => {
          prevBoard.columns[selectedAnchor.index] = {
            ...prevBoard.columns[selectedAnchor.index],
            cards: prevBoard.columns[selectedAnchor.index].cards.filter(
              (c) => c.uuid !== uuid
            ),
          };
          return prevBoard;
        });
        setShowModalLinkAnchor(false);
        notify({ message: 'Salvo com sucesso', type: 'success' });
        fetchModules();
      })
      .catch(() => {
        notify({ message: 'Erro ao salvar', type: 'error' });
      })
      .finally(() => setRequestingAnchor(false));
  };

  const handleCardMove = (_card, source, destination) => {
    const anchorUuid = destination.toColumnId;
    let reorderRoute = '';
    const updatedBoard = moveCard(board, source, destination);
    setBoard(updatedBoard);

    if (source.fromColumnId !== destination.toColumnId) {
      // mudou de ancora
      reorderRoute = `/products/anchors/${uuidProduct}/${anchorUuid}/change-anchor`;
    } else {
      // mesma ancora
      reorderRoute = `/products/anchors/${uuidProduct}/${anchorUuid}/reorder-modules`;
    }

    const anchor = updatedBoard.columns.find((c) => c.uuid === anchorUuid);
    const modulesUuids = anchor.cards.map((m) => m.uuid);

    api.put(reorderRoute, { modules_uuid: modulesUuids }).catch(() => {
      notify({ message: 'Erro ao salvar', type: 'error' });
    });
  };

  const handleColumnMove = (_card, source, destination) => {
    const updatedBoard = moveColumn(board, source, destination);
    setBoard(updatedBoard);
    const anchorsUuid = updatedBoard.columns.map(({ uuid }) => uuid);
    api
      .put(`products/anchors/${uuidProduct}/reorder`, {
        anchors_uuid: anchorsUuid,
      })
      .catch(() => {
        notify({ message: 'Erro ao salvar', type: 'error' });
      });
  };

  return (
    <section id='page-board' className='page-anchor'>
      <Row>
        <Col>
          <h2 className='mt-3'>Organizar módulos em seções</h2>
          <p className='mb-0'>
            Aqui você pode criar, organizar, ordenar e configurar facilmente os
            módulos em seções.
          </p>
          <div className='mt-4'>
            {anchorView ? (
              <>
                <div className='d-flex justify-content-between mb-4'>
                  <ButtonDS
                    onClick={() => {
                      setAnchor(null);
                      setType('create');
                      setShowModalAnchor(true);
                    }}
                    variant='primary'
                    size='sm'
                    iconRight={'bx-plus'}
                    outline
                    className='mt-4'
                  >
                    <span>Nova seção</span>
                  </ButtonDS>
                </div>

                <div>
                  {showModalAnchor && (
                    <ModalAnchor
                      show={showModalAnchor}
                      setShow={setShowModalAnchor}
                      createAnchor={createAnchor}
                      type={type}
                      requesting={requestingAnchor}
                      anchor={anchor}
                      editAnchor={editAnchor}
                      deleteAnchor={deleteAnchor}
                    />
                  )}
                  {showModalLinkAnchor && (
                    <ModalLinkAnchor
                      modules={modules}
                      show={showModalLinkAnchor}
                      setShow={setShowModalLinkAnchor}
                      requesting={requestingAnchor}
                      linkModule={linkModule}
                    />
                  )}
                </div>

                {Object.values(board).length !== 0 &&
                Object.values(board)[0][0]?.id !== undefined ? (
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
                        { label, index, uuid: moduleUuid, anchor_uuid },
                        { dragging }
                      ) => (
                        <div
                          className='custom-card'
                          dragging={dragging ? dragging : undefined}
                          key={index}
                        >
                          <div className='title d-flex justify-content-between'>
                            <span className='text-wrap'>{label}</span>
                            <div
                              className='column-add-card d-flex justify-content-end anchor-trash'
                              onClick={() => {
                                unlinkModule({
                                  uuid: moduleUuid,
                                  selectedAnchor: board.columns.find(
                                    (c) => c.uuid === anchor_uuid
                                  ),
                                });
                              }}
                            >
                              <i className='bx bx-trash-alt'></i>
                            </div>
                          </div>
                        </div>
                      )}
                      renderColumnHeader={({ label, index, uuid }) => (
                        <div className='column-header' key={index}>
                          <div className='column-header-content d-flex justify-content-between'>
                            <div className='column-header-first'>
                              <img src={dragIcon} className='drag-icon' />
                            </div>
                            <span className='menu-right'>
                              <div
                                className='column-add-card'
                                onClick={() => {
                                  setAnchor({ label, index, uuid });
                                  setShowModalLinkAnchor(true);
                                }}
                              >
                                <i className='bx bx-plus'></i>
                              </div>
                              <div
                                className='anchor-pencil d-flex align-itens-center'
                                onClick={() => {
                                  setType('edit');
                                  setAnchor({ label, uuid, index });
                                  setShowModalAnchor(true);
                                }}
                              >
                                <i
                                  className='bx bxs-pencil'
                                  style={{ fontSize: '18px' }}
                                ></i>
                              </div>
                            </span>
                          </div>

                          <div className='column-title'>{label}</div>
                        </div>
                      )}
                    >
                      {board}
                    </Board>
                  </div>
                ) : (
                  <Row>
                    <Col md={4} className='m-auto'>
                      <AlertDS
                        textButton={'Configurar'}
                        variant='warning'
                        text={
                          'Adicione seções e vincule a módulos para customizar a visualização do conteúdo para clientes'
                        }
                      ></AlertDS>
                    </Col>
                  </Row>
                )}
              </>
            ) : (
              <Row>
                <Col md={4} className='m-auto'>
                  <AlertDS
                    textButton={'Configurar'}
                    variant='warning'
                    text={
                      'Para customizar as seções ative na configuração da área de membros'
                    }
                  ></AlertDS>
                </Col>
              </Row>
            )}
          </div>
        </Col>
      </Row>
    </section>
  );
};

export default AnchorsModules;

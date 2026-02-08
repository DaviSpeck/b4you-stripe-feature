import React, { useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import AccordionContext from 'react-bootstrap/AccordionContext';
import BlockPreview from './BlockPreview';
import { isRequiredBlock, BLOCK_TYPES } from '../types/blockTypes';

const SortableBlockItem = ({
  block,
  isSelected,
  onSelect,
  onRemove,
  onDuplicate,
  onCopy,
  moduleCoverFormat = 'vertical',
  product = null,
  productModules = [],
  accordionEventKey,
  renderSettings,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const isRequired = block.required || isRequiredBlock(block.type);
  const isProducer = block.type === BLOCK_TYPES.PRODUCER;
  const isSingleInstanceBlock = [
    BLOCK_TYPES.CTA,
    BLOCK_TYPES.FAQ,
    BLOCK_TYPES.SOCIAL,
  ].includes(block.type);

  // Producer: obrigatório (não edita/não remove) mas pode ser movido
  const isNonMovableRequired = isRequired && !isProducer;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Disable drag only for required blocks que não sejam o producer
  const dragAttributes = isNonMovableRequired ? {} : attributes;
  const dragListeners = isNonMovableRequired ? {} : listeners;

  const currentEventKey = useContext(AccordionContext);
  const isAccordionOpen = Array.isArray(currentEventKey)
    ? currentEventKey.includes(accordionEventKey)
    : currentEventKey === accordionEventKey;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-wrapper mb-3 ${isSelected ? 'selected' : ''} ${
        isDragging ? 'dragging' : ''
      } ${isRequired ? 'required-block' : ''}`}
    >
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          eventKey={accordionEventKey}
          onClick={() => {
            // Don't open settings for required blocks (inclui producer)
            if (!isRequired && onSelect) {
              onSelect(block.id);
            }
          }}
          className='block-controls'
        >
          <div className='d-flex align-items-center w-100'>
            <div className='d-flex align-items-center flex-grow-1'>
              <div
                className='block-label'
                {...dragAttributes}
                {...dragListeners}
                title={
                  isNonMovableRequired
                    ? 'Bloco fixo: não pode ser movido'
                    : 'Arraste aqui para reordenar'
                }
              >
                {!isNonMovableRequired && (
                  <i
                    className='bx bx-grid-vertical me-1'
                    style={{
                      cursor: 'grab',
                    }}
                  />
                )}
                <span>
                  {block.type}
                  {isRequired && (
                    <span className='badge ml-2 ms-2'>Obrigatório</span>
                  )}
                </span>
                {isNonMovableRequired && (
                  <small className='drag-hint text-muted ms-2'>
                    Fixo no topo (ordem padrão)
                  </small>
                )}
              </div>
              <div className='block-actions d-flex align-items-center ms-3'>
                {/* Setas de mover (para itens que podem ser movidos, incluindo producer) */}
                {!isNonMovableRequired && (
                  <>
                    <button
                      className='btn btn-sm btn-move'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onMoveUp) onMoveUp();
                      }}
                      disabled={!canMoveUp}
                      title='Mover para cima (mantém blocos fixos no topo)'
                    >
                      <i className='bx bx-up-arrow-alt' />
                    </button>
                    <button
                      className='btn btn-sm btn-move'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onMoveDown) onMoveDown();
                      }}
                      disabled={!canMoveDown}
                      title='Mover para baixo (mantém blocos fixos no topo)'
                    >
                      <i className='bx bx-down-arrow-alt' />
                    </button>
                  </>
                )}

                {/* Ações de cópia/duplicar/remover apenas para blocos não obrigatórios.
                    Para blocos de instância única (CTA, FAQ, SOCIAL), removemos os botões
                    de cópia/duplicar para evitar múltiplas instâncias. */}
                {!isRequired && (
                  <>
                    {!isSingleInstanceBlock && (
                      <>
                        <button
                          className='btn btn-sm btn-light'
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onCopy) onCopy(block.id);
                          }}
                          title='Copiar'
                        >
                          <i className='bx bx-copy' />
                        </button>
                        <button
                          className='btn btn-sm btn-light'
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(block.id);
                          }}
                          title='Duplicar'
                        >
                          <i className='bx bx-duplicate' />
                        </button>
                      </>
                    )}
                    <button
                      className='btn btn-sm btn-danger'
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(block.id);
                      }}
                      title='Remover'
                    >
                      <i className='bx bx-trash' />
                    </button>
                  </>
                )}
                {isRequired && (
                  <span
                    className='text-muted small'
                    title='Este bloco é obrigatório e não pode ser removido ou modificado'
                  >
                    <i className='bx bx-lock' />
                  </span>
                )}
              </div>
            </div>
            <span
              className={`block-arrow ms-auto ${isAccordionOpen ? 'open' : ''}`}
              aria-hidden='true'
            >
              <i className='bx bx-chevron-down' />
            </span>
          </div>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={accordionEventKey}>
          <Card.Body>
            <div className='block-content mb-3'>
              <BlockPreview
                block={block}
                moduleCoverFormat={moduleCoverFormat}
                product={product}
                productModules={productModules}
              />
            </div>

            {/* Renderiza configurações dentro do acordeão quando fornecido (mobile) */}
            {renderSettings && !isRequired && (
              <div className='block-settings-inside'>
                {renderSettings(block)}
              </div>
            )}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </div>
  );
};

export default SortableBlockItem;

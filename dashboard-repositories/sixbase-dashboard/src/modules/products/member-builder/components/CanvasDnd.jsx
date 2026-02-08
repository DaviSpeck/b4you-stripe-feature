import React from 'react';
import { Card } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableBlockItem from './SortableBlockItem';
import { isRequiredBlock, BLOCK_TYPES } from '../types/blockTypes';

const CanvasDnd = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onReorderBlocks,
  onRemoveBlock,
  onDuplicateBlock,
  onCopyBlock,
  moduleCoverFormat = 'vertical',
  product = null,
  productModules = [],
  recommendedProductsEnabled = false,
  // Opcional: usado no mobile para renderizar configurações dentro do acordeão do bloco
  renderSettings,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeBlock = blocks.find((block) => block.id === active.id);
    const overBlock = blocks.find((block) => block.id === over.id);

    // Prevent moving required blocks (description, modules)
    // Producer continua obrigatório, mas pode ser movido
    if (
      activeBlock &&
      (activeBlock.required || isRequiredBlock(activeBlock.type)) &&
      activeBlock.type !== BLOCK_TYPES.PRODUCER
    ) {
      return;
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);

    // Fix positions of DESCRIPTION and MODULES:
    // - They must permanecer no topo
    // - Usuário só pode mover blocos em posições a partir de MODULES para baixo
    const descriptionIndex = blocks.findIndex(
      (block) => block.type === BLOCK_TYPES.DESCRIPTION
    );
    const modulesIndex = blocks.findIndex(
      (block) => block.type === BLOCK_TYPES.MODULES
    );

    // Se não encontrar, segue fluxo normal (fallback seguro)
    if (modulesIndex !== -1) {
      const minMovableIndex = modulesIndex + 1;

      // Impede qualquer movimento que envolva posição antes de `modules`
      // (inclui tentar colocar algo entre description e modules ou acima deles)
      if (oldIndex < minMovableIndex || newIndex < minMovableIndex) {
        return;
      }
    }

    const newBlocks = arrayMove(blocks, oldIndex, newIndex);
    
    // Update order property
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index,
    }));

    onReorderBlocks(reorderedBlocks);
  };

  const handleMoveBlock = (blockId, direction) => {
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    if (currentIndex === -1) return;

    const block = blocks[currentIndex];

    // Same regra dos required: description/modules nunca movem; producer pode
    if (
      (block.required || isRequiredBlock(block.type)) &&
      block.type !== BLOCK_TYPES.PRODUCER
    ) {
      return;
    }

    const delta = direction === 'up' ? -1 : 1;
    const newIndex = currentIndex + delta;

    if (newIndex < 0 || newIndex >= blocks.length) {
      return;
    }

    // Mesma proteção de posição para DESCRIPTION / MODULES
    const descriptionIndex = blocks.findIndex(
      (b) => b.type === BLOCK_TYPES.DESCRIPTION
    );
    const modulesIndex = blocks.findIndex(
      (b) => b.type === BLOCK_TYPES.MODULES
    );

    if (modulesIndex !== -1) {
      const minMovableIndex = modulesIndex + 1;

      if (currentIndex < minMovableIndex || newIndex < minMovableIndex) {
        return;
      }
    }

    const newBlocks = arrayMove(blocks, currentIndex, newIndex);

    const reorderedBlocks = newBlocks.map((b, index) => ({
      ...b,
      order: index,
    }));

    onReorderBlocks(reorderedBlocks);
  };

  return (
    <Card className='member-builder-canvas h-100'>
      <Card.Body className='p-4'>
        <div className='canvas-header mb-4'>
          <h5 className='mb-1'>Canvas</h5>
          <small className='text-muted'>
            Arraste pelos pontinhos para mover • Setas sobem/descem • Os dois primeiros blocos são fixos
          </small>
          <div className='text-muted small mt-1'>
            Dica: blocos “Descrição” e “Módulos” ficam sempre no topo. Produtor é fixo, mas pode mudar de posição abaixo deles.
          </div>
          <div className='text-muted small mt-1'>
            Clique nos blocos para abrir e visualizá-los. Em seguida, use o botão “Pré-visualizar curso” acima para ver como a personalização ficará na página.
          </div>
        </div>

        <div className='blocks-container'>
          {blocks.length === 0 ? (
            <div className='empty-state text-center py-5'>
              <i className='bx bx-layer fs-1 text-muted mb-3 d-block' />
              <h6 className='text-muted'>Nenhum bloco adicionado</h6>
              <p className='text-muted small'>
                Clique em um bloco da biblioteca à esquerda para começar
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion defaultActiveKey={null}>
                  {blocks.map((block, index) => {
                    const isRequired =
                      block.required || isRequiredBlock(block.type);
                    const isProducer = block.type === BLOCK_TYPES.PRODUCER;
                    const isMovable = !isRequired || isProducer;

                    // calcula se pode mover up/down (pra desabilitar setas quando não fizer sentido)
                    const modulesIndex = blocks.findIndex(
                      (b) => b.type === BLOCK_TYPES.MODULES
                    );
                    let canMoveUp = false;
                    let canMoveDown = false;

                    if (isMovable) {
                      const minMovableIndex =
                        modulesIndex !== -1 ? modulesIndex + 1 : 0;

                      if (index > 0 && index - 1 >= minMovableIndex) {
                        canMoveUp = true;
                      }

                      if (
                        index < blocks.length - 1 &&
                        index + 1 >= minMovableIndex
                      ) {
                        canMoveDown = true;
                      }
                    }

                    return (
                      <React.Fragment key={block.id}>
                        <SortableBlockItem
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={onSelectBlock}
                          onRemove={onRemoveBlock}
                          onDuplicate={onDuplicateBlock}
                          onCopy={onCopyBlock}
                          moduleCoverFormat={moduleCoverFormat}
                          product={product}
                          productModules={productModules}
                          accordionEventKey={`${index}`}
                          renderSettings={renderSettings}
                          canMoveUp={canMoveUp}
                          canMoveDown={canMoveDown}
                          onMoveUp={() => handleMoveBlock(block.id, 'up')}
                          onMoveDown={() => handleMoveBlock(block.id, 'down')}
                        />
                        {/* Bloco fixo de produtos recomendados após módulos */}
                        {block.type === BLOCK_TYPES.MODULES &&
                          modulesIndex === index &&
                          recommendedProductsEnabled && (
                            <div className='block-wrapper mb-3 required-block'>
                              <Card>
                                <Card.Header className='block-controls'>
                                  <div className='d-flex align-items-center w-100'>
                                    <div className='d-flex align-items-center flex-grow-1'>
                                      <div className='block-label'>
                                        <span>
                                          recommended-products
                                          <span className='badge ml-2 ms-2'>Obrigatório</span>
                                        </span>
                                        <small className='drag-hint text-muted ms-2'>
                                          Fixo após módulos (produtos recomendados habilitados)
                                        </small>
                                      </div>
                                      <div className='block-actions d-flex align-items-center ms-3'>
                                        <span
                                          className='text-muted small'
                                          title='Este bloco é fixo e aparece automaticamente quando produtos recomendados estão habilitados'
                                        >
                                          <i className='bx bx-lock' />
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </Card.Header>
                              </Card>
                            </div>
                          )}
                      </React.Fragment>
                    );
                  })}
                </Accordion>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CanvasDnd;


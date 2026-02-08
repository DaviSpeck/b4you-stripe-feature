import React from 'react';
import { Card } from 'react-bootstrap';
import {
  BLOCK_DEFINITIONS,
  BLOCK_TYPES,
  isRequiredBlock,
} from '../types/blockTypes';

const BlockLibrary = ({ onAddBlock, blocks }) => {
  const availableBlocks = BLOCK_DEFINITIONS.filter((block) => {
    // Remove required blocks and spacer from list
    return !isRequiredBlock(block.type) && block.type !== 'spacer';
  });

  return (
    <Card className='member-builder-block-library h-100'>
      <Card.Body className='p-3'>
        <h5 className='mb-3'>Blocos Disponíveis</h5>

        {/* Block List */}
        <div className='block-list'>
          {availableBlocks.map((block) => {
            const isSingleInstance =
              block.type === BLOCK_TYPES.CTA ||
              block.type === BLOCK_TYPES.FAQ ||
              block.type === BLOCK_TYPES.SOCIAL;

            const alreadyExists = Boolean(
              isSingleInstance && blocks?.some((b) => b.type === block.type)
            );

            const isDisabled = !!alreadyExists;

            const handleClick = () => {
              if (isDisabled) return;
              onAddBlock(block.type);
            };

            return (
              <div
                key={block.type}
                className={`block-item p-3 mb-2 border rounded ${
                  isDisabled ? 'block-item-disabled' : 'cursor-pointer'
                }`}
                onClick={handleClick}
                title={block.description}
              >
                <div className='d-flex align-items-start'>
                  <i
                    className={`${block.icon} fs-4 me-2 text-primary`}
                    style={{ minWidth: '24px' }}
                  />
                  <div className='flex-grow-1'>
                    <div className='fw-semibold'>{block.name}</div>
                    <small className='text-muted d-block'>
                      {block.description}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card.Body>

      <style jsx>{`
        .member-builder-block-library {
          max-height: none;
          overflow-y: visible;
        }

        .block-list {
          max-height: none;
          overflow-y: visible;
          padding-top: 4px;
        }

        .block-item {
          transition: all 0.2s;
          background: #fff;
        }

        .block-item:hover {
          background: #f8f9fa;
          border-color: #0f1b35 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .block-item-disabled {
          background: #f5f5f5;
          color: #adb5bd;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .block-item-disabled:hover {
          background: #f5f5f5;
          border-color: #dee2e6 !important;
          box-shadow: none;
          transform: none;
        }

        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Card>
  );
};

export default BlockLibrary;

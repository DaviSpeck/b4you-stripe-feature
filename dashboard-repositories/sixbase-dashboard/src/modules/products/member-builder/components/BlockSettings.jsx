import React from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import { getBlockDefinition, isRequiredBlock } from '../types/blockTypes';
import ModulesSettings from './settings/ModulesSettings';
import TextSettings from './settings/TextSettings';
import DescriptionSettings from './settings/DescriptionSettings';
import ProducerSettings from './settings/ProducerSettings';
import VideoSettings from './settings/VideoSettings';
import ImageSettings from './settings/ImageSettings';
import CtaSettings from './settings/CtaSettings';
import FaqSettings from './settings/FaqSettings';
import TestimonialsSettings from './settings/TestimonialsSettings';
import StatsSettings from './settings/StatsSettings';
import SpacerSettings from './settings/SpacerSettings';
import SocialSettings from './settings/SocialSettings';

const BlockSettings = ({ block, onUpdateBlock, onClose }) => {
  if (!block) {
    return (
      <Card className='h-100'>
        <Card.Body className='text-center text-muted py-5'>
          <i className='bx bx-cog fs-1 mb-3 d-block' />
          <p>Selecione um bloco para editar suas configurações</p>
        </Card.Body>
      </Card>
    );
  }

  const definition = getBlockDefinition(block.type);
  const isRequired = block.required || isRequiredBlock(block.type);

  // Ensure config has default values merged in
  const normalizedConfig = definition
    ? {
        ...definition.defaultConfig,
        ...(block.config || {}),
      }
    : block.config || {};

  const handleConfigChange = (key, value) => {
    // Prevent changes to required blocks
    if (isRequired) {
      return;
    }
    
    onUpdateBlock({
      ...block,
      config: {
        ...normalizedConfig,
        [key]: value,
      },
    });
  };

  const renderSettings = () => {
    switch (block.type) {
      case 'modules':
        return (
          <ModulesSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'text':
        return (
          <TextSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'description':
        return (
          <DescriptionSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'producer':
        return (
          <ProducerSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'video':
        return (
          <VideoSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'image':
        return (
          <ImageSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'cta':
        return (
          <CtaSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'faq':
        return (
          <FaqSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'testimonials':
        return (
          <TestimonialsSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'stats':
        return (
          <StatsSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'spacer':
        return (
          <SpacerSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      case 'social':
        return (
          <SocialSettings
            config={normalizedConfig}
            onChange={handleConfigChange}
          />
        );
      default:
        return (
          <div className='text-muted'>
            <p>Sem configurações disponíveis para este bloco.</p>
          </div>
        );
    }
  };

  return (
    <Card className='member-builder-settings h-100'>
      <Card.Body className='p-3'>
        <div className='settings-header d-flex justify-content-between align-items-start mb-3'>
          <div>
            <h5 className='mb-1'>
              {definition?.name || 'Configurações'}
              {isRequired && <span className='badge bg-primary ms-2'>Obrigatório</span>}
            </h5>
            <small className='text-muted'>{definition?.description}</small>
          </div>
          <button
            className='btn btn-sm btn-light'
            onClick={onClose}
            title='Fechar'
          >
            <i className='bx bx-x' />
          </button>
        </div>

        {isRequired && (
          <Alert variant='info' className='mb-3'>
            <i className='bx bx-info-circle me-2' />
            Este bloco é obrigatório e não pode ser modificado. Ele representa a estrutura fixa da página do curso.
          </Alert>
        )}

        <div className={`settings-content ${isRequired ? 'opacity-50' : ''}`} style={{ pointerEvents: isRequired ? 'none' : 'auto' }}>
          {renderSettings()}
        </div>
      </Card.Body>

      <style jsx>{`
        .member-builder-settings {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .settings-content {
          max-height: calc(100vh - 350px);
          overflow-y: auto;
        }
      `}</style>
    </Card>
  );
};

export default BlockSettings;


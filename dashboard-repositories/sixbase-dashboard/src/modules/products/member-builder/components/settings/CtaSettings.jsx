import React from 'react';
import { Form } from 'react-bootstrap';

const CtaSettings = ({ config, onChange }) => {
  return (
    <div className='block-settings'>
      <p className='text-muted small mb-2'>
        Use este bloco para destacar uma ação importante (ex: botão de acesso ou
        contato).
      </p>
      <Form.Group className='mb-3'>
        <Form.Label>Título</Form.Label>
        <Form.Control
          type='text'
          placeholder='Ex: Comece agora'
          value={config.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Descrição (opcional)</Form.Label>
        <Form.Control
          as='textarea'
          rows={3}
          placeholder='Texto adicional...'
          value={config.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Texto do botão</Form.Label>
        <Form.Control
          type='text'
          placeholder='Ex: Iniciar'
          value={config.buttonText}
          onChange={(e) => onChange('buttonText', e.target.value)}
        />
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Link do botão</Form.Label>
        <Form.Control
          type='url'
          placeholder='https://...'
          value={config.buttonLink}
          onChange={(e) => onChange('buttonLink', e.target.value)}
        />
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Estilo do botão</Form.Label>
        <Form.Control
          as='select'
          value={config.buttonStyle}
          onChange={(e) => onChange('buttonStyle', e.target.value)}
        >
          <option value='primary'>Primário</option>
          <option value='secondary'>Secundário</option>
          <option value='outline'>Contorno</option>
        </Form.Control>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Alinhamento</Form.Label>
        <Form.Control
          as='select'
          value={config.alignment}
          onChange={(e) => onChange('alignment', e.target.value)}
        >
          <option value='left'>Esquerda</option>
          <option value='center'>Centro</option>
          <option value='right'>Direita</option>
        </Form.Control>
      </Form.Group>
    </div>
  );
};

export default CtaSettings;

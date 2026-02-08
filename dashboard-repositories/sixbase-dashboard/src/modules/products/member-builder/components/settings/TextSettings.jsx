import React from 'react';
import { Form } from 'react-bootstrap';

const TextSettings = ({ config, onChange }) => {
  return (
    <div className='block-settings'>
      <Form.Group className='mb-3'>
        <Form.Label>Título (opcional)</Form.Label>
        <Form.Control
          type='text'
          placeholder='Digite o título do card...'
          value={config.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
        />
        <Form.Text className='text-muted'>
          O título aparecerá acima do card de texto
        </Form.Text>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Conteúdo</Form.Label>
        <Form.Control
          as='textarea'
          rows={6}
          placeholder='Digite o texto...'
          value={config.content?.replace(/<[^>]*>/g, '') || ''}
          onChange={(e) => onChange('content', `<p>${e.target.value}</p>`)}
        />
        <Form.Text className='text-muted'>
          Editor rico será implementado futuramente
        </Form.Text>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Alinhamento</Form.Label>
        <Form.Control
          as='select'
          value={config.textAlign}
          onChange={(e) => onChange('textAlign', e.target.value)}
        >
          <option value='left'>Esquerda</option>
          <option value='center'>Centro</option>
          <option value='right'>Direita</option>
          <option value='justify'>Justificado</option>
        </Form.Control>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Largura máxima</Form.Label>
        <Form.Control
          as='select'
          value={config.maxWidth}
          onChange={(e) => onChange('maxWidth', e.target.value)}
        >
          <option value='narrow'>Estreito (600px)</option>
          <option value='container'>Container (1200px)</option>
          <option value='full'>Largura total</option>
        </Form.Control>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Espaçamento interno</Form.Label>
        <Form.Control
          as='select'
          value={config.padding}
          onChange={(e) => onChange('padding', e.target.value)}
        >
          <option value='none'>Nenhum</option>
          <option value='small'>Pequeno</option>
          <option value='medium'>Médio</option>
          <option value='large'>Grande</option>
        </Form.Control>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Cor de fundo</Form.Label>
        <div className='d-flex gap-2'>
          <Form.Control
            type='color'
            value={
              config.backgroundColor === 'transparent'
                ? '#ffffff'
                : config.backgroundColor
            }
            onChange={(e) => onChange('backgroundColor', e.target.value)}
            disabled={config.backgroundColor === 'transparent'}
          />
          <Form.Check
            type='checkbox'
            label='Transparente'
            checked={config.backgroundColor === 'transparent'}
            onChange={(e) =>
              onChange(
                'backgroundColor',
                e.target.checked ? 'transparent' : '#ffffff'
              )
            }
          />
        </div>
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Cor do texto</Form.Label>
        <Form.Control
          type='color'
          value={config.textColor === 'inherit' ? '#000000' : config.textColor}
          onChange={(e) => onChange('textColor', e.target.value)}
        />
      </Form.Group>
    </div>
  );
};

export default TextSettings;


import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const TestimonialsSettings = ({ config, onChange }) => {
  const handleAddItem = () => {
    const newItems = [
      ...(config.items || []),
      { id: Date.now(), name: '', role: '', content: '' },
    ];
    onChange('items', newItems);
  };

  const handleRemoveItem = (id) => {
    const newItems = config.items.filter((item) => item.id !== id);
    onChange('items', newItems);
  };

  const handleUpdateItem = (id, field, value) => {
    const newItems = config.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange('items', newItems);
  };

  return (
    <div className='block-settings'>
      <Form.Group className='mb-3'>
        <Form.Label>Título da seção</Form.Label>
        <Form.Control
          type='text'
          placeholder='Ex: O que dizem nossos alunos'
          value={config.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Label>Layout</Form.Label>
        <Form.Control
          as='select'
          value={config.layout}
          onChange={(e) => onChange('layout', e.target.value)}
        >
          <option value='carousel'>Carrossel</option>
          <option value='grid'>Grade</option>
        </Form.Control>
      </Form.Group>

      {config.layout === 'carousel' && (
        <Form.Group className='mb-3'>
          <Form.Check
            type='switch'
            id='autoplay'
            label='Rotação automática'
            checked={config.autoplay}
            onChange={(e) => onChange('autoplay', e.target.checked)}
          />
        </Form.Group>
      )}

      <div className='mb-3'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Label className='mb-0'>Depoimentos</Form.Label>
          <Button size='sm' variant='primary' onClick={handleAddItem}>
            <i className='bx bx-plus me-1' />
            Adicionar
          </Button>
        </div>

        {config.items?.length > 0 ? (
          <div className='testimonial-items'>
            {config.items.map((item, index) => (
              <Card key={item.id} className='mb-2'>
                <Card.Body className='p-2'>
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <small className='text-muted'>Depoimento {index + 1}</small>
                    <Button
                      size='sm'
                      variant='link'
                      className='text-danger p-0'
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <i className='bx bx-trash' />
                    </Button>
                  </div>
                  <Form.Control
                    size='sm'
                    type='text'
                    placeholder='Nome'
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'name', e.target.value)
                    }
                    className='mb-2'
                  />
                  <Form.Control
                    size='sm'
                    type='text'
                    placeholder='Cargo/Função (opcional)'
                    value={item.role}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'role', e.target.value)
                    }
                    className='mb-2'
                  />
                  <Form.Control
                    size='sm'
                    as='textarea'
                    rows={3}
                    placeholder='Depoimento'
                    value={item.content}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'content', e.target.value)
                    }
                  />
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center text-muted py-3 border rounded'>
            <small>Nenhum depoimento adicionado</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsSettings;


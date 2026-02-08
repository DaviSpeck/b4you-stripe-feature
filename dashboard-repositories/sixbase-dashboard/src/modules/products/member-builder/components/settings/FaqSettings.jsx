import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const FaqSettings = ({ config, onChange }) => {
  const handleAddItem = () => {
    const newItems = [
      ...(config.items || []),
      { id: Date.now(), question: '', answer: '' },
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
      <p className='text-muted small mb-2'>
        Este bloco só será exibido na página de membros se houver pelo menos uma
        pergunta cadastrada.
      </p>
      <Form.Group className='mb-3'>
        <Form.Label>Título da seção</Form.Label>
        <Form.Control
          type='text'
          placeholder='Ex: Perguntas Frequentes'
          value={config.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </Form.Group>

      <Form.Group className='mb-3'>
        <Form.Check
          type='switch'
          id='allowMultipleOpen'
          label='Permitir múltiplos itens abertos'
          checked={config.allowMultipleOpen}
          onChange={(e) => onChange('allowMultipleOpen', e.target.checked)}
        />
      </Form.Group>

      <div className='mb-3'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Label className='mb-0'>Perguntas</Form.Label>
          <Button size='sm' variant='primary' onClick={handleAddItem}>
            <i className='bx bx-plus me-1' />
            Adicionar
          </Button>
        </div>

        {config.items?.length > 0 ? (
          <div className='faq-items'>
            {config.items.map((item, index) => (
              <Card key={item.id} className='mb-2'>
                <Card.Body className='p-2'>
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <small className='text-muted'>Item {index + 1}</small>
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
                    placeholder='Pergunta'
                    value={item.question}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'question', e.target.value)
                    }
                    className='mb-2'
                  />
                  <Form.Control
                    size='sm'
                    as='textarea'
                    rows={2}
                    placeholder='Resposta'
                    value={item.answer}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'answer', e.target.value)
                    }
                  />
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center text-muted py-3 border rounded'>
            <small>Nenhuma pergunta adicionada</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaqSettings;

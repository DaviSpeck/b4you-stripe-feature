import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';

const SocialSettings = ({ config, onChange }) => {
  const socialNetworks = [
    { value: 'facebook', label: 'Facebook', icon: 'bxl-facebook' },
    { value: 'instagram', label: 'Instagram', icon: 'bxl-instagram' },
    { value: 'twitter', label: 'Twitter', icon: 'bxl-twitter' },
    { value: 'youtube', label: 'YouTube', icon: 'bxl-youtube' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'bxl-linkedin' },
    { value: 'tiktok', label: 'TikTok', icon: 'bxl-tiktok' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'bxl-whatsapp' },
    { value: 'telegram', label: 'Telegram', icon: 'bxl-telegram' },
  ];

  const handleAddLink = () => {
    const newLinks = [
      ...(config.links || []),
      { id: Date.now(), network: 'facebook', url: '' },
    ];
    onChange('links', newLinks);
  };

  const handleRemoveLink = (id) => {
    const newLinks = config.links.filter((link) => link.id !== id);
    onChange('links', newLinks);
  };

  const handleUpdateLink = (id, field, value) => {
    const newLinks = config.links.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onChange('links', newLinks);
  };

  return (
    <div className='block-settings'>
      <p className='text-muted small mb-2'>
        Este bloco só será exibido na página de membros se houver pelo menos um
        link de rede social configurado.
      </p>
      <Form.Group className='mb-3'>
        <Form.Label>Título da seção</Form.Label>
        <Form.Control
          type='text'
          placeholder='Ex: Me siga nas redes'
          value={config.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
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

      <Form.Group className='mb-3'>
        <Form.Label>Estilo</Form.Label>
        <Form.Control
          as='select'
          value={config.style}
          onChange={(e) => onChange('style', e.target.value)}
        >
          <option value='icons'>Ícones</option>
          <option value='buttons'>Botões</option>
        </Form.Control>
      </Form.Group>

      <div className='mb-3'>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <Form.Label className='mb-0'>Links das redes</Form.Label>
          <Button size='sm' variant='primary' onClick={handleAddLink}>
            <i className='bx bx-plus me-1' />
            Adicionar
          </Button>
        </div>

        {config.links?.length > 0 ? (
          <div className='social-links'>
            {config.links.map((link) => (
              <Card key={link.id} className='mb-2'>
                <Card.Body className='p-2'>
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <i
                      className={`bx ${
                        socialNetworks.find((n) => n.value === link.network)
                          ?.icon || 'bx-link'
                      } fs-5`}
                    />
                    <Button
                      size='sm'
                      variant='link'
                      className='text-danger p-0'
                      onClick={() => handleRemoveLink(link.id)}
                    >
                      <i className='bx bx-trash' />
                    </Button>
                  </div>
                  <Form.Control
                    as='select'
                    size='sm'
                    value={link.network}
                    onChange={(e) =>
                      handleUpdateLink(link.id, 'network', e.target.value)
                    }
                    className='mb-2'
                  >
                    {socialNetworks.map((network) => (
                      <option key={network.value} value={network.value}>
                        {network.label}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control
                    size='sm'
                    type='url'
                    placeholder='https://...'
                    value={link.url}
                    onChange={(e) =>
                      handleUpdateLink(link.id, 'url', e.target.value)
                    }
                  />
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center text-muted py-3 border rounded'>
            <small>Nenhum link adicionado</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSettings;

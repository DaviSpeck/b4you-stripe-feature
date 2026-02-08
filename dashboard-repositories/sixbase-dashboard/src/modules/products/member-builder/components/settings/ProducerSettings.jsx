import React from 'react';
import { Form } from 'react-bootstrap';

const ProducerSettings = ({ config, onChange }) => {
    return (
        <div className='block-settings'>
            <Form.Group className='mb-3'>
                <Form.Label>Título da seção</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Ex: Sobre o Produtor'
                    value={config.title}
                    onChange={(e) => onChange('title', e.target.value)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='showAvatar'
                    label='Mostrar foto do produtor'
                    checked={config.showAvatar}
                    onChange={(e) => onChange('showAvatar', e.target.checked)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='showBiography'
                    label='Mostrar biografia'
                    checked={config.showBiography}
                    onChange={(e) => onChange('showBiography', e.target.checked)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='showSocialLinks'
                    label='Mostrar redes sociais'
                    checked={config.showSocialLinks}
                    onChange={(e) => onChange('showSocialLinks', e.target.checked)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Layout</Form.Label>
                <Form.Control
                    as='select'
                    value={config.layout}
                    onChange={(e) => onChange('layout', e.target.value)}
                >
                    <option value='horizontal'>Horizontal</option>
                    <option value='vertical'>Vertical</option>
                </Form.Control>
            </Form.Group>
        </div>
    );
};

export default ProducerSettings;
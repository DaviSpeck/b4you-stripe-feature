import React from 'react';
import { Form } from 'react-bootstrap';

const ImageSettings = ({ config, onChange }) => {
    return (
        <div className='block-settings'>
            <Form.Group className='mb-3'>
                <Form.Label>URL da imagem</Form.Label>
                <Form.Control
                    type='url'
                    placeholder='https://...'
                    value={config.imageUrl}
                    onChange={(e) => onChange('imageUrl', e.target.value)}
                />
                <Form.Text className='text-muted'>
                    Upload de imagem será implementado futuramente
                </Form.Text>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Texto alternativo</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Descrição da imagem'
                    value={config.alt}
                    onChange={(e) => onChange('alt', e.target.value)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Legenda (opcional)</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Legenda da imagem'
                    value={config.caption}
                    onChange={(e) => onChange('caption', e.target.value)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Link (opcional)</Form.Label>
                <Form.Control
                    type='url'
                    placeholder='https://...'
                    value={config.link}
                    onChange={(e) => onChange('link', e.target.value)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Largura</Form.Label>
                <Form.Control
                    as='select'
                    value={config.width}
                    onChange={(e) => onChange('width', e.target.value)}
                >
                    <option value='auto'>Automática</option>
                    <option value='container'>Container</option>
                    <option value='full'>Largura total</option>
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

export default ImageSettings;
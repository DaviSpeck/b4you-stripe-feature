import React from 'react';
import { Form } from 'react-bootstrap';

const VideoSettings = ({ config, onChange }) => {
    return (
        <div className='block-settings'>
            <Form.Group className='mb-3'>
                <Form.Label>URL do vídeo</Form.Label>
                <Form.Control
                    type='url'
                    placeholder='Ex: https://www.youtube.com/watch?v=...'
                    value={config.videoUrl}
                    onChange={(e) => onChange('videoUrl', e.target.value)}
                />
                <Form.Text className='text-muted'>
                    Suporta YouTube, Vimeo e outros
                </Form.Text>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Proporção</Form.Label>
                <Form.Control
                    as='select'
                    value={config.aspectRatio}
                    onChange={(e) => onChange('aspectRatio', e.target.value)}
                >
                    <option value='16:9'>16:9 (Padrão)</option>
                    <option value='4:3'>4:3 (Clássico)</option>
                    <option value='21:9'>21:9 (Ultra-wide)</option>
                </Form.Control>
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='autoplay'
                    label='Reprodução automática'
                    checked={config.autoplay}
                    onChange={(e) => onChange('autoplay', e.target.checked)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='showControls'
                    label='Mostrar controles'
                    checked={config.showControls}
                    onChange={(e) => onChange('showControls', e.target.checked)}
                />
            </Form.Group>
        </div>
    );
};

export default VideoSettings;
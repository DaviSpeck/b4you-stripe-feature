import React from 'react';
import { Form } from 'react-bootstrap';

const SpacerSettings = ({ config, onChange }) => {
    return (
        <div className='block-settings'>
            <Form.Group className='mb-3'>
                <Form.Label>Altura do espaço</Form.Label>
                <Form.Control
                    as='select'
                    value={config.height}
                    onChange={(e) => onChange('height', e.target.value)}
                >
                    <option value='small'>Pequeno (20px)</option>
                    <option value='medium'>Médio (40px)</option>
                    <option value='large'>Grande (80px)</option>
                    <option value='custom'>Personalizado</option>
                </Form.Control>
            </Form.Group>

            {config.height === 'custom' && (
                <Form.Group className='mb-3'>
                    <Form.Label>Altura personalizada (px)</Form.Label>
                    <Form.Control
                        type='number'
                        min='0'
                        max='500'
                        value={config.customHeight}
                        onChange={(e) => onChange('customHeight', parseInt(e.target.value))}
                    />
                </Form.Group>
            )}
        </div>
    );
};

export default SpacerSettings;
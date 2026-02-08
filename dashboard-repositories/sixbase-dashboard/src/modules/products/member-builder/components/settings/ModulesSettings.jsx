import React from 'react';
import { Form } from 'react-bootstrap';

const ModulesSettings = ({ config, onChange }) => {
    return (
        <div className='block-settings'>
            <Form.Group className='mb-3'>
                <Form.Label>Título da seção</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Ex: Módulos do Curso'
                    value={config.title}
                    onChange={(e) => onChange('title', e.target.value)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='showProgress'
                    label='Mostrar progresso do aluno'
                    checked={config.showProgress}
                    onChange={(e) => onChange('showProgress', e.target.checked)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Label>Layout</Form.Label>
                <Form.Control
                    as='select'
                    value={config.layout}
                    onChange={(e) => onChange('layout', e.target.value)}
                >
                    <option value='grid'>Grade</option>
                    <option value='list'>Lista</option>
                </Form.Control>
            </Form.Group>

            {config.layout === 'grid' && (
                <Form.Group className='mb-3'>
                    <Form.Label>Colunas por linha</Form.Label>
                    <Form.Control
                        as='select'
                        value={config.columns}
                        onChange={(e) => onChange('columns', parseInt(e.target.value))}
                    >
                        <option value='2'>2 colunas</option>
                        <option value='3'>3 colunas</option>
                        <option value='4'>4 colunas</option>
                    </Form.Control>
                </Form.Group>
            )}
        </div>
    );
};

export default ModulesSettings;
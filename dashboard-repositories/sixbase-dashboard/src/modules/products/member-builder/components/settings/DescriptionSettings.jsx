import React from 'react';
import { Form } from 'react-bootstrap';

const DescriptionSettings = ({ config, onChange }) => {
    return (
        <div className='block-settings'>
            <Form.Group className='mb-3'>
                <Form.Label>Título da seção</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Ex: Sobre o Curso'
                    value={config.title}
                    onChange={(e) => onChange('title', e.target.value)}
                />
            </Form.Group>

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='useProductDescription'
                    label='Usar descrição do produto'
                    checked={config.useProductDescription}
                    onChange={(e) => onChange('useProductDescription', e.target.checked)}
                />
                <Form.Text className='text-muted'>
                    Quando ativado, exibe a descrição cadastrada no produto
                </Form.Text>
            </Form.Group>

            {!config.useProductDescription && (
                <Form.Group className='mb-3'>
                    <Form.Label>Conteúdo personalizado</Form.Label>
                    <Form.Control
                        as='textarea'
                        rows={5}
                        placeholder='Digite a descrição do curso...'
                        value={config.content}
                        onChange={(e) => onChange('content', e.target.value)}
                    />
                </Form.Group>
            )}

            <Form.Group className='mb-3'>
                <Form.Check
                    type='switch'
                    id='showStats'
                    label='Mostrar estatísticas'
                    checked={config.showStats}
                    onChange={(e) => onChange('showStats', e.target.checked)}
                />
                <Form.Text className='text-muted'>
                    Exibe duração total e número de aulas
                </Form.Text>
            </Form.Group>
        </div>
    );
};

export default DescriptionSettings;
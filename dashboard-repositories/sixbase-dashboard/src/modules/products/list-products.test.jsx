import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ModalNewCourse } from './list-products';

jest.mock('../../providers/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('../functions', () => ({
  notify: jest.fn(),
}));

const api = require('../../providers/api').default || require('../../providers/api');
const { notify } = require('../functions');

describe('ModalNewCourse FASE 6 integration smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: [{ id: 1, label: 'Geral' }] });
  });

  it('shows clear error message when backend blocks international creation (403)', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: 'forbidden', body: {} },
      },
    });

    render(
      <ModalNewCourse
        modalShow
        setModalShow={jest.fn()}
        handleClose={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome do Produto'), {
      target: { value: 'Produto internacional bloqueado' },
    });

    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByLabelText('Operação'), {
      target: { value: 'international' },
    });

    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() => {
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          message:
            'Seu produtor não está habilitado para criar produto internacional.',
        }),
      );
    });
  });

  it('keeps national creation flow unchanged', async () => {
    api.post.mockResolvedValueOnce({ status: 200 });
    const setModalShow = jest.fn();

    render(
      <ModalNewCourse
        modalShow
        setModalShow={setModalShow}
        handleClose={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Nome do Produto'), {
      target: { value: 'Produto nacional' },
    });

    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.change(screen.getByLabelText('Operação'), {
      target: { value: 'national' },
    });

    fireEvent.click(screen.getByText('Salvar'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/products',
        expect.objectContaining({ operation_scope: 'national' }),
      );
    });
    expect(setModalShow).toHaveBeenCalledWith(false);
  });
});

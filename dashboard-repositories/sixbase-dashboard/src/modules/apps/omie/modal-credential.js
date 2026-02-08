import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';

const ModalCredential = ({
  setShow,
  fetchData,
  editingIntegration,
  onClose,
}) => {
  const [requesting, setRequesting] = useState(false);
  const [formData, setFormData] = useState({
    app_key: '',
    app_secret: '',
    product_code_omie: '',
    payment_code_omie: '',
    category_code_omie: '',
    account_code_omie: '',
    scenario_code_omie: '',
  });

  // Track if app credentials were changed
  const [credentialsChanged, setCredentialsChanged] = useState({
    app_key: false,
    app_secret: false,
  });

  // Load form data when editingIntegration changes
  useEffect(() => {
    if (editingIntegration) {
      setFormData({
        app_key: '',
        app_secret: '',
        product_code_omie: editingIntegration.product_code_omie || '',
        payment_code_omie: editingIntegration.payment_code_omie || '',
        category_code_omie: editingIntegration.category_code_omie || '',
        account_code_omie: editingIntegration.account_code_omie || '',
        scenario_code_omie: editingIntegration.scenario_code_omie || '',
      });
      setCredentialsChanged({
        app_key: false,
        app_secret: false,
      });
    } else {
      // Reset form when creating new
      setFormData({
        app_key: '',
        app_secret: '',
        product_code_omie: '',
        payment_code_omie: '',
        category_code_omie: '',
        account_code_omie: '',
        scenario_code_omie: '',
      });
      setCredentialsChanged({
        app_key: false,
        app_secret: false,
      });
    }
  }, [editingIntegration]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRequesting(true);

    // Prepare data to send - only include credentials if they were changed
    const dataToSend = { ...formData };

    if (editingIntegration) {
      // When editing, only include credentials if they were changed
      if (!credentialsChanged.app_key) {
        delete dataToSend.app_key;
      }
      if (!credentialsChanged.app_secret) {
        delete dataToSend.app_secret;
      }
    }

    const apiCall = editingIntegration
      ? api.put(`/integrations/omie`, dataToSend)
      : api.post('/integrations/omie', formData);

    apiCall
      .then(() => {
        notify({
          message: editingIntegration
            ? 'Integração atualizada com sucesso'
            : 'Integração criada com sucesso',
          type: 'success',
        });
        fetchData();
        onClose();
      })
      .catch(() => {
        notify({
          message: editingIntegration
            ? 'Falha ao atualizar integração'
            : 'Falha ao criar integração',
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Track if credentials were changed
    if (name === 'app_key' || name === 'app_secret') {
      setCredentialsChanged((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>App Key</Form.Label>
        <Form.Control
          type='text'
          name='app_key'
          value={formData.app_key}
          onChange={handleChange}
          placeholder={
            editingIntegration ? '••••••••••••••••••••' : 'Sua App Key do Omie'
          }
          required={!editingIntegration}
        />
        <Form.Text className='text-muted'>
          {editingIntegration
            ? 'Deixe em branco para manter o valor atual'
            : 'Chave de autenticação da aplicação Omie.'}
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>App Secret</Form.Label>
        <Form.Control
          type='password'
          name='app_secret'
          value={formData.app_secret}
          onChange={handleChange}
          placeholder={
            editingIntegration
              ? '••••••••••••••••••••'
              : 'Seu App Secret do Omie'
          }
          required={!editingIntegration}
        />
        <Form.Text className='text-muted'>
          {editingIntegration
            ? 'Deixe em branco para manter o valor atual'
            : 'Segredo de autenticação da aplicação Omie.'}
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>Código do Produto</Form.Label>
        <Form.Control
          type='text'
          name='product_code_omie'
          value={formData.product_code_omie}
          onChange={handleChange}
          placeholder='Ex: 4422421'
          required
        />
        <Form.Text className='text-muted'>
          Código do produto que sempre será usado (previamente cadastrado no
          Omie).
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>Código da Forma de Pagamento</Form.Label>
        <Form.Control
          type='text'
          name='payment_code_omie'
          value={formData.payment_code_omie}
          onChange={handleChange}
          placeholder='Ex: 999'
          required
        />
        <Form.Text className='text-muted'>
          Código da forma de pagamento ou código de parcela.
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>Código da Categoria</Form.Label>
        <Form.Control
          type='text'
          name='category_code_omie'
          value={formData.category_code_omie}
          onChange={handleChange}
          placeholder='Ex: 1.01.03'
          required
        />
        <Form.Text className='text-muted'>
          Categoria de pedido (se você usar).
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>Código da Conta Corrente</Form.Label>
        <Form.Control
          type='number'
          name='account_code_omie'
          value={formData.account_code_omie}
          onChange={handleChange}
          placeholder='Ex: 11850365'
          required
        />
        <Form.Text className='text-muted'>
          Conta corrente para lançamento.
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Label>Código do Cenário de Impostos</Form.Label>
        <Form.Control
          type='number'
          name='scenario_code_omie'
          value={formData.scenario_code_omie}
          onChange={handleChange}
          placeholder='Ex: 3'
        />
        <Form.Text className='text-muted'>
          Cenário de impostos (opcional).
        </Form.Text>
      </Form.Group>

      <div className='d-flex justify-content-end mt-4'>
        <ButtonDS
          type='button'
          variant='secondary'
          className='mr-2'
          onClick={onClose}
        >
          Cancelar
        </ButtonDS>
        <ButtonDS type='submit' disabled={requesting}>
          {requesting
            ? 'Salvando...'
            : editingIntegration
            ? 'Atualizar'
            : 'Salvar'}
        </ButtonDS>
      </div>
    </form>
  );
};

export default ModalCredential;

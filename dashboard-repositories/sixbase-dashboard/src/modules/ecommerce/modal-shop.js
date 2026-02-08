import { useState, useEffect } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import api from '../../providers/api';
import { notify } from '../functions';

const ModalShop = ({ fetchData, setShow, shop, editMode }) => {
  const [requesting, setRequesting] = useState(false);
  const [createdShop, setCreatedShop] = useState(null);

  const { register, handleSubmit, errors, formState, reset } = useForm({
    mode: 'onChange',
  });

  const { isValid } = formState;

  useEffect(() => {
    if (editMode && shop) {
      reset({
        shop_name: shop.shop_name || '',
        shop_domain: shop.shop_domain || '',
        access_token: '', // Token não é exibido por segurança
      });
    }
  }, [editMode, shop, reset]);

  const onSubmit = (data) => {
    setRequesting(true);

    const payload = {
      shop_name: data.shop_name,
      shop_domain: data.shop_domain,
    };

    // Only include access_token if provided (for edit mode, it's optional)
    if (data.access_token && data.access_token.trim()) {
      payload.access_token = data.access_token;
    }

    const request = editMode
      ? api.put(`/integrations/ecommerce/shops/${shop.uuid}`, payload)
      : api.post('/integrations/ecommerce/shops', payload);

    request
      .then((response) => {
        if (editMode) {
          setShow(false);
          fetchData();
          notify({
            message: 'Loja atualizada com sucesso!',
            type: 'success',
          });
        } else {
          // Show success with product info
          setCreatedShop(response.data);
          fetchData();
          notify({
            message: 'Loja criada com sucesso! Configure frete e pagamento no produto container.',
            type: 'success',
          });
        }
      })
      .catch((err) => {
        console.error(err);
        notify({
          message: editMode ? 'Falha ao atualizar loja' : 'Falha ao criar loja',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  // Show success message after creation
  if (createdShop) {
    return (
      <Alert variant='success'>
        <Alert.Heading>Loja criada com sucesso!</Alert.Heading>
        <p>
          Um produto container foi criado automaticamente para esta loja.
          <strong> Configure frete e pagamento no produto container</strong> antes de usar.
        </p>
        <p className='mb-0'>
          Os order bumps configurados neste produto serão aplicados a <strong>todas</strong> as ofertas geradas.
        </p>
        <hr />
        <div className='mb-2'>
          <strong>Produto:</strong> {createdShop.container_product?.name}
        </div>
        <div className='mb-2'>
          <strong>Oferta Padrão:</strong> {createdShop.default_offer?.name}
        </div>
        <div className='d-flex justify-content-end'>
          <ButtonDS size='sm' onClick={() => setShow(false)}>
            Fechar
          </ButtonDS>
        </div>
      </Alert>
    );
  }

  return (
    <>
      <Row>
        <Col md={12}>
          <Form.Group className='mb-3'>
            <label>Nome da Loja *</label>
            <Form.Control
              name='shop_name'
              placeholder='Minha Loja'
              autoComplete='off'
              ref={register({ required: 'Nome é obrigatório' })}
              isInvalid={!!errors.shop_name}
            />
            {errors.shop_name && (
              <Form.Control.Feedback type='invalid'>
                {errors.shop_name.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className='mb-3'>
            <label>Domínio da Loja *</label>
            <Form.Control
              name='shop_domain'
              placeholder='minhaloja.myshopify.com'
              autoComplete='off'
              ref={register({ required: 'Domínio é obrigatório' })}
              isInvalid={!!errors.shop_domain}
            />
            {errors.shop_domain && (
              <Form.Control.Feedback type='invalid'>
                {errors.shop_domain.message}
              </Form.Control.Feedback>
            )}
            <Form.Text className='text-muted'>
              Domínio completo da sua loja Shopify (ex: minhaloja.myshopify.com)
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className='mb-3'>
            <label>
              Token de Acesso (Access Token) {!editMode && '*'}
            </label>
            <Form.Control
              type='text'
              name='access_token'
              placeholder={editMode ? 'Deixe em branco para manter o token atual' : 'shpat_xxx...'}
              autoComplete='off'
              data-lpignore='true'
              data-form-type='other'
              ref={register({
                required: !editMode ? 'Token de acesso é obrigatório' : false,
              })}
              isInvalid={!!errors.access_token}
            />
            {errors.access_token && (
              <Form.Control.Feedback type='invalid'>
                {errors.access_token.message}
              </Form.Control.Feedback>
            )}
            <Form.Text className='text-muted'>
              {editMode
                ? 'Deixe em branco para manter o token atual. Preencha apenas se quiser atualizar.'
                : 'Token de acesso da Shopify Admin API. Você pode gerar um em: Apps → Develop apps → Admin API access token'}
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {!editMode && (
        <Alert variant='info' className='mt-3'>
          <Alert.Heading>Próximos Passos</Alert.Heading>
          <p className='mb-0'>
            Após criar a loja, você precisará configurar <strong>frete e pagamento</strong> no produto container criado automaticamente.
          </p>
        </Alert>
      )}

      <div className='d-flex justify-content-end mt-3'>
        <ButtonDS
          size='sm'
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || requesting}
        >
          {requesting ? 'Salvando...' : editMode ? 'Atualizar' : 'Criar Loja'}
        </ButtonDS>
      </div>
    </>
  );
};

export default ModalShop;

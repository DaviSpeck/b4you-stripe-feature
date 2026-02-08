import { useEffect, useState } from 'react';
import { Col, Form, Row, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import api from '../../../providers/api';
import { notify } from '../../functions';
import { Link } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import pt from 'date-fns/locale/pt-BR';
import Switch from 'react-switch';
import moment from 'moment';
registerLocale('pt-BR', pt);

const ModalCredential = ({
  fetchData,
  setShow,
  activeCredential,
  setActiveCredential,
}) => {
  const [requesting, setRequesting] = useState(false);
  const [products, setProducts] = useState(null);
  const [suppliers, setSuppliers] = useState(null);
  const [affiliateProducts, setAffiliatesProducts] = useState(null);
  const { register, handleSubmit, errors, reset, watch, control } = useForm({
    mode: 'onChange',
  });

  const [selectedProduct, setSelectedProduct] = useState();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  useEffect(() => {
    if (activeCredential) {
      const fields = activeCredential.settings;
      fields.send_invoice_customer_mail =
        activeCredential.settings.send_invoice_customer_mail.toString();
      fields.issue_invoice = activeCredential.settings.issue_invoice.toString();
      fields.type = activeCredential.settings.type
        ? activeCredential.settings.type.toString()
        : 'service';
      fields.service_label = activeCredential.settings.service_label
        ? activeCredential.settings.service_label.toString()
        : '';
      if (activeCredential.id_product) {
        fields.start_date = new Date(activeCredential.start_date);
        fields.start_date.setHours(fields.start_date.getHours() + 3);
      } else {
        fields.start_date = moment().toDate();
      }

      fields.product = activeCredential.id_product;
      fields.active = activeCredential.active;
      fields.id_external_notazz = activeCredential.id_external_notazz;
      fields.generate_invoice = activeCredential.settings.generate_invoice
        ? activeCredential.settings.generate_invoice.toString()
        : 'false';
      fields.group_upsell_order = activeCredential.settings.group_upsell_order
        ? activeCredential.settings.group_upsell_order.toString()
        : 'false';
      fields.webhook_token = activeCredential.settings?.webhook_token
        ? activeCredential.settings.webhook_token
        : null;
      setSelectedProduct(
        activeCredential.id_product === null ? '0' : activeCredential.id_product
      );
      reset(fields);
    }
    return () => {
      setActiveCredential(null);
      reset({});
    };
  }, []);

  const fetchIntegrations = () => {
    api
      .get('/products/integrations')
      .then((response) => {
        setProducts(response.data.rows);
        setAffiliatesProducts(response.data.affiliates);
        setSuppliers(response.data.suppliers);
      })
      .catch(() => {})
      .finally();
  };

  const onSubmit = (data) => {
    console.log(data);
    if (activeCredential) {
      data.uuid = activeCredential.uuid;
    }
    if (watch('type') === 'service' && !data.service_label) {
      notify({
        message: 'Por favor, preencha a descrição do serviço.',
        type: 'error',
      });
      return;
    }
    let id_product = watch('product');
    if (!id_product) {
      notify({
        message: 'Por favor, selecione um produto.',
        type: 'error',
      });
      return;
    }
    data.id_product = id_product;
    setRequesting(true);
    if (!activeCredential) {
      api
        .post('/integrations/notazz', data)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Credencial criada com sucesso',
            type: 'success',
          });
        })
        .catch((error) => {
          if (error?.response?.data?.message) {
            notify({
              message: error.response.data.message,
              type: 'error',
            });
          } else {
            notify({
              message: 'Falha ao criar credencial: ',
              type: 'error',
            });
          }
        })
        .finally(() => setRequesting(false));
    } else {
      api
        .put('/integrations/notazz', data)
        .then(() => {
          fetchData();
          setShow(false);
          notify({
            message: 'Credencial atualizada com sucesso',
            type: 'success',
          });
        })
        .catch(() => {
          notify({
            message: 'Falha ao atualizar credencial',
            type: 'error',
          });
        })
        .finally(() => setRequesting(false));
    }
  };

  return (
    <section id='pagenotazz'>
      <Row>
        <Col xs={12} className='justify-content-start '>
          <div className='form-group'>
            <Controller
              control={control}
              name='active'
              defaultValue={true}
              render={({ onChange, value }) => (
                <div className='d-flex align-items-center'>
                  <Switch
                    onChange={onChange}
                    checked={value}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    onColor='#0f1b35'
                    onHandleColor='#fff'
                    boxShadow='0px 1px 5px rgba(0, 0, 0, 0.2)'
                    activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                    handleDiameter={24}
                    height={30}
                    width={56}
                    className='react-switch'
                  />
                  <span className='ml-2'>
                    {value ? (
                      <span>Ativo</span>
                    ) : (
                      <span className='text-danger'>Desativado</span>
                    )}
                  </span>
                </div>
              )}
            />
          </div>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>Nome</label>
            <Form.Control
              ref={register({ required: true })}
              name='name'
              isInvalid={errors.name}
            />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <div className='form-group'>
            <label htmlFor=''>Produto</label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top-invisible-offer`}>
                  Por segurança, não é possível alterar o produto após a
                  criação.
                </Tooltip>
              }
            >
              <i className='bx bx-info-circle ml-2'></i>
            </OverlayTrigger>
            <Form.Control
              as='select'
              name='product'
              ref={register({ required: true })}
              disabled={
                (products &&
                  products.length === 0 &&
                  affiliateProducts &&
                  affiliateProducts.length === 0 &&
                  suppliers &&
                  suppliers.length === 0) ||
                activeCredential
                  ? true
                  : false
              }
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {!activeCredential ||
                (!activeCredential.id_product && (
                  <option value='0' selected disabled>
                    -Selecione-
                  </option>
                ))}

              {products &&
                products.some((item) => item.payment_type === 'single') && (
                  <optgroup label='Pagamento único'>
                    {products
                      .filter((p) => p.payment_type === 'single')
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </optgroup>
                )}

              {products &&
                products.some((p) => p.payment_type !== 'single') && (
                  <optgroup label='Pagamento recorrente'>
                    {products
                      .filter((p) => p.payment_type !== 'single')
                      .map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              {affiliateProducts && affiliateProducts.length > 0 && (
                <optgroup label='Produtos que sou afiliado'>
                  {affiliateProducts.map((item) => (
                    <option value={item.product.id} key={item.product.id}>
                      {item.product.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {suppliers && suppliers.length > 0 && (
                <optgroup label='Produtos que sou fornecedor'>
                  {suppliers.map((item) => (
                    <option value={item.product.id} key={item.product.id}>
                      {item.product.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </Form.Control>

            {products &&
              products.length === 0 &&
              affiliateProducts &&
              affiliateProducts.length === 0 &&
              suppliers &&
              suppliers.length === 0 && (
                <div
                  className='mt-2'
                  style={{ fontSize: 12, color: '#ff285c' }}
                >
                  Você não possui nenhum produto cadastrado.{' '}
                  <Link to='/produtos/listar' style={{ color: '#0f1b35' }}>
                    Cadastrar agora
                  </Link>
                </div>
              )}
          </div>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>API Key</label>
            <Form.Control
              ref={register({ required: true })}
              name='api_key'
              isInvalid={errors.api_key}
            />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>API Key Logistica (não obrigatório)</label>
            <Form.Control
              ref={register({ required: false })}
              name='api_key_logistic'
              isInvalid={errors.api_key_logistc}
            />
          </Form.Group>
        </Col>
        <Col xs={6}>
          <div className='form-group'>
            <label htmlFor=''>Webhook Logistica </label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top-invisible-offer`}>
                  Este campo corresponde ao token que é encontrado dentro da
                  plataforma Notazz em: Configurações - Empresas - Selecione sua
                  empresa e clique em webhook. Nesta página você irá encontrar
                  um Token Webhook para inserir neste campo da B4you
                </Tooltip>
              }
            >
              <i className='bx bx-info-circle ml-2'></i>
            </OverlayTrigger>
            <Form.Control
              ref={register({ required: false })}
              name='webhook_token'
              isInvalid={errors.webhook_token}
            />
          </div>
        </Col>
        <Col xs={6}>
          <div className='form-group'>
            <label htmlFor=''>Código Externo Notazz</label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top-invisible-offer`}>
                  Este campo corresponde ao código do produto cadastrado na
                  plataforma Notazz. Caso não seja informado, o identificador da
                  oferta será utilizado como código do produto. Observação: se
                  for informado um código inexistente, ocorrerá um erro na
                  integração ao enviar os pedidos.
                </Tooltip>
              }
            >
              <i className='bx bx-info-circle ml-2'></i>
            </OverlayTrigger>
            <Form.Control
              ref={register({ required: false })}
              name='id_external_notazz'
              isInvalid={errors.id_external_notazz}
            />
          </div>
        </Col>
        <Col xs={6}>
          <div className='form-group'>
            <label htmlFor=''>Tipo</label>
            <Form.Control
              as='select'
              name='type'
              ref={register({ required: true })}
            >
              <option value='service'>Serviço</option>
              <option value='product'>Produto</option>
            </Form.Control>
          </div>
        </Col>

        <Col md={6}>
          <div className='form-group'>
            <label>Data de Inicio</label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top-invisible-offer`}>
                  Por segurança, não é possível alterar a data de início da
                  integração após a criação.
                </Tooltip>
              }
            >
              <i className='bx bx-info-circle ml-2'></i>
            </OverlayTrigger>
            <Controller
              control={control}
              name='start_date'
              rules={{ required: 'Campo obrigatório' }}
              render={({ onChange, value }) => (
                <>
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    locale='pt-BR'
                    dateFormat='P'
                    disabled={activeCredential ? true : false}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                    className={
                      errors.start_date
                        ? 'form-control is-invalid w-100'
                        : 'form-control w-100'
                    }
                  />
                  <div className='form-error'>
                    {errors.start_date && (
                      <span>{errors.start_date.message}</span>
                    )}
                  </div>
                </>
              )}
            />
          </div>
        </Col>

        {watch('type') === 'service' && (
          <Col xs={12}>
            <Form.Group>
              <label htmlFor=''>Descrição do serviço</label>
              <Form.Control
                ref={register({ required: false })}
                name='service_label'
                isInvalid={errors.service_label}
              />
            </Form.Group>
          </Col>
        )}
        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>Quando enviar a nota fiscal?</label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='issue_invoice0'
                  name='issue_invoice'
                  value={0}
                  className='pointer'
                  defaultChecked
                />
                <label htmlFor='issue_invoice0' className='pointer'>
                  Emitir após o período de garantia
                </label>
              </div>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='issue_invoice1'
                  name='issue_invoice'
                  value={1}
                  className='pointer'
                />
                <label htmlFor='issue_invoice1' className='pointer'>
                  Emitir quando o pagamento for aprovado
                </label>
              </div>
            </small>
          </Form.Group>
        </Col>

        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>Emitir automaticamente a nota fiscal?*</label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top-invisible-offer`}>
                  Caso ativado, a nota será emitida automaticamente ao ser
                  enviada para o Notazz. Caso desativado, será necessário ir até
                  o painel do Notazz e aprovar cada nota de forma manual.
                </Tooltip>
              }
            >
              <i className='bx bx-info-circle ml-2'></i>
            </OverlayTrigger>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='generate_invoice0'
                  name='generate_invoice'
                  value='true'
                  className='pointer'
                  defaultChecked
                />
                <label htmlFor='generate_invoice0' className='pointer'>
                  Sim
                </label>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='generate_invoice1'
                  name='generate_invoice'
                  value='false'
                  className='pointer ml-4'
                />
                <label htmlFor='generate_invoice1' className='pointer'>
                  Não
                </label>
              </div>
            </small>
          </Form.Group>
        </Col>

        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>
              Enviar nota fiscal via email para o cliente?*
            </label>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='send_invoice_customer_mail1'
                  name='send_invoice_customer_mail'
                  value='true'
                  className='pointer'
                  defaultChecked
                />
                <label
                  htmlFor='send_invoice_customer_mail1'
                  className='pointer'
                >
                  Sim
                </label>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='send_invoice_customer_mail2'
                  name='send_invoice_customer_mail'
                  value='false'
                  className='pointer ml-4'
                />
                <label
                  htmlFor='send_invoice_customer_mail2'
                  className='pointer'
                >
                  Não
                </label>
              </div>
            </small>
          </Form.Group>
        </Col>

        <Col xs={6}>
          <Form.Group>
            <label htmlFor=''>Agrupar pedido Upsell?*</label>
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id={`tooltip-top-invisible-offer`}>
                  Caso ativado, os pedidos de upsell serão agrupados na mesma
                  nota fiscal do produto principal, juntamente com os produtos
                  de Order Bump da compra.
                </Tooltip>
              }
            >
              <i className='bx bx-info-circle ml-2'></i>
            </OverlayTrigger>
            <small>
              <div className='d-flex'>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='group_upsell_order0'
                  name='group_upsell_order'
                  value='true'
                  className='pointer'
                  defaultChecked
                />
                <label htmlFor='group_upsell_order0' className='pointer'>
                  Sim
                </label>
                <Form.Check
                  ref={register()}
                  type='radio'
                  id='group_upsell_order1'
                  name='group_upsell_order'
                  value='false'
                  className='pointer ml-4'
                />
                <label htmlFor='group_upsell_order1' className='pointer'>
                  Não
                </label>
              </div>
            </small>
          </Form.Group>
        </Col>

        <Col xs={12} className='d-flex mt-3 justify-content-end'>
          <ButtonDS
            size={'sm'}
            onClick={handleSubmit(onSubmit)}
            disabled={requesting}
            className='w-100'
          >
            {!requesting ? 'Salvar' : 'salvando...'}
          </ButtonDS>
        </Col>
      </Row>
    </section>
  );
};

export default ModalCredential;

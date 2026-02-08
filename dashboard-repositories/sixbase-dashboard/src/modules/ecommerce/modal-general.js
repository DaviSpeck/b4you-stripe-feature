import { useEffect, useState } from 'react';
import { Card, Col, Form, Row, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import UploadImage from '../../jsx/components/UploadImage';
import api from '../../providers/api';
import regexEmail from '../../utils/regex-email';
import regexUrl from '../../utils/regex-url';
import { notify } from '../functions';
import RemoveUploadImage from '../../jsx/components/RemoveUploadImage';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Loader from '../../utils/loader';

const ModalGeneral = ({ setShow, shop, embedded = false }) => {
  const [requesting, setRequesting] = useState(false);
  const [requestingRemove, setRequestingRemove] = useState(false);
  const [requestingEmailTest, setRequestingEmailTest] = useState(false);
  const [, setCharCount] = useState(0);
  const [, setCharCount2] = useState(0);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
  });

  const productUuid = shop?.container_product?.uuid;

  const hasEmoji = (text) => {
    if (!text) return false;
    const textContent = text.replace(/<[^>]*>/g, '');
    const surrogatePairRegex = /[\ud83c-\ud83e][\udc00-\udfff]/g;
    if (surrogatePairRegex.test(textContent)) {
      return true;
    }
    const emojiRegex = /[\u00a9\u00ae\u203c\u2049\u2122\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23e9-\u23f3\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u261d\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267e\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26ce\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f7-\u26fa\u26fd\u2702\u2705\u2708-\u270d\u270f\u2712\u2714\u2716\u271d\u2721\u2728\u2733\u2734\u2744\u2747\u274c\u274e\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27a1\u27b0\u27bf\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299]/g;
    return emojiRegex.test(textContent);
  };

  const removeEmojisFromHtml = (html) => {
    if (!html) return html;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const surrogatePairRegex = /[\ud83c-\ud83e][\udc00-\udfff]/g;
    const emojiRegex = /[\u00a9\u00ae\u203c\u2049\u2122\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23e9-\u23f3\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u261d\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2640\u2642\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267e\u267f\u2692-\u2697\u2699\u269b\u269c\u26a0\u26a1\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26ce\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f7-\u26fa\u26fd\u2702\u2705\u2708-\u270d\u270f\u2712\u2714\u2716\u271d\u2721\u2728\u2733\u2734\u2744\u2747\u274c\u274e\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27a1\u27b0\u27bf\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299]/g;
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );
    let node;
    const textNodes = [];
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }
    textNodes.forEach((textNode) => {
      let cleanedText = textNode.textContent;
      cleanedText = cleanedText.replace(surrogatePairRegex, '');
      cleanedText = cleanedText.replace(emojiRegex, '');
      textNode.textContent = cleanedText;
    });
    return tempDiv.innerHTML;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  useEffect(() => {
    if (product) {
      register('email_template');
      setValue('email_template', product.email_template || '');
    }
  }, [register, product, setValue]);

  useEffect(() => {
    if (productUuid) {
      fetchProduct();
      fetchCategories();
    }
  }, [productUuid]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/product/${productUuid}`);
      setProduct(response.data);
      reset(response.data);
      setCharCount(response.data.description ? response.data.description.length : 0);
      setCharCount2(response.data.biography ? response.data.biography.length : 0);
      if (response.data.dimensions !== null) {
        setDimensions(response.data.dimensions);
      }
      if (response.data.warranty === null) {
        setValue('warranty', 7);
      }
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      notify({ message: 'Falha ao carregar produto', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data);
      if (product) {
        setValue('category', product.category?.id);
      }
    } catch (err) {
      setCategories([]);
    }
  };

  const onSubmit = (data) => {
    if (!productUuid) {
      notify({ message: 'Produto container não encontrado', type: 'error' });
      return;
    }

    setRequesting(true);
    
    if (product?.email_template && hasEmoji(product.email_template)) {
      setError('email_template', {
        type: 'manual',
        message: 'Não é permitido inserir emoji neste campo',
      });
      notify({
        message: 'Não é permitido inserir emoji no corpo do e-mail',
        type: 'error',
      });
      setRequesting(false);
      return;
    }
    
    if (data['refund_email'] === '') {
      data['refund_email'] = null;
    }
    if (product?.email_template) {
      if (product.type === 'video' || product.type === 'ebook') {
        if (!product.email_template.includes('{first_access_link}')) {
          setError('email_template', {
            type: 'manual',
            message: 'O template deve conter: {first_access_link}',
          });
          setRequesting(false);
          return;
        }
      } else if (
        !product?.email_template?.includes('{product_name}') ||
        !product?.email_template?.includes('{amount}') ||
        !product?.email_template?.includes('{sale_uuid}')
      ) {
        setError('email_template', {
          type: 'manual',
          message:
            'O template deve conter: {product_name} e {amount} e {sale_uuid}',
        });
        setRequesting(false);
        return;
      }
    }
    let fields = {
      ...data,
      support_whatsapp: data.support_whatsapp?.replaceAll('_', '') || '',
      ...dimensions,
      email_subject: product?.email_subject,
      email_template: product?.email_template,
    };
    api
      .put(`/products/${productUuid}/general`, fields)
      .then((response) => {
        notify({ message: 'Salvo com sucesso', type: 'success' });
        setProduct(response.data);
        clearErrors('email_template');
      })
      .catch(() => {
        notify({ message: 'Erro', type: 'error' });
      })
      .finally(() => setRequesting(false));
  };

  const removeEmailTemplate = () => {
    if (!productUuid) return;
    setRequestingRemove(true);
    api
      .put(`/products/${productUuid}/general/email-template`)
      .then(() => {
        notify({
          message: 'Modelo de e-mail restaurado para o padrão da plataforma.',
          type: 'success',
        });
      })
      .catch(() => {
        notify({ message: 'Erro', type: 'error' });
      })
      .finally(() => {
        setRequestingRemove(false);
      });
  };

  const sendEmailTest = () => {
    if (!productUuid) return;
    if (product?.email_template && hasEmoji(product.email_template)) {
      setError('email_template', {
        type: 'manual',
        message: 'Não é permitido inserir emoji neste campo',
      });
      notify({
        message: 'Não é permitido inserir emoji no corpo do e-mail',
        type: 'error',
      });
      setRequestingEmailTest(false);
      return;
    }
    
    if (product?.type === 'video' || product?.type === 'ebook') {
      if (!product.email_template?.includes('{first_access_link}')) {
        setError('email_template', {
          type: 'manual',
          message: 'O template deve conter: {first_access_link}',
        });
        setRequestingEmailTest(false);
        return;
      }
    } else if (
      !product?.email_template?.includes('{product_name}') ||
      !product?.email_template?.includes('{amount}') ||
      !product?.email_template?.includes('{sale_uuid}')
    ) {
      setError('email_template', {
        type: 'manual',
        message:
          'O template deve conter: {product_name} e {amount} e {sale_uuid}',
      });
      setRequestingEmailTest(false);
      return;
    }
    setRequestingEmailTest(true);
    const body = {
      email_template: product?.email_template,
      email_subject: product?.email_subject,
    };
    api
      .post(`/products/${productUuid}/general/email-template/send`, body)
      .then(() => {
        notify({
          message:
            'Modelo de e-mail enviado para email da conta logada. Não esqueça de salvar o modelo para efetuar a transação.',
          type: 'warn',
        });
      })
      .catch((error) => {
        if (error.message === 'Request failed with status code 429') {
          notify({
            message: 'Você pode enviar até 2 emails por minuto',
            type: 'error',
          });
        } else {
          notify({ message: 'Erro', type: 'error' });
        }
      })
      .finally(() => {
        setRequestingEmailTest(false);
      });
  };

  const handleDimensionChange = (e) => {
    setDimensions({
      ...dimensions,
      [e.target.name]: parseFloat(e.target.value) || 0,
    });
  };

  const setImg_link = (link, name) => {
    setProduct((prev) => ({ ...prev, [name]: link }));
  };

  if (loading) {
    return <Loader title='Carregando configurações gerais...' />;
  }

  if (!productUuid || !product) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <>
      <ConfirmAction
        show={modalCancelShow}
        setShow={setModalCancelShow}
        handleAction={removeEmailTemplate}
        title='Restaurar modelo de e-mail'
        textDetails='Deseja restaurar o modelo de e-mail para o padrão da plataforma?'
      />
      <section id='general'>
        <Row>
          <Col md={12} className='mb-3'>
            <h4>Produto</h4>
            <small>
              A aprovação do produto é instantânea, ou seja, você pode cadastrar
              e já começar a vender. A imagem do produto, se for enviada de
              tamanho diferente, será redimensionada e cortada.
            </small>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <div className='form-group' id='produt-uuid-wrap'>
                      <label htmlFor='produt-uuid'>ID do produto</label>
                      <div className='d-flex'>
                        <Form.Control
                          id='produt-uuid'
                          type='text'
                          value={product?.uuid || ''}
                          readOnly
                          onClick={() => {
                            let copyText =
                              document.querySelector('#produt-uuid');
                            copyText.select();
                            document.execCommand('copy');
                            notify({
                              message: 'ID copiado com sucesso',
                              type: 'success',
                            });
                          }}
                          style={{ borderRadius: '8px 0px 0px 8px' }}
                        />
                        <ButtonDS
                          variant={'primary'}
                          onClick={() => {
                            let copyText =
                              document.querySelector('#produt-uuid');
                            copyText.select();
                            document.execCommand('copy');
                            notify({
                              message: 'ID copiado com sucesso',
                              type: 'success',
                            });
                          }}
                          className='d-flex align-items-center'
                          style={{ borderRadius: '0px 8px 8px 0px' }}
                        >
                          <i
                            className='bx bx-copy-alt'
                            style={{ fontSize: 21 }}
                          ></i>
                        </ButtonDS>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Row>
                      {product.has_bling && (
                        <Col md={12}>
                          <div className='form-group'>
                            <label htmlFor=''>SKU BLING</label>
                            <Form.Control
                              name='bling_sku'
                              ref={register}
                              isInvalid={errors.bling_sku}
                              className={
                                !errors.bling_sku
                                  ? 'form-control'
                                  : 'form-control is-invalid'
                              }
                            />
                            <div className='form-error'>
                              {errors.bling_sku && (
                                <span>{errors.bling_sku.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                      )}
                      {product.has_tiny && (
                        <Col md={12}>
                          <div className='form-group'>
                            <label htmlFor=''>SKU TINY</label>
                            <Form.Control
                              name='tiny_sku'
                              ref={register}
                              isInvalid={errors.tiny_sku}
                              className={
                                !errors.tiny_sku
                                  ? 'form-control'
                                  : 'form-control is-invalid'
                              }
                            />
                            <div className='form-error'>
                              {errors.tiny_sku && (
                                <span>{errors.tiny_sku.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                      )}
                      <Col md={12}>
                        <div className='form-group'>
                          <label htmlFor=''>* Nome do Produto</label>
                          <Form.Control
                            name='name'
                            ref={register({ required: 'Campo Obrigatório' })}
                            isInvalid={errors.name}
                            className={
                              !errors.name
                                ? 'form-control'
                                : 'form-control is-invalid'
                            }
                          />
                          <div className='form-error'>
                            {errors.name && <span>{errors.name.message}</span>}
                          </div>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className='form-group'>
                          <label htmlFor=''>Categoria</label>
                          <Form.Control
                            as='select'
                            name='category'
                            className='form-control'
                            ref={register}
                          >
                            {categories.map((item, index) => {
                              return (
                                <option value={item.id} key={index}>
                                  {item.label}
                                </option>
                              );
                            })}
                          </Form.Control>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className='form-group'>
                          <label htmlFor=''>Garantia</label>
                          <Form.Control
                            as='select'
                            ref={register}
                            name='warranty'
                            defaultValue='7'
                          >
                            <option value='7'>7 dias</option>
                            <option value='15'>15 dias</option>
                            <option value='21'>21 dias</option>
                            <option value='30'>30 dias</option>
                          </Form.Control>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Row>
                  <Col>
                    <div className='product-cover'>
                      <label htmlFor=''>
                        <i className='bx bx-camera' /> Imagem do Produto desktop
                        e mobile
                        <div>
                          <small>Visivel na área de membros</small>
                        </div>
                      </label>
                      <UploadImage
                        route={`/products/cover/${productUuid}`}
                        multiple={false}
                        field={'cover'}
                        update={'cover'}
                        setImg_link={(link) => setImg_link(link, 'cover')}
                      />
                      <small className='d-block mt-2'>
                        Dimensão esperada 310 x 310 px
                      </small>
                      {product?.cover && (
                        <RemoveUploadImage
                          route={`/products/cover/${productUuid}`}
                          setImg_link={(link) => setImg_link(link, 'cover')}
                        />
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <div className='form-group'>
                      <label htmlFor=''>Descrição</label>
                      <ReactQuill
                        theme='snow'
                        value={product?.description || ''}
                        onChange={(value) => {
                          setProduct((prev) => ({ ...prev, description: value }));
                          setValue('description', value);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md={12} className='mb-3'>
            <h4>Suporte ao cliente</h4>
            <small>
              Estas informações ficarão disponíveis para os clientes no checkout
              e na área de membros.
            </small>
          </Col>
          <Col className='form-group' md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col className='form-group' md={6}>
                    <label htmlFor=''>Nome de exibição do produtor</label>
                    <Form.Control ref={register} name='nickname' />
                  </Col>
                  <Col className='form-group' md={6}>
                    <label htmlFor=''>* URL Página de vendas</label>
                    <Form.Control
                      type='url'
                      placeholder='http://...'
                      ref={register({
                        required: true,
                        validate: (value) => {
                          if (value.length === 0) return false;
                          return regexUrl(value);
                        },
                      })}
                      name='sales_page_url'
                      isInvalid={errors.sales_page_url}
                    />
                    <div className='form-error' id='repeat_email_name_help'>
                      {errors.sales_page_url && (
                        <span>{errors.sales_page_url.message}</span>
                      )}
                    </div>
                  </Col>
                  <Col className='form-group' md={6}>
                    <label htmlFor=''>* E-mail de Suporte</label>
                    <Form.Control
                      type='email'
                      ref={register({
                        required: true,
                        validate: (value) => {
                          if (value.length === 0) {
                            return false;
                          }
                          return regexEmail(value);
                        },
                      })}
                      name='support_email'
                      isInvalid={errors.support_email}
                    />
                    <div className='form-error'>
                      {errors.support_email && (
                        <span>{errors.support_email.message}</span>
                      )}
                    </div>
                  </Col>
                  <Col className='form-group' md={6}>
                    <label htmlFor=''>Whatsapp de Suporte</label>
                    <InputMask
                      name='support_whatsapp'
                      ref={register()}
                      className={
                        !errors.support_whatsapp
                          ? 'form-control'
                          : 'form-control is-invalid'
                      }
                      mask='99 99999 9999'
                    />
                    <div className='form-error'>
                      {errors.support_whatsapp && (
                        <span>{errors.support_whatsapp.message}</span>
                      )}
                    </div>
                  </Col>
                  <Col className='form-group' md={6}>
                    <label htmlFor=''>E-mail de reembolsos</label>
                    <Form.Control
                      type='email'
                      name='refund_email'
                      isInvalid={errors.refund_email}
                      ref={register()}
                    />
                    <div className='form-error'>
                      {errors.refund_email && (
                        <span>{errors.refund_email.message}</span>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12}>
                    <div className='form-group'>
                      <label htmlFor=''>Descrição</label>
                      <ReactQuill
                        theme='snow'
                        value={product?.description || ''}
                        onChange={(value) => {
                          setProduct((prev) => ({ ...prev, description: value }));
                          setValue('description', value);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div className='form-group'>
                      <label htmlFor=''>Biografia</label>
                      <ReactQuill
                        theme='snow'
                        value={product?.biography || ''}
                        onChange={(value) => {
                          setProduct((prev) => ({ ...prev, biography: value }));
                          setValue('biography', value);
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md={12} className='mb-3'>
            <h4>Personalização de E-mails</h4>
            <small>
              Personalize o e-mail enviado ao cliente quando a compra for
              aprovada. Você pode usar HTML e formatação básica no corpo do
              e-mail.
            </small>
          </Col>
          <Col className='form-group' md={12}>
            <Card>
              <Card.Body>
                <Row>
                  <Col md={12} className='mb-3 d-flex align-items-end'>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <label htmlFor='email_subject'>Assunto do E-mail</label>
                      <Form.Control
                        name='email_subject'
                        value={product?.email_subject || ''}
                        placeholder='Assunto do e-mail de compra aprovada'
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            email_subject: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <ButtonDS
                      variant='warning'
                      style={{ height: 38 }}
                      disabled={requestingRemove}
                      onClick={() => {
                        setProduct((prev) => ({
                          ...prev,
                          email_subject: '',
                          email_template: '',
                        }));
                        setValue('email_subject', '');
                        setValue('email_template', '');
                        removeEmailTemplate();
                      }}
                    >
                      {!requestingRemove
                        ? 'Remover modelo personalizado'
                        : 'Removendo...'}
                    </ButtonDS>
                    <ButtonDS
                      variant='primary'
                      style={{ height: 38, marginLeft: 10 }}
                      disabled={requestingEmailTest}
                      onClick={() => {
                        sendEmailTest();
                      }}
                    >
                      {!requestingEmailTest
                        ? 'Enviar email teste'
                        : 'Enviando...'}
                    </ButtonDS>
                  </Col>
                  <Col md={12} className='mt-2'>
                    <label htmlFor='email_template'>Corpo do E-mail</label>
                    <div className='quill-editor' style={{ marginBottom: 8 }}>
                      <ReactQuill
                        theme='snow'
                        value={product?.email_template || ''}
                        onChange={(content) => {
                          if (hasEmoji(content)) {
                            setError('email_template', {
                              type: 'manual',
                              message: 'Não é permitido inserir emoji neste campo',
                            });
                            notify({
                              message: 'Não é permitido inserir emoji no corpo do e-mail',
                              type: 'error',
                            });
                            const cleanedContent = removeEmojisFromHtml(content);
                            setValue('email_template', cleanedContent);
                            setProduct((prev) => ({
                              ...prev,
                              email_template: cleanedContent,
                            }));
                            return;
                          }
                          setValue('email_template', content);
                          setProduct((prev) => ({
                            ...prev,
                            email_template: content,
                          }));
                          clearErrors('email_template');
                        }}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['link'],
                          ],
                        }}
                        formats={[
                          'header',
                          'bold',
                          'italic',
                          'underline',
                          'strike',
                          'list',
                          'bullet',
                          'link',
                        ]}
                        style={{ minHeight: 100 }}
                      />
                    </div>
                    <div className='form-error' id='email_template'>
                      {errors.email_template && (
                        <span>{errors.email_template.message}</span>
                      )}
                    </div>
                    <small
                      className='d-block'
                      style={{ marginTop: 2, marginBottom: 0 }}
                    >
                      Você pode usar as variáveis abaixo no corpo do e-mail para
                      personalizar a mensagem:
                      <ul style={{ marginTop: 4, marginBottom: 0 }}>
                        {product?.type !== 'physical' && (
                          <li>
                            <code>{'{first_access_link}'}</code> - *Botão com
                            acesso inicial do cliente (obrigatório).
                          </li>
                        )}
                        <li>
                          <code>{'{full_name}'}</code> — Nome completo do
                          cliente
                        </li>
                        <li>
                          <code>{'{product_name}'}</code> — Nome do produto
                        </li>
                        <li>
                          <code>{'{amount}'}</code> — Valor da compra
                        </li>
                        <li>
                          <code>{'{producer_name}'}</code> — Nome do produtor
                        </li>
                        <li>
                          <code>{'{support_email}'}</code> — E-mail de suporte
                        </li>
                        <li>
                          <code>{'{sale_uuid}'}</code> — Código da venda
                        </li>
                      </ul>
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-3'>
          <Col md={12}>
            <Card>
              <Card.Body>
                <h4>Dimensões</h4>
                <p className='text-muted'>
                  Usado para calcular as taxas de frete no checkout.
                </p>
                <Row className='mb-3 g-2'>
                  <Col xs={12} md={3}>
                    <Form.Group>
                      <Form.Label>Comprimento</Form.Label>
                      <Form.Control
                        type='number'
                        placeholder='0.00'
                        step='0.01'
                        name='length'
                        value={dimensions.length}
                        onChange={handleDimensionChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Group>
                      <Form.Label>Largura</Form.Label>
                      <Form.Control
                        type='number'
                        placeholder='0.00'
                        step='0.01'
                        name='width'
                        value={dimensions.width}
                        onChange={handleDimensionChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Group>
                      <Form.Label>Altura</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type='number'
                          placeholder='0.00'
                          step='0.01'
                          name='height'
                          value={dimensions.height}
                          onChange={handleDimensionChange}
                        />
                        <InputGroup.Text>cm</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Group>
                      <Form.Label>Peso</Form.Label>
                      <InputGroup>
                        <Form.Control
                          name='weight'
                          type='number'
                          placeholder='0.00'
                          step='0.01'
                          value={dimensions.weight}
                          onChange={handleDimensionChange}
                        />
                        <InputGroup.Text>kg</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-4'>
          <Col className='d-flex justify-content-end'>
            <ButtonDS onClick={handleSubmit(onSubmit)} disabled={requesting}>
              {!requesting ? 'Salvar' : 'salvando...'}
            </ButtonDS>
          </Col>
        </Row>
      </section>
    </>
  );
};

export default ModalGeneral;

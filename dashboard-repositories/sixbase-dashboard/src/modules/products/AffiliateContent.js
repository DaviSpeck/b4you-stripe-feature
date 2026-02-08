import { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Form, Row, Tab } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { Controller } from 'react-hook-form';
import Switch from 'react-switch';
import api from '../../providers/api';
import regexEmail from '../../utils/regex-email';
import './styles.scss';
import { currency, notify } from '../functions';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import AlertDS from '../../jsx/components/design-system/AlertDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import papa from 'papaparse';

const AffiliateContent = ({
  uuidProduct,
  fetchAffiliateSettings,
  requesting,
  setRequesting,
  commission,
  setCommission,
  allowAffiliate,
  setAllowAffiliate,
  allowSubscriptionFee,
  setAllowSubscriptionFee,
  control,
  errors,
  register,
  handleSubmit,
  setValue,
  product,
}) => {
  const [countOffers, setCountOffers] = useState(null);
  const [allOffers, setAllOffers] = useState([]);

  const [sixbaseFeeFixed] = useState(2); // todo
  const [sixbaseFeePercent] = useState(0.06); // todo

  const [price, setPrice] = useState(0);
  const [earnings, setEarnings] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [emails, setEmails] = useState('');
  const [requestingImport, setRequestingImport] = useState(false);
  const fileRef = useRef(null);

  const [, setLoading] = useState(true);
  const [option, setOption] = useState(null);
  const [productsToAffiliate, setProductsToAffiliate] = useState([]);
  const [selectedProductsAffiliate, setSelectedProductsAffiliate] = useState(
    []
  );

  const [showScopeModal, setShowScopeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [applyScope, setApplyScope] = useState('future'); // 'future' | 'all'
  const [pendingCommission, setPendingCommission] = useState(null);
  const [bulkApplying, setBulkApplying] = useState(false);

  const [initialCommission, setInitialCommission] = useState(null);
  const [pendingFields, setPendingFields] = useState(null); // guarda o form para o "future"

  useEffect(() => {
    if (initialCommission === null && typeof commission === 'number') {
      setInitialCommission(commission);
    }
  }, [commission, initialCommission]);

  useEffect(() => {
    setRequesting(true);

    api
      .get(`/products/offers/${uuidProduct}`)
      .then((response) => {
        const {
          data: { rows, count },
        } = response;
        if (rows[0].plans.length > 0) {
          const plans = [];
          for (const row of rows) {
            for (const plan of row.plans) {
              plans.push(plan);
            }
          }
          setAllOffers(
            plans.map((p) => ({
              ...p,
              name: p.label,
            }))
          );
          setCountOffers(plans.length);
        } else {
          setAllOffers(rows);
          setCountOffers(count);
        }

        if (rows[0].plans.length > 0) {
          setPrice(rows[0].plans[0].price);
        } else {
          setPrice(rows[0].price);
        }
      })
      .catch(() => { })
      .finally(() => setRequesting(false));
    /*  api
      .get(`/products/offers/${uuidProduct}`)
      .then((response) => {
        const {
          data: { rows, count },
        } = response;
        setAllOffers(rows);
        setCountOffers(count);

        if (rows[0].plans.length > 0) {
          setPrice(rows[0].plans[0].price);
        } else {
          setPrice(rows[0].price);
        }
      })
      .catch(() => {})
      .finally(() => setRequesting(false)); */

    api
      .get(`/products/affiliate/${uuidProduct}/products`)
      .then((r) => {
        setProductsToAffiliate(
          r.data.map((item) => ({
            name: item.name,
            value: item.id,
            id: item.id,
          }))
        );
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    api
      .get(`/products/affiliate/${uuidProduct}/selected`)
      .then((r) => {
        setSelectedProductsAffiliate(r.data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    fetchAffiliateSettings();
  }, []);

  const addProductStatus = (itemId) => {
    api
      .post(`/products/affiliate/${uuidProduct}/link`, {
        id_product: itemId,
      })
      .then(() => {
        const newProduct = productsToAffiliate.find(
          (element) => element.id === +itemId
        );
        setSelectedProductsAffiliate((prev) => [...prev, newProduct]);
        notify({
          message: 'Produto adicionado na afiliação global',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao adicionar produto na afiliação global',
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  };

  const removeProductStatus = (item) => {
    api
      .delete(`/products/affiliate/${uuidProduct}/link/${item.id}`)
      .then(() => {
        setSelectedProductsAffiliate((prev) => {
          return prev.filter((product) => product.id !== item.id);
        });
        notify({
          message: 'Produto removido da afiliação global',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: 'Falha ao remover produto da afiliação global',
          type: 'error',
        });
      })
      .finally(() => setLoading(false));
  };

  const selectActiveOffer = (index) => {
    setPrice(allOffers[index].price);
  };

  const onSubmit = (data) => {
    const parsedCommission = parseFloat(String(commission).replace('%', ''));

    if (isNaN(parsedCommission)) {
      notify({
        message: 'Informe um número válido de comissão',
        type: 'error',
      });
      return;
    }
    const changed =
      initialCommission !== null &&
      parsedCommission !== initialCommission &&
      allowAffiliate;
    if (changed) {
      setPendingCommission(parsedCommission);
      setPendingFields(data); // guarda o form pra salvar se escopo for "future"
      setShowScopeModal(true);
      return;
    }

    data.commission = commission;
    applyGeneralSettings(data);
  };

  const applyGeneralSettings = async (fields) => {
    let payload = { ...fields };
    payload.commission = parseFloat(
      String(fields.commission).replace('%', '')
    );
    payload.cookies_validity = parseInt(fields.cookies_validity);
    payload.allow_affiliate = allowAffiliate;
    payload.subscription_fee = allowSubscriptionFee;
    payload.subscription_fee_commission = parseFloat(
      fields.subscription_fee_commission
    );
    payload.subscription_fee_only = parseInt(fields.subscription_fee_only);
    setRequesting(true);

    return api
      .put(`/products/affiliate/${uuidProduct}`, payload)
      .then(() => {
        notify({
          message: 'Salvo com sucesso',
          type: 'success',
        });
        const finalCommission = pendingCommission ?? payload.commission;
        setValue?.('commission', String(finalCommission), {
          shouldValidate: false,
          shouldDirty: false,
        });
        setCommission(finalCommission);
        setInitialCommission(finalCommission);

        // limpa pendências do fluxo com modal
        setPendingCommission(null);
        setPendingFields(null);
      })
      .catch(() => {
        notify({
          message: 'Erro ao salvar',
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  const handleAllowAffiliate = () => {
    setAllowAffiliate(!allowAffiliate);
  };

  useEffect(() => {
    calculate();
  }, [commission, price]);

  const calculate = () => {
    const sixbaseFee = price * sixbaseFeePercent + sixbaseFeeFixed;
    let affiliate_commission = price * (commission / 100);
    let producer = price - affiliate_commission - sixbaseFee;
    if (affiliate_commission > price - sixbaseFee) {
      producer = 0.01;
      let newPrice = price - sixbaseFee;
      affiliate_commission = newPrice * (commission / 100);
      producer = newPrice - affiliate_commission;
      if (producer === 0) {
        producer = 0.01;
        affiliate_commission = affiliate_commission - 0.01;
      }
    }
    let simulate = {
      withoutAffiliate: {
        price: price,
        sixbaseFee: sixbaseFee,
        producer: price - sixbaseFee,
      },
      withAffiliate: {
        price: price,
        sixbaseFee: sixbaseFee,
        affiliate: affiliate_commission,
        producer,
      },
    };

    setEarnings(simulate);
  };

  const handleEmailsChange = (e) => {
    setEmails(e.target.value);
  };

  const copyToClipboard = (element, param, text = 'Copiado com sucesso') => {
    element.select();
    navigator.clipboard.writeText(param);
    notify({
      message: text,
      type: 'success',
    });
    setTimeout(() => { }, 3000);
  };

  const handleImportAffiliates = async (e) => {
    e.preventDefault();
    if (!emails && !fileRef.current) return;
    let affiliatesEmails = [];
    if (emails) {
      for (const email of emails.split(';')) {
        if (email.length > 0) {
          affiliatesEmails.push(email);
        }
      }
    }

    if (fileRef.current.files.length > 0) {
      const data = await new Promise((resolve, reject) => {
        papa.parse(fileRef.current.files[0], {
          header: false,
          newline: '',
          quoteChar: '"',

          complete: (data) => {
            resolve(data.data);
          },
          error: (error) => reject(error),
        });
      });

      for (const emails of data) {
        for (const email of emails) {
          if (email.length > 0) {
            affiliatesEmails.push(email);
          }
        }
      }
    }

    setRequestingImport(true);

    api
      .post(`/products/affiliate/${uuidProduct}/invite`, {
        emails: affiliatesEmails.filter(
          (email, index) => affiliatesEmails.indexOf(email) === index
        ),
      })
      .then(() => {
        notify({
          message: 'Convites enviados com sucesso',
          type: 'success',
        });
        setEmails('');
        if (fileRef.current) {
          fileRef.current.value = '';
        }
      })
      .catch(() => {
        notify({
          message: 'Erro ao importar afiliados',
          type: 'error',
        });
      })
      .finally(() => setRequestingImport(false));
  };

  const applyBulkCommission = async (newCommission, scope) => {
    setBulkApplying(true);
    try {
      const payload = {
        commission: newCommission,
        scope, // 'future' (só futuros) | 'all' (atuais + futuros) | backend deve respeitar
        audit: {
          reason: 'bulk-commission-update',
          product_id: uuidProduct,
          previous_commission: initialCommission,
          new_commission: newCommission,
        },
      };

      await api.post(
        `/products/affiliate/${uuidProduct}/commission/bulk`,
        payload
      );

      setInitialCommission(newCommission);
      notify({ message: 'Comissão aplicada com sucesso.', type: 'success' });
      setValue?.('commission', String(newCommission), {
        shouldValidate: false,
        shouldDirty: false,
      });
      setCommission(newCommission);
    } catch (e) {
      notify({ message: 'Falha ao aplicar comissão em massa.', type: 'error' });
    } finally {
      setBulkApplying(false);
    }
  };

  return (
    <div>
      <ModalGeneric
        show={showImport}
        setShow={setShowImport}
        title={`Importar Afiliados`}
        centered
      >
        <Row>
          <Col md={12} className='mb-4'>
            <div>
              <b>Instruções:</b> separe os afiliados por ponto e vírgula (;)
            </div>
            <div className='d-block mt-2'>
              <b>Exemplo:</b> fernando@gmail.com; vinicius@gmail.com
            </div>
          </Col>
          <Col md={12} className='form-group'>
            <label>Importação em massa</label>
            <Form.Control
              as='textarea'
              id='emails'
              onChange={handleEmailsChange}
              name='emails'
              placeholder='Insira os e-mails separados por ;'
              rows={6}
              value={emails}
            />
          </Col>
          <Col md={12} className='form-group d-flex justify-content-center'>
            <div>
              <b>OU</b>
            </div>
          </Col>
          <Col md={12} className='form-group'>
            <label>Arquivo CSV</label>
            <input
              type='file'
              id='csv'
              name='csv'
              multiple={false}
              className='form-control'
              accept='.csv'
              ref={fileRef}
            />
          </Col>
          <Col md={12} className='d-flex justify-content-end mt-4'>
            <ButtonDS
              disabled={requestingImport}
              variant='primary'
              onClick={handleImportAffiliates}
            >
              <span>{requestingImport ? 'Importando...' : 'Importar'}</span>
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>

      <ModalGeneric
        show={showScopeModal}
        setShow={setShowScopeModal}
        title='Aplicar comissão em massa'
        centered
      >
        <Row>
          <Col md={12} className='mb-3'>
            <b>
              Alterar para todos os afiliados atuais e futuros ou somente para
              afiliados futuros?
            </b>
          </Col>
          <Col md={12}>
            <Form.Check
              type='radio'
              id='scope-future'
              name='apply-scope'
              checked={applyScope === 'future'}
              onChange={() => setApplyScope('future')}
              label='Somente para afiliados futuros'
            />
            <Form.Check
              type='radio'
              id='scope-all'
              name='apply-scope'
              checked={applyScope === 'all'}
              onChange={() => setApplyScope('all')}
              label='Para afiliados atuais e futuros'
              className='mt-2'
            />
          </Col>
          <Col md={12} className='d-flex justify-content-end mt-4'>
            <ButtonDS
              variant='secondary'
              onClick={() => setShowScopeModal(false)}
              outline
            >
              Cancelar
            </ButtonDS>
            <ButtonDS
              className='ml-2'
              variant='primary'
              onClick={() => {
                setShowScopeModal(false);
                setShowConfirmModal(true);
              }}
            >
              Continuar
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>

      <ModalGeneric
        show={showConfirmModal}
        setShow={setShowConfirmModal}
        title='Confirmar alteração'
        centered
      >
        <Row>
          <Col md={12} className='mb-3'>
            <div>Qual será a nova comissão aplicada?</div>
            <div className='mt-2'>
              <b>{pendingCommission}%</b>
            </div>
            <div className='mt-2 small'>
              Escopo:{' '}
              <b>
                {applyScope === 'all'
                  ? 'Afiliados atuais e futuros'
                  : 'Somente futuros'}
              </b>
            </div>
          </Col>
          <Col md={12} className='d-flex justify-content-end'>
            <ButtonDS
              variant='secondary'
              onClick={() => setShowConfirmModal(false)}
              outline
            >
              Voltar
            </ButtonDS>
            <ButtonDS
              className='ml-2'
              variant='primary'
              disabled={bulkApplying}
              onClick={async () => {
                setShowConfirmModal(false);
                const newCommission = pendingCommission;
                if (applyScope === 'future') {
                  // SALVAR DO JEITO ANTIGO (apenas define a nova comissão padrão para futuras afiliações)
                  if (pendingFields) {
                    setValue?.('commission', String(newCommission), {
                      shouldValidate: false,
                      shouldDirty: true,
                    });
                    await applyGeneralSettings(pendingFields);
                    setInitialCommission(newCommission);
                  }
                } else {
                  // APLICAÇÃO EM MASSA (atuais + futuros)
                  if (pendingFields) {
                    const fields = {
                      ...pendingFields,
                      commission: newCommission,
                    };
                    await applyGeneralSettings(fields);
                  }
                  await applyBulkCommission(newCommission, 'all');
                  setValue?.('commission', String(newCommission), {
                    shouldValidate: false,
                    shouldDirty: true,
                  });
                  setCommission(newCommission);
                  setInitialCommission(newCommission);
                }
              }}
            >
              {bulkApplying ? 'Aplicando...' : 'Confirmar'}
            </ButtonDS>
          </Col>
        </Row>
      </ModalGeneric>

      {!requesting && countOffers === 0 && (
        <Row>
          <Col className='mb-4'>
            <AlertDS
              warn={'Alerta:'}
              variant={'warning'}
              text={`
                  Você não tem nenhuma oferta ativa para este produto. Seus
                afiliados só poderão vender quando houverem ofertas ativas.
                `}
            />
          </Col>
        </Row>
      )}
      <Row>
        <Col md={12} className='mb-3'>
          <h4>Afiliados</h4>
          <small>
            Permita que outros usuários também vendam o seu produto em troca de
            uma comissão sobre a venda.
          </small>
        </Col>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Row>
                <Col md='6'>
                  <div className='d-flex align-items-center'>
                    <Switch
                      onChange={handleAllowAffiliate}
                      checked={allowAffiliate}
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
                    <span className='ml-4'>Permitir Afiliados</span>
                  </div>
                </Col>

                <Col className='d-flex justify-content-end' md='6'>
                  {allowAffiliate && (
                    <ButtonDS
                      size='xs'
                      variant='primary'
                      onClick={() => setShowImport(true)}
                      outline
                      style={{ marginLeft: '16px' }}
                    >
                      Importar Afiliados
                    </ButtonDS>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={7} className='mb-3'>
          <Card>
            <Card.Body>
              <h4>Link de Afiliação</h4>
              <small>
                Este é o link de divulgação do seu produto. Copie e cole para
                permitir que os usuários se afiliem a ele.
              </small>
              <div className='d-flex mt-2'>
                <input
                  type='text'
                  value={`${window.location.origin}/vitrine/produto/${product.slug}/${uuidProduct}`}
                  readOnly
                  className='form-control pointer'
                  onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(
                      e.currentTarget,
                      e.currentTarget.value,
                      'Copiado com sucesso'
                    );
                  }}
                  style={{
                    borderRadius: '8px 0px 0px 8px',
                    height: '35px',
                  }}
                />
                <Button
                  variant={'primary'}
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.parentElement.firstChild;
                    copyToClipboard(input, input.value, 'Copiado com sucesso');
                  }}
                  className='d-flex align-items-center'
                  style={{
                    borderRadius: '0px 8px 8px 0px',
                    height: '35px',
                  }}
                >
                  <i className='bx bx-copy-alt' style={{ fontSize: 21 }}></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className='mb-3'>
          <h4>Afiliação global</h4>
          <small>
            Ao habilitar esta opção, seus afiliados se afiliarão automaticamente
            aos produtos que você selecionar abaixo
          </small>
        </Col>
        <Col md={7}>
          <Card>
            <Card.Body>
              <Row>
                <Col md='12'>
                  <div className='d-flex'>
                    <Form.Group>
                      <label>Produtos</label>
                      <div className='d-flex align-items-center'>
                        <Form.Control
                          as='select'
                          onChange={(e) => setOption(e.target.value)}
                        >
                          <option value={null} selected>
                            Selecione um produto...
                          </option>
                          {productsToAffiliate
                            .filter((product) => {
                              return (
                                !selectedProductsAffiliate ||
                                !selectedProductsAffiliate.some(
                                  (selectedProduct) =>
                                    selectedProduct &&
                                    selectedProduct.id === product.id
                                )
                              );
                            })
                            .map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                        </Form.Control>
                        <ButtonDS
                          variant='success'
                          size='icon'
                          onClick={() => addProductStatus(option)}
                          className={'ml-2'}
                          style={{
                            minWidth: 30,
                            height: 30,
                          }}
                        >
                          +
                        </ButtonDS>
                      </div>
                    </Form.Group>
                  </div>
                  <table className='table mt-2'>
                    <thead>
                      <tr>
                        <th>Produtos adicionados</th>
                        <th className='text-center'>Remover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProductsAffiliate &&
                        selectedProductsAffiliate.map((item) => {
                          if (!item) {
                            return null;
                          }
                          return (
                            <tr key={item.id}>
                              <td>{item.name}</td>
                              <td className='d-flex justify-content-center'>
                                <ButtonDS
                                  variant='danger'
                                  onClick={() => removeProductStatus(item)}
                                  size='icon'
                                >
                                  -
                                </ButtonDS>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {allowAffiliate && (
        <>
          {product.payment_type === 'subscription' && (
            <Row>
              <Col md={12} className='mb-3'>
                <h4>Adesão</h4>
                <small>Define se o produto de assinatura possui adesão.</small>
              </Col>
              <Col md={12}>
                <Card>
                  <Card.Body>
                    <Row>
                      <Col md={12}>
                        <div className='d-flex align-items-center'>
                          <Switch
                            onChange={() =>
                              setAllowSubscriptionFee(!allowSubscriptionFee)
                            }
                            checked={allowSubscriptionFee}
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
                          <span className='ml-4'>Possui adesão</span>
                        </div>
                      </Col>
                    </Row>
                    {!!allowSubscriptionFee && (
                      <Row className='mt-3'>
                        <Col>
                          <Form.Group>
                            <label>Comissão da adesão</label>
                            <Controller
                              as={CurrencyInput}
                              control={control}
                              type='text'
                              name='subscription_fee_commission'
                              suffix='%'
                              selectAllOnFocus
                              className={
                                errors.subscription_fee_commission
                                  ? 'form-control is-invalid'
                                  : 'form-control'
                              }
                              rules={{
                                validate: (value) => {
                                  const newValue = parseFloat(
                                    String(value).replace('%', '')
                                  );
                                  if (newValue < 1) {
                                    return 'A comissão deve ser maior ou igual a 1%';
                                  }
                                  if (newValue > 80) {
                                    return 'A comissão deve ser menor ou igual a 80%';
                                  }
                                  if (isNaN(newValue)) {
                                    return 'Isto não é um número';
                                  }
                                },
                              }}
                              precision='2'
                              maxLength={6}
                            />
                            <div className='form-error'>
                              {errors.subscription_fee_commission && (
                                <span>
                                  {errors.subscription_fee_commission.message}
                                </span>
                              )}
                            </div>
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group>
                            <label>Regra de comissão</label>
                            <Form.Control
                              ref={register}
                              as='select'
                              name='subscription_fee_only'
                              defaultValue={'1'}
                            >
                              <option value='1'>Recebe apenas da adesão</option>
                              <option value='0'>Adesão + Recorrência</option>
                            </Form.Control>
                          </Form.Group>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={12} className='mb-3'>
              <h4>Comissão</h4>
              <small>Defina porcentagem e regras de comissionamento.</small>
            </Col>
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Row>
                    <Col xs={6}>
                      <label>Comissão</label>
                      <Controller
                        as={CurrencyInput}
                        control={control}
                        type='text'
                        name='commission'
                        suffix='%'
                        selectAllOnFocus
                        className={
                          errors.comission
                            ? 'form-control is-invalid'
                            : 'form-control'
                        }
                        rules={{
                          validate: (value) => {
                            const newValue = parseFloat(
                              String(value).replace('%', '')
                            );
                            setCommission(newValue);
                            if (newValue < 1) {
                              return 'A comissão deve ser maior ou igual a 1%';
                            }
                            if (newValue > 98) {
                              return 'A comissão deve ser menor ou igual a 98%';
                            }
                            if (isNaN(newValue)) {
                              return 'Isto não é um número';
                            }
                          },
                        }}
                        precision='2'
                        maxLength={6}
                      />
                      <div className='form-error'>
                        {errors.commission && (
                          <span>{errors.commission.message}</span>
                        )}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <label>Validade do Cookie</label>
                      <Form.Control
                        ref={register}
                        as='select'
                        name='cookies_validity'
                      >
                        <option value='30'>30 dias</option>
                        <option value='60'>60 dias</option>
                        <option value='90'>90 dias</option>
                        <option value='180'>180 dias</option>
                        <option value='0'>Eterno</option>
                      </Form.Control>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <b className='mb-2 mt-4 d-block'>
                        Regra de comissionamento
                      </b>
                      <div className='small'>
                        <div className='d-flex align-items-center mb-0'>
                          <Form.Check
                            ref={register}
                            type='radio'
                            name='click_attribution'
                            id='first_click'
                            value='first-click'
                          ></Form.Check>
                          <label className='mb-0 '>
                            <span className='bold'>Primeiro Clique</span>
                            <span>
                              a comissão vai para o primeiro Afiliado que
                              recebeu o clique do comprador{' '}
                            </span>
                          </label>
                        </div>
                        <div className='d-flex align-items-center'>
                          <Form.Check
                            ref={register}
                            type='radio'
                            name='click_attribution'
                            id='last_click'
                            value='last-click'
                          ></Form.Check>
                          <label className='mb-0 '>
                            <span className='bold'>Último Clique</span>
                            <span>
                              a comissão vai para o último Afiliado que recebeu
                              o clique do comprador
                            </span>
                          </label>
                        </div>
                      </div>
                    </Col>
                    {commission !== null && countOffers !== 0 && (
                      <Col md={12} className='mt-4'>
                        <Row>
                          <Col md={3}>
                            <Form.Control
                              as='select'
                              name='all-offers'
                              onChange={(e) => {
                                selectActiveOffer(e.target.value);
                              }}
                            >
                              {allOffers.map((item, index) => (
                                <option key={index} value={index}>
                                  {item.name}
                                </option>
                              ))}
                            </Form.Control>
                          </Col>
                        </Row>
                        <Row>
                          <Tab.Container
                            id='left-tabs-example'
                            defaultActiveKey='sale'
                          >
                            <Col md={6} className='mt-2'>
                              <Tab.Content className='table mt-2'>
                                <Tab.Pane eventKey='sale'>
                                  <Col>
                                    <b>Sem afiliado</b>
                                  </Col>
                                  <table className='table mt-2'>
                                    <tbody>
                                      <tr>
                                        <td>Preço:</td>
                                        <td>
                                          {currency(
                                            earnings.withoutAffiliate.price
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Tarifa B4you:</td>
                                        <td>
                                          {currency(
                                            earnings.withoutAffiliate.sixbaseFee
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Produtor:</td>
                                        <td>
                                          {currency(
                                            earnings.withoutAffiliate.producer
                                          )}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </Tab.Pane>
                              </Tab.Content>
                            </Col>
                            <Col md={6} className='mt-2'>
                              <Tab.Content>
                                <Tab.Pane
                                  eventKey='sale'
                                  className='table mt-2'
                                >
                                  <Col>
                                    <b>Com afiliado</b>
                                  </Col>
                                  <table className='table mt-2'>
                                    <tbody>
                                      <tr>
                                        <td>Preço:</td>
                                        <td>
                                          {currency(
                                            earnings.withAffiliate.price
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Tarifa B4you:</td>
                                        <td>
                                          {currency(
                                            earnings.withAffiliate.sixbaseFee
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Afiliado:</td>
                                        <td>
                                          {currency(
                                            earnings.withAffiliate.affiliate
                                          )}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>Produtor:</td>
                                        <td>
                                          {currency(
                                            earnings.withAffiliate.producer
                                          )}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </Tab.Pane>
                              </Tab.Content>
                            </Col>
                          </Tab.Container>
                        </Row>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12} className='mb-3'>
              <h4>Suporte e Divulgação</h4>
              <small>
                Defina contato de suporte e também o Material de Apoio de seu
                produto.
              </small>
            </Col>
            <Col md={12}>
              <Card>
                <Card.Body>
                  <Row>
                    <Col>
                      <Form.Group>
                        <label>E-mail Suporte *</label>
                        <Form.Control
                          ref={register({
                            required: 'Campo obrigatório.',
                            validate: (value) => {
                              if (regexEmail(value)) {
                                return true;
                              } else {
                                return false;
                              }
                            },
                          })}
                          name='support_email'
                          type='email'
                          isInvalid={errors.support_email}
                        />
                        <div className='form-error'>
                          {errors.support_email && (
                            <span>{errors.support_email.message}</span>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <label>Material de Apoio</label>
                        <Form.Control
                          ref={register()}
                          name='url_promotion_material'
                          type='url'
                          placeholder='https://...'
                          isInvalid={errors.url_promotion_material}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group>
                        <label>Descrição Produto</label>
                        <Form.Control
                          as='textarea'
                          ref={register({
                            maxLength: 1000,
                          })}
                          name='description'
                          isInvalid={errors.description}
                          rows='10'
                        />
                        <div className='form-error mt-2'>
                          {errors.description && (
                            <span>Limite máximo de 1000 caracteres.</span>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <label>Regras De Afiliação</label>
                        <Form.Control
                          as='textarea'
                          ref={register({
                            maxLength: 1000,
                          })}
                          name='general_rules'
                          isInvalid={errors.general_rules}
                          rows='10'
                        />
                        <div className='form-error mt-2'>
                          {errors.general_rules && (
                            <span>Limite máximo de 1000 caracteres.</span>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      <Row>
        <Col className=' d-flex justify-content-end'>
          <ButtonDS onClick={handleSubmit(onSubmit)}>Salvar</ButtonDS>
        </Col>
      </Row>
    </div>
  );
};

export default AffiliateContent;

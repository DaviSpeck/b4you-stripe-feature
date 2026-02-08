import memoizeOne from 'memoize-one';
import React, { useEffect, useRef, useState } from 'react';
import {
  Col,
  Form,
  OverlayTrigger,
  Row,
  Spinner,
  Tab,
  Tabs,
  Tooltip,
} from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import MediaType from '../../../jsx/components/MediaType';
import Method from '../../../jsx/components/Method';
import RenderNameDataTable from '../../../jsx/components/RenderNameDataTable';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import api from '../../../providers/api';
import formatDate from '../../../utils/formatters';
import Loader from '../../../utils/loader';
import NoDataComponentContent from '../../NoDataComponentContent';
import { currency, notify } from '../../functions';

const columns = memoizeOne(() => [
  {
    name: <RenderNameDataTable name='Data' iconClassName='bx bx-cube' />,
    cell: (item) => (
      <div className='d-flex align-items-center flex-wrap'>
        <div className='w-100'>
          <small className='d-block'>{item.created_at}</small>
        </div>
      </div>
    ),
    width: '170px',
  },
  {
    name: <RenderNameDataTable name='Valor' iconClassName='bx bx-money' />,
    cell: (item) => currency(item.price_product),
  },
  {
    name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
    cell: (item) => (
      <BadgeDS
        variant={item.status.color}
        disc
        title={item.status.name}
        className={'pointer'}
      >
        Negado
      </BadgeDS>
    ),
    width: '150px',
  },
]);

const Sale = ({ activeSale, setShow }) => {
  const { register, handleSubmit, control, formState, errors } = useForm({
    mode: 'onChange',
  });
  const { isValid } = formState;
  const [requesting, setRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState('sale');
  const [loading, setLoading] = useState(true);
  const [saleItem, setSaleItem] = useState(null);
  const [nav, setNav] = useState('sale');
  const [reason, setReason] = useState('');
  const [listAffiliates, setListAffiliates] = useState([]);
  const [requestAffiliates, setRequestAffiliates] = useState(true);
  const [banksList, setBanksList] = useState([]);
  const [groupedSales, setGroupedSales] = useState({ count: 0, rows: [] });
  const [pageGroup, setPageGroup] = useState(0);
  const [enterGroup, setEnterGroup] = useState(false);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const [accountType, setAccountType] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [modalCancelTrackingShow, setModalCancelTrackingShow] = useState(false);
  const [fieldsEdit, setFieldsEdit] = useState(false);
  const [fields, setFields] = useState({
    full_name: '',
    email: '',
    document_number: '',
    whatsapp: '',
    zipcode: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
  });
  const [fieldsTrackingEdit, setFieldsTrackingEdit] = useState(false);
  const [fieldsTracking, setFieldsTracking] = useState({
    code: '',
    url: '',
  });

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    notify({ message: 'Detalhes da venda copiado!', type: 'success' });
  };

  const handleCopySaleData = () => {
    let data = '';

    if (saleItem?.offer?.metadata?.line_items?.length) {
      data += `Produtos da Venda:\n\n`;

      saleItem.offer.metadata.line_items.forEach((item, index) => {
        data += `Produto ${index + 1}:\n`;
        data += `Oferta: ${item.title}\n`;
        data += `Preço Un.: ${currency(item.price)}\n`;
        data += `Quantidade: x${item.quantity}\n`;
        data += `ID Shopify: ${item.variant_id}\n`;
        data += `Preço Total: ${currency(item.price * item.quantity)}\n\n`;
      });
    } else {
      data += `Produto: ${saleItem?.sale_item?.product?.name}\n`;
      data += `Oferta: ${saleItem?.offer?.name}\n`;
      data += `Quantidade: ${saleItem?.sale_item?.quantity}\n`;
    }
    data += `Status: ${saleItem?.sale_item?.status?.name}\n`;
    data += `Tipo: ${
      saleItem?.sale_item?.product?.type == 'physical'
        ? 'Físico'
        : saleItem?.sale_item?.product?.type == 'ebook'
        ? 'E-book'
        : saleItem?.sale_item?.product?.type == 'video'
        ? 'Curso em Vídeo'
        : ''
    }\n`;
    data += `Comissão como: ${saleItem?.role?.label}\n`;
    data += `Método Pagamento: ${
      saleItem?.payment?.payment_method == 'billet'
        ? 'Boleto'
        : saleItem?.payment?.payment_method == 'card'
        ? 'Cartão'
        : saleItem?.payment?.payment_method == 'pix'
        ? 'Pix'
        : ''
    }\n`;
    data += `Parcelas: ${saleItem?.payment?.installments || '-'}\n`;
    data += `Data da Criação: ${formatDate(saleItem?.sale_item?.created_at)}\n`;
    data += `Data do Pagamento: ${formatDate(saleItem?.sale_item?.paid_at)}\n`;
    data += `ID da Venda: ${saleItem?.sale_item?.uuid}\n`;

    handleCopyLink(data);
  };

  const handleClientSaleData = () => {
    let data = '';

    data += `Produtos do Cliente da Venda:\n\n`;
    data += `Nome: ${
      saleItem?.student?.full_name != null ? saleItem?.student?.full_name : '-'
    }\n`;
    data += `E-mail: ${
      saleItem?.student?.email != null ? saleItem?.student?.email : '-'
    }\n`;
    data += `CPF: ${
      saleItem?.student?.document_number != null
        ? saleItem?.student?.document_number
        : '-'
    }\n`;
    data += `Celular: ${
      saleItem?.student?.whatsapp != null ? saleItem?.student?.whatsapp : '-'
    } \n\n`;
    data += `Endereço:\n\n`;

    data += `CEP: ${
      saleItem?.address?.zipcode != null ? saleItem?.address?.zipcode : '-'
    }\n`;
    data += `Número: ${
      saleItem?.address?.number != null ? saleItem?.address?.number : '-'
    }\n`;
    data += `Complemento: ${
      saleItem?.address?.complement != null
        ? saleItem?.address?.complement
        : '-'
    }\n`;
    data += `Rua: ${
      saleItem?.address?.street != null ? saleItem?.address?.street : '-'
    }\n`;
    data += `Bairro: ${
      saleItem?.address?.neighborhood != null
        ? saleItem?.address?.neighborhood
        : '-'
    }\n`;
    data += `Cidade: ${
      saleItem?.address?.city != null ? saleItem?.address?.city : '-'
    }\n`;
    data += `Estado: ${
      saleItem?.address?.state != null ? saleItem?.address?.state : '-'
    }\n`;
    handleCopyLink(data);
  };

  const handleCopyData = (tab) => {
    if (tab === 'sale') {
      handleCopySaleData();
    }
    if (tab === 'customer') {
      handleClientSaleData();
    }
  };

  const submitChangeFields = () => {
    for (const item in fields) {
      if (saleItem.student[item] !== fields[item] && fields[item] === '') {
        fields[item] = saleItem.student[item];
      }
    }

    api
      .put(`sales/${activeSale.uuid}`, fields)
      .then(() => {
        fetchData();
        setFieldsEdit(false);
        notify({ message: 'Campos alterados com sucesso', type: 'success' });
      })
      .catch((err) => {
        if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.body &&
          err.response.data.body.errors
        ) {
          const errors = err.response.data.body.errors
            .map((item) => item)
            .flat();
          let key = {};
          for (const error of errors) {
            key = {
              ...key,
              ...error,
            };
          }
          Object.keys(key).map((item) =>
            notify({ message: key[item], type: 'error' })
          );
        } else {
          notify({ message: 'Falha ao alterar campos', type: 'error' });
        }
      })
      .finally(() => setModalCancelShow(false));
  };
  const submitChangeFieldsTracking = () => {
    api
      .put(`sales/${activeSale.uuid}/tracking`, {
        tracking_code: fieldsTracking.code,
        tracking_url: fieldsTracking.url,
      })
      .then(() => {
        setSaleItem((prev) => ({
          ...prev,
          tracking: {
            code: fieldsTracking.code,
            url: fieldsTracking.url,
          },
          sale_item: {
            ...prev.sale_item,
            tracking: {
              code: fieldsTracking.code,
              url: fieldsTracking.url,
            },
          },
        }));
        setFieldsTrackingEdit(false);
        notify({ message: 'Campos alterados com sucesso', type: 'success' });
      })
      .catch((err) => {
        if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.body &&
          err.response.data.body.errors
        ) {
          const errors = err.response.data.body.errors
            .map((item) => item)
            .flat();
          let key = {};
          for (const error of errors) {
            key = {
              ...key,
              ...error,
            };
          }
          Object.keys(key).map((item) =>
            notify({ message: key[item], type: 'error' })
          );
        } else {
          notify({ message: 'Falha ao alterar campos', type: 'error' });
        }
      })
      .finally(() => setModalCancelTrackingShow(false));
  };

  const onChangeFields = (e) => {
    e.preventDefault();
    setFields({
      ...fields,
      [e.target.name]: e.target.value,
    });
  };

  const onChangeFieldsTracking = (e) => {
    e.preventDefault();
    setFieldsTracking({
      ...fieldsTracking,
      [e.target.name]: e.target.value,
    });
  };

  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [loadingGrouped, setLoadingGrouped] = useState(false);

  const getGroupedSales = () => {
    setLoadingGrouped(true);
    api
      .get(`/sales/grouped/${saleItem.sale_item.id}?page=${pageGroup}`)
      .then((r) => setGroupedSales(r.data))
      // eslint-disable-next-line
      .catch((e) => console.log(e))
      .finally(() => setLoadingGrouped(false));
  };

  useEffect(() => {
    fetchData();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (nav === 'give_commision') {
      api
        .get(`/products/affiliate/${saleItem.sale_item.product.uuid}/all`)
        .then((r) => {
          setListAffiliates(r.data);
        })
        .catch(() => {})
        .finally(() => setRequestAffiliates(false));
    }
  }, [nav]);

  useEffect(() => {
    if (enterGroup) {
      getGroupedSales();
    }
  }, [enterGroup, pageGroup]);

  const fetchData = () => {
    api
      .get(`sales/${activeSale.uuid}`)
      .then((response) => {
        setSaleItem(response.data);
        setFieldsTracking({
          code: response.data.sale_item.tracking.code,
          url: response.data.sale_item.tracking.url,
        });
        Object.keys(response.data.student).forEach(function (key) {
          setFields({
            ...fields,
            [key]: response.data.student[key],
          });
        });
        Object.keys(response.data.address).forEach(function (key) {
          setFields({
            ...fields,
            [key]: response.data.address[key],
          });
        });
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchBanks = () => {
    api
      .get('/banks')
      .then(({ data }) =>
        setBanksList(data.map((d) => ({ ...d, label: d.label.toUpperCase() })))
      );
  };

  const commisionAffiliate = () => {
    setRequesting(true);
    api
      .post('/sales/split', {
        affiliate_uuid: selectedAffiliate.uuid,
        sale_item_uuid: saleItem.sale_item.uuid,
      })
      .then(() => {
        notify({
          message: 'Comissão transferida com sucesso.',
          type: 'success',
        });
      })
      .catch(() => {
        notify({
          message: `Erro ao transferir comissão`,
          type: 'error',
        });
      })
      .finally(() => setRequesting(false));
  };

  const onSubmit = (data) => {
    setRequesting(true);
    let bank_account = null;

    if (
      !saleItem.student_has_bank_account &&
      saleItem.payment.payment_method === 'billet'
    ) {
      bank_account = {
        bank_code: data.bank_code,
        account_number: data.account_number,
        account_agency: data.account_agency,
        account_type: accountType.value,
      };
    }
    api
      .post(`/sales/${activeSale.uuid}/refund`, {
        bank_account,
        reason,
      })
      .then(() => {
        notify({
          message: 'Reembolso solicitado com sucesso.',
          type: 'success',
        });
      })
      .catch((err) => {
        notify({
          message: `Erro ao processar reembolso: ${
            err.response.data.message ? err.response.data.message : 'Erro'
          }`,
          type: 'error',
        });
      })
      .finally(() => {
        setRequesting(true);
        setShow(false, true);
      });
  };

  const copyToClipboard = (param, text, reference) => {
    reference.current.select();
    navigator.clipboard.writeText(param);

    notify({
      message: text,
      type: 'success',
    });
    setTimeout(() => {}, 3000);
  };

  const colourStyles = {
    option: (styles, { isFocused }) => {
      return {
        ...styles,
        backgroundColor: isFocused ? '#dddddd' : null,
        borderBottom: '1px solid #ddd',
        color: '#333333',
        padding: '5px 0',
      };
    },
  };

  const formatOptionLabel = (item) => (
    <div className='affiliate-label'>
      <div>{item.user}</div>
      <div>{item.email}</div>
    </div>
  );

  const filterOptions = (candidate, input) => {
    if (input) {
      return (
        candidate.data.user.includes(input) ||
        candidate.data.email.includes(input)
      );
    }
    return true;
  };

  const handleRefundReceipt = async () => {
    try {
      setRequesting(true);
      const response = await api.get(
        `/sales/${activeSale.uuid}/refund-receipt`,
        {
          responseType: 'blob',
        }
      );
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(file);
      window.open(fileURL);
      notify({
        message: 'Comprovante de reembolso gerado com sucesso',
        type: 'success',
      });
    } catch (error) {
      notify({
        message: 'Erro ao gerar comprovante de reembolso',
        type: 'error',
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div id='sales-details' defaultActiveKey='sale'>
      {loading ? (
        <Loader title='Carregando venda...' />
      ) : (
        <>
          {nav === 'sale' && (
            <>
              <Row>
                <Col sm={12}>
                  <Tabs
                    defaultActiveKey='sale'
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className='mb-4 tabs-offer-new'
                    variant='pills'
                  >
                    <Tab
                      eventKey='sale'
                      title={
                        <span>
                          <i className='bx bx-file mr-1'></i> Venda
                        </span>
                      }
                    >
                      <p className='primary'>Geral</p>
                      <table className='table'>
                        <tbody>
                          {saleItem?.offer?.metadata?.line_items ? (
                            <>
                              {saleItem?.offer?.metadata?.line_items.map(
                                (item) => (
                                  <tr key={item.variant_id}>
                                    <td>Produtos</td>
                                    <td>
                                      <p>
                                        <b>Oferta: </b> {item.title}
                                      </p>
                                      <p>
                                        <b>Preço Un.: </b>{' '}
                                        {currency(item.price)}
                                      </p>
                                      <p>
                                        <b>Quantidade: </b> x{item.quantity}
                                      </p>
                                      <p>
                                        <b>ID Shopify: </b> {item.variant_id}
                                      </p>
                                      <p>
                                        <b>Preço Total: </b>{' '}
                                        {currency(item.price * item.quantity)}
                                      </p>
                                    </td>
                                  </tr>
                                )
                              )}
                            </>
                          ) : (
                            <>
                              {' '}
                              {saleItem.offer && (
                                <>
                                  <tr>
                                    <td>Produto</td>
                                    <td>{saleItem?.sale_item?.product.name}</td>
                                  </tr>
                                  <tr>
                                    <td>Oferta</td>
                                    <td>{saleItem.offer.name}</td>
                                  </tr>
                                </>
                              )}
                              {saleItem.sale_item.product.type ===
                                'physical' && (
                                <tr>
                                  <td>Quantidade</td>
                                  <td>{saleItem.sale_item.quantity}</td>
                                </tr>
                              )}{' '}
                            </>
                          )}
                          <tr>
                            <td>Status</td>
                            <td>{saleItem.sale_item.status.name}</td>
                          </tr>
                          {saleItem.sale_item.status.id !== 2 &&
                            saleItem.payment.payment_method === 'pix' &&
                            saleItem.qrcode_link && (
                              <tr>
                                <td>QR Code Pix</td>
                                <td>
                                  <a
                                    href={saleItem.qrcode_link}
                                    target='_blank'
                                    rel='noreferrer'
                                  >
                                    <ButtonDS variant='link'>
                                      Abrir QR Code
                                    </ButtonDS>
                                  </a>
                                </td>
                              </tr>
                            )}
                          {saleItem.sale_item.status.id !== 2 &&
                            saleItem.payment.payment_method === 'pix' &&
                            saleItem.qrcode_link && (
                              <tr>
                                <td>Copia e Cola Pix</td>
                                <td>
                                  <textarea
                                    id='pix-code'
                                    className='form-control pix-code'
                                    defaultValue={saleItem.qrcode}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      copyToClipboard(
                                        saleItem.qrcode,
                                        'Chave copia e cola pix copiado com sucesso',
                                        ref1
                                      );
                                    }}
                                    ref={ref1}
                                    readOnly
                                    style={{ height: '35px' }}
                                  />
                                </td>
                              </tr>
                            )}
                          <tr>
                            <td>Tipo</td>
                            <td>
                              <MediaType
                                type={saleItem.sale_item.product.type}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Comissão como</td>
                            <td>{saleItem.role.label}</td>
                          </tr>

                          <tr>
                            <td>Método Pagamento</td>
                            <td>
                              <Method type={saleItem.payment.payment_method} />
                            </td>
                          </tr>

                          <tr>
                            <td>Data da Criação</td>
                            <td>{formatDate(saleItem.sale_item.created_at)}</td>
                          </tr>
                          <tr>
                            <td>Data da Pagamento</td>
                            <td>
                              {saleItem.sale_item.paid_at
                                ? formatDate(saleItem.sale_item.paid_at)
                                : `-`}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={'2'}>
                              <div>ID da Venda</div>
                              <div>{saleItem.sale_item.uuid}</div>
                            </td>
                          </tr>
                          {saleItem?.id_order_bling && (
                            <tr>
                              <td>ID BLING</td>
                              <td>
                                <div className='d-flex align-items-center'>
                                  <a
                                    href={`https://www.bling.com.br/vendas.php#edit/${saleItem.id_order_bling}`}
                                    target='_blank'
                                    rel='noreferrer'
                                    style={{
                                      color: '#0f1b35',
                                      textDecoration: 'underline',
                                    }}
                                  >
                                    {saleItem.id_order_bling}
                                  </a>
                                  <OverlayTrigger
                                    placement='top'
                                    overlay={
                                      <Tooltip
                                        id={`tooltip-bling-${saleItem.id_order_bling}`}
                                      >
                                        Clique para abrir o pedido no Bling em
                                        nova aba. Você precisa estar logado na
                                        conta do Bling no navegador.
                                      </Tooltip>
                                    }
                                  >
                                    <i
                                      className='bx bx-info-circle ml-2 pointer'
                                      style={{ color: '#6c757d' }}
                                    ></i>
                                  </OverlayTrigger>
                                </div>
                              </td>
                            </tr>
                          )}
                          {saleItem?.id_order_notazz && (
                            <tr>
                              <td>ID NOTAZZ</td>
                              <td>{saleItem.id_order_notazz}</td>
                            </tr>
                          )}
                          {saleItem.payment.payment_method === 'card' &&
                            saleItem.sale_item.status.key === 'denied' &&
                            Array.isArray(saleItem.payment.charges) &&
                            saleItem.payment.charges.length > 0 && (
                              <tr>
                                <td>Motivo da recusa</td>
                                <td>
                                  {
                                    saleItem.payment.charges[0]
                                      .provider_response_details
                                  }
                                </td>
                              </tr>
                            )}
                          {saleItem.sale_item.status.key === 'refunded' && (
                            <tr>
                              <td>Comprovante de Reembolso</td>
                              <td>
                                <ButtonDS
                                  variant='primary'
                                  size='sm'
                                  onClick={handleRefundReceipt}
                                  disabled={requesting}
                                >
                                  {requesting
                                    ? 'Gerando...'
                                    : 'Visualizar Comprovante'}
                                </ButtonDS>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </Tab>
                    <Tab
                      eventKey='payment'
                      title={
                        <span>
                          <i class='bx bx-dollar-circle mr-1'></i>
                          Pagamento
                        </span>
                      }
                    >
                      <p className='primary'>Geral</p>
                      <table className='table mt-2'>
                        <tbody>
                          <tr>
                            <td style={{ width: 230 }}>Método de pagamento</td>
                            <td>
                              <Method type={saleItem.payment.payment_method} />
                            </td>
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td>{saleItem.sale_item.status.name}</td>
                          </tr>
                          {saleItem.payment.charges &&
                            saleItem.payment.charges.map((item, index) => {
                              return (
                                <React.Fragment key={index}>
                                  {saleItem.payment.charges.length > 1 && (
                                    <tr
                                      style={{
                                        borderTop: '2px solid #eee',
                                        backgroundColor: '#f8f9fa',
                                      }}
                                    >
                                      <td colSpan='2'>
                                        <b>Pagamento {index + 1}</b>
                                      </td>
                                    </tr>
                                  )}

                                  <tr>
                                    <td>Valor</td>
                                    <td>{currency(item.price)}</td>
                                  </tr>
                                  <tr>
                                    <td>Parcelas</td>
                                    <td>{item.installments}x</td>
                                  </tr>
                                  {saleItem.sale_item.status.key === 'denied' &&
                                    item.provider_response_details && (
                                      <tr>
                                        <td>Motivo da recusa</td>
                                        <td>
                                          {item.provider_response_details}
                                        </td>
                                      </tr>
                                    )}
                                  {item.interest_installment_amount > 0 &&
                                    saleItem.payment.student_pays_interest && (
                                      <tr>
                                        <td>
                                          Juros de parcelamento (
                                          {item.installments}x)
                                        </td>
                                        <td>
                                          -
                                          {currency(
                                            item.interest_installment_amount
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                </React.Fragment>
                              );
                            })}
                          {saleItem.payment.total_discount_amount > 0 && (
                            <tr>
                              <td>
                                Desconto
                                {saleItem.payment.discount_percentage > 0 && (
                                  <small className='ml-1'>
                                    ({saleItem.payment.discount_percentage}%)
                                  </small>
                                )}
                              </td>
                              <td>
                                {currency(
                                  saleItem.payment.total_discount_amount * -1
                                )}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td>Preço base</td>
                            <td>{currency(saleItem.payment.price)}</td>
                          </tr>
                          <tr>
                            <td>
                              <div>
                                Tarifa B4you
                                <OverlayTrigger
                                  placement='top'
                                  overlay={
                                    <Tooltip id={`tooltip-top`}>
                                      <div>
                                        Tarifa Variável{' '}
                                        {currency(
                                          saleItem.payment.fee_variable_amount *
                                            -1
                                        )}{' '}
                                        (
                                        {
                                          saleItem.payment
                                            .fee_variable_percentage
                                        }
                                        %)
                                      </div>
                                      <div>
                                        Tarifa Fixa{' '}
                                        {currency(
                                          saleItem.payment.fee_fixed * -1
                                        )}
                                      </div>
                                    </Tooltip>
                                  }
                                >
                                  <i className='bx bx-info-circle ml-2 pointer'></i>
                                </OverlayTrigger>
                              </div>
                            </td>
                            <td>{currency(saleItem.payment.total_fee * -1)}</td>
                          </tr>
                          {saleItem.sale_item.product.type === 'physical' && (
                            <tr>
                              <td>Frete</td>
                              <td>
                                {currency(saleItem.payment.shipping_price)}
                              </td>
                            </tr>
                          )}

                          {saleItem.coupon && (
                            <tr>
                              <td>Nome do Cupom</td>
                              <td>{saleItem.coupon.coupon}</td>
                            </tr>
                          )}
                          {saleItem.coupon && (
                            <tr>
                              {saleItem.coupon.percentage ? (
                                <>
                                  <td>Porcentagem do Cupom</td>
                                  <td>{`${saleItem.coupon.percentage}%`}</td>
                                </>
                              ) : (
                                <>
                                  <td>Valor do Cupom</td>
                                  <td>{`${currency(
                                    saleItem.coupon.amount
                                  )}`}</td>
                                </>
                              )}
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {!!saleItem.splits.length && (
                        <div>
                          <p className='primary'>Comissão</p>
                          <table className='table mt-2'>
                            {saleItem.splits.map((element, index) => (
                              <tbody key={index}>
                                <tr>
                                  <td>{element.role}</td>
                                  <td>{element.name}</td>
                                </tr>
                                <tr>
                                  <td>Valor</td>
                                  <td>{currency(element.amount)}</td>
                                </tr>
                              </tbody>
                            ))}
                          </table>
                        </div>
                      )}
                    </Tab>
                    <Tab
                      eventKey='customer'
                      title={
                        <span>
                          <i className='bx bx-user mr-1'></i>
                          Cliente
                        </span>
                      }
                    >
                      <div className='d-flex justify-content-between'>
                        <p className='primary'>Informações Pessoais</p>
                        <div onClick={() => setFieldsEdit(!fieldsEdit)}>
                          <ButtonDS size='icon' outline={fieldsEdit}>
                            <i className='bx bxs-pencil'></i>
                          </ButtonDS>
                        </div>
                      </div>
                      <table className='table'>
                        {!fieldsEdit ? (
                          <tbody>
                            <tr>
                              <td>Nome</td>
                              <td>{saleItem.student.full_name || '-'}</td>
                            </tr>
                            <tr>
                              <td>E-mail</td>
                              <td>{saleItem.student.email || '-'}</td>
                            </tr>
                            <tr>
                              <td>
                                {saleItem.student.document_number.length === 14
                                  ? 'CPF'
                                  : 'CNPJ'}
                              </td>
                              <td>{saleItem.student.document_number || '-'}</td>
                            </tr>
                            <tr>
                              <td>Celular</td>
                              <td>
                                <a
                                  style={{
                                    color: '#0f1b35',
                                    textDecoration: 'underline',
                                  }}
                                  href={`https://wa.me/+55${saleItem.student.whatsapp}`}
                                  target='_blank'
                                  rel='noreferrer'
                                >
                                  {saleItem.student.whatsapp || '-'}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        ) : (
                          <tbody>
                            <tr>
                              <td>Nome</td>
                              <td>
                                <Form.Control
                                  defaultValue={saleItem.student?.full_name}
                                  name='full_name'
                                  onChange={(e) => onChangeFields(e)}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>E-mail</td>
                              <td>
                                <Form.Control
                                  defaultValue={saleItem.student?.email}
                                  name='email'
                                  onChange={(e) => onChangeFields(e)}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>CPF</td>
                              <td>
                                <Form.Control
                                  defaultValue={
                                    saleItem.student?.document_number
                                  }
                                  name='document_number'
                                  onChange={(e) => onChangeFields(e)}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Celular</td>
                              <td>
                                <Form.Control
                                  defaultValue={saleItem.student?.whatsapp}
                                  name='whatsapp'
                                  onChange={(e) => onChangeFields(e)}
                                />
                              </td>
                            </tr>
                          </tbody>
                        )}
                      </table>
                      {saleItem.address && (
                        <>
                          <p className='primary'>Endereço</p>

                          <table className='table'>
                            {!fieldsEdit ? (
                              <tbody>
                                <tr>
                                  <td>CEP</td>
                                  <td>{saleItem.address?.zipcode || '-'}</td>
                                </tr>
                                <tr>
                                  <td>Número</td>
                                  <td>{saleItem.address?.number || '-'}</td>
                                </tr>
                                <tr>
                                  <td>Complemento</td>
                                  <td>{saleItem.address?.complement || '-'}</td>
                                </tr>
                                <tr>
                                  <td>Rua</td>
                                  <td>{saleItem.address?.street || '-'}</td>
                                </tr>
                                <tr>
                                  <td>Bairro</td>
                                  <td>
                                    {saleItem.address?.neighborhood || '-'}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Cidade</td>
                                  <td>{saleItem.address?.city || '-'}</td>
                                </tr>
                                <tr>
                                  <td>Estado</td>
                                  <td>{saleItem.address?.state || '-'}</td>
                                </tr>
                              </tbody>
                            ) : (
                              <>
                                <tbody>
                                  <tr>
                                    <td>CEP</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={saleItem.address?.zipcode}
                                        name='zipcode'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Número</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={saleItem.address?.number}
                                        name='number'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Complemento</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={
                                          saleItem.address?.complement
                                        }
                                        name='complement'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Rua</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={saleItem.address?.street}
                                        name='street'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Bairro</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={
                                          saleItem.address?.neighborhood
                                        }
                                        name='neighborhood'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Cidade</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={saleItem.address?.city}
                                        name='city'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Estado</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={saleItem.address?.state}
                                        name='state'
                                        onChange={(e) => onChangeFields(e)}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td></td>
                                    <td className='d-flex justify-content-end'>
                                      <ButtonDS
                                        onClick={() => setModalCancelShow(true)}
                                      >
                                        Salvar
                                      </ButtonDS>
                                    </td>
                                  </tr>
                                </tbody>
                              </>
                            )}
                          </table>
                        </>
                      )}
                    </Tab>

                    {Object.keys(saleItem?.tracking).length > 0 && (
                      <Tab
                        eventKey='track'
                        title={
                          <span>
                            <i class='bx bxs-dashboard'></i>
                            Tracking
                          </span>
                        }
                      >
                        <table className='table'>
                          <tbody>
                            <tr>
                              <td>src</td>
                              <td>{saleItem.tracking.src}</td>
                            </tr>
                            <tr>
                              <td>sck</td>
                              <td>{saleItem.tracking.sck}</td>
                            </tr>
                            <tr>
                              <td>utm_source</td>
                              <td>{saleItem.tracking.utm_source}</td>
                            </tr>
                            <tr>
                              <td>utm_medium</td>
                              <td>{saleItem.tracking.utm_medium}</td>
                            </tr>
                            <tr>
                              <td>utm_campaign</td>
                              <td>{saleItem.tracking.utm_campaign}</td>
                            </tr>
                            <tr>
                              <td>utm_content</td>
                              <td>{saleItem.tracking.utm_content}</td>
                            </tr>
                            <tr>
                              <td>utm_term</td>
                              <td>{saleItem.tracking.utm_term}</td>
                            </tr>
                          </tbody>
                        </table>
                      </Tab>
                    )}
                    {saleItem.sale_item.product.type === 'physical' && (
                      <Tab
                        eventKey='shipping'
                        title={
                          <span>
                            <i class='bx bxs-truck'></i>
                            Rastreio
                          </span>
                        }
                      >
                        <div className='d-flex align-items-center justify-content-between pt-1 pb-2'>
                          <p className='primary m-0'>Alterar informações</p>
                          <div
                            onClick={() =>
                              setFieldsTrackingEdit(!fieldsTrackingEdit)
                            }
                          >
                            <ButtonDS size='icon' outline={fieldsTrackingEdit}>
                              <i className='bx bxs-pencil'></i>
                            </ButtonDS>
                          </div>
                        </div>
                        <div>
                          {!fieldsTrackingEdit && (
                            <table className='table'>
                              <tbody>
                                <tr>
                                  <td>Código</td>
                                  <td>
                                    {saleItem.sale_item.tracking.code ? (
                                      <textarea
                                        id='shipping-code'
                                        className='form-control pix-code'
                                        defaultValue={
                                          saleItem.sale_item.tracking.code
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          copyToClipboard(
                                            saleItem.sale_item.tracking.code,
                                            'Código de rastreio copiado com sucesso',
                                            ref2
                                          );
                                        }}
                                        ref={ref2}
                                        style={{ height: '35px' }}
                                        readOnly
                                      />
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Link</td>
                                  <td>
                                    {saleItem.sale_item.tracking.url ? (
                                      <textarea
                                        id='shipping-url'
                                        className='form-control pix-code'
                                        defaultValue={
                                          saleItem.sale_item.tracking.url
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          copyToClipboard(
                                            saleItem.sale_item.tracking.url,
                                            'Link de rastreio copiado com sucesso',
                                            ref3
                                          );
                                        }}
                                        ref={ref3}
                                        style={{ height: '35px' }}
                                        readOnly
                                      />
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Empresa</td>
                                  <td>
                                    {saleItem.sale_item.tracking.company ? (
                                      <textarea
                                        id='shipping-company'
                                        className='form-control pix-code'
                                        defaultValue={
                                          saleItem.sale_item.tracking.company
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          copyToClipboard(
                                            saleItem.sale_item.tracking.company,
                                            'Empresa copiada com sucesso',
                                            ref3
                                          );
                                        }}
                                        ref={ref3}
                                        style={{ height: '35px' }}
                                        readOnly
                                      />
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Código Frenet</td>
                                  <td>
                                    {saleItem.sale_item.tracking.frenet ? (
                                      <textarea
                                        id='shipping-frenet'
                                        className='form-control pix-code'
                                        defaultValue={
                                          saleItem.sale_item.tracking.frenet
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          copyToClipboard(
                                            saleItem.sale_item.tracking.frenet,
                                            'Rastreio copiada com sucesso',
                                            ref3
                                          );
                                        }}
                                        ref={ref3}
                                        style={{ height: '35px' }}
                                        readOnly
                                      />
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                          {fieldsTrackingEdit && (
                            <>
                              <table className='table'>
                                <tbody>
                                  <tr>
                                    <td>Código</td>
                                    <td>
                                      <Form.Control
                                        defaultValue={
                                          saleItem.sale_item.tracking.code
                                        }
                                        name='code'
                                        onChange={(e) =>
                                          onChangeFieldsTracking(e)
                                        }
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Link</td>
                                    <td>
                                      {' '}
                                      <Form.Control
                                        defaultValue={
                                          saleItem.sale_item.tracking.url
                                        }
                                        name='url'
                                        onChange={(e) =>
                                          onChangeFieldsTracking(e)
                                        }
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <div className='w-100 d-flex justify-content-end mb-4'>
                                <ButtonDS
                                  onClick={() =>
                                    setModalCancelTrackingShow(true)
                                  }
                                >
                                  Salvar
                                </ButtonDS>
                              </div>
                            </>
                          )}
                        </div>
                      </Tab>
                    )}
                    <Tab
                      eventKey='grouped_sales'
                      onEnter={() => setEnterGroup(true)}
                      title={
                        <span>
                          <i class='bx bx-history'></i>
                          Histórico
                        </span>
                      }
                    >
                      {loadingGrouped ? (
                        <Spinner size='sm' variant='light' animation='border' />
                      ) : (
                        <div className='container-datatable card'>
                          <DataTable
                            paginationComponentOptions={{
                              rowsPerPageText: 'Linhas por página',
                              rangeSeparatorText: 'de',
                              selectAllRowsItem: false,
                              selectAllRowsItemText: 'Todos',
                              noRowsPerPage: true,
                            }}
                            columns={columns()}
                            data={groupedSales.rows}
                            striped
                            highlightOnHover
                            progressPending={loading}
                            progressComponent={
                              <Loader title='Carregando vendas...' />
                            }
                            noDataComponent={<NoDataComponentContent />}
                            pagination
                            paginationServer
                            paginationTotalRows={groupedSales.count}
                            paginationPerPage={10}
                            onChangePage={(page) => setPageGroup(page - 1)}
                          />
                        </div>
                      )}
                    </Tab>
                  </Tabs>
                </Col>
              </Row>

              <Row className='mb-3'>
                <Col xs={6} className='d-flex justify-content-start'>
                  {saleItem.sale_item.status.name.toLowerCase() === 'pago' &&
                    saleItem.role.key === 'producer' &&
                    (activeTab === 'sale' || activeTab === 'customer') && (
                      <ButtonDS
                        size='sm'
                        variant='secondary'
                        style={{
                          backgroundColor: '#081a36', // azul escuro
                          color: '#fff', // texto/ícone branco
                          border: 'none', // remove borda se necessário
                        }}
                        onClick={() => handleCopyData(activeTab)}
                      >
                        <i className='bx bx-copy-alt'></i>&nbsp;
                        {activeTab === 'customer'
                          ? 'Copiar Dados Cliente'
                          : 'Copiar Dados Venda'}
                      </ButtonDS>
                    )}
                </Col>

                <Col xs={6} className='d-flex justify-content-end'>
                  {saleItem.sale_item.status.name.toLowerCase() === 'pago' &&
                    saleItem.role.key === 'producer' && (
                      <ButtonDS
                        size='sm'
                        variant='danger'
                        onClick={() => {
                          setNav('refund');
                        }}
                      >
                        Reembolsar Esta Venda
                      </ButtonDS>
                    )}
                </Col>
              </Row>
            </>
          )}
          {nav === 'refund' && (
            <>
              <form action='' onSubmit={handleSubmit(onSubmit)}>
                <h5>Reembolsar Venda</h5>
                <small className='mb-3 d-block'>
                  Enviando este formulário, enviaremos o pedido de reembolso
                  para seu cliente. Caso a venda tenha sido feita com cartão de
                  crédito ou pix, o reembolso é instântaneo e automático e
                  gratuito.
                </small>
                <div className='form-group'>
                  <Form.Control
                    as='textarea'
                    placeholder='Descreva um motivo para este reembolso...'
                    rows={5}
                    name='reason'
                    defaultValue={reason}
                    onChange={(e) => setReason(e.target.value)}
                    ref={register({ required: true })}
                  />
                  <div className='form-error'>
                    {errors.reason && <span>{errors.reason.message}</span>}
                  </div>
                </div>

                {!saleItem.student_has_bank_account &&
                  saleItem.payment.payment_method === 'billet' && (
                    <>
                      <h5 className='mt-4 mb-3'>Conta Bancária</h5>
                      <Row>
                        <Col xs={12}>
                          <div className='form-group'>
                            <label>Banco</label>
                            <Controller
                              name='bank_code'
                              control={control}
                              ref={register({ required: true })}
                              render={({ onChange, value, ref }) => {
                                return (
                                  <Select
                                    inputRef={ref}
                                    className='d-block'
                                    placeholder='Selecione um banco'
                                    isMulti={false}
                                    options={banksList}
                                    value={banksList.find(
                                      (c) => c.value === value
                                    )}
                                    onChange={(val) => onChange(val.value)}
                                  />
                                );
                              }}
                            />{' '}
                            <div className='form-error'>
                              {errors.bank_code && (
                                <span>{errors.bank_code.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className='form-group'>
                            <label>Agência (sem dígito)</label>
                            <input
                              ref={register({ required: true })}
                              type='text'
                              className='form-control input-default'
                              name='account_agency'
                              maxLength='4'
                            />{' '}
                            <div className='form-error'>
                              {errors.account_agency && (
                                <span>{errors.account_agency.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className='form-group'>
                            <label>Conta (com dígito)</label>
                            <input
                              ref={register({ required: true })}
                              type='text'
                              className='form-control input-default '
                              name='account_number'
                            />{' '}
                            <div className='form-error'>
                              {errors.account_number && (
                                <span>{errors.account_number.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className='form-group'>
                            <label>Tipo da conta</label>
                            <Controller
                              name='account_type'
                              control={control}
                              ref={register({ required: true })}
                              render={({ onChange, ref }) => {
                                return (
                                  <Select
                                    inputRef={ref}
                                    className='d-block'
                                    placeholder='Selecione um tipo'
                                    isMulti={false}
                                    options={[
                                      { label: 'Conta Corrente', value: 1 },
                                      { label: 'Conta Poupança', value: 2 },
                                    ]}
                                    onChange={setAccountType}
                                  />
                                );
                              }}
                            />{' '}
                            <div className='form-error'>
                              {errors.account_type && (
                                <span>{errors.account_type.message}</span>
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </>
                  )}
                <div className='d-flex justify-content-end mt-4'>
                  <ButtonDS
                    type='submit'
                    size='xs'
                    variant='danger'
                    disabled={reason.length === 0 || !isValid || requesting}
                    className='mt-3'
                  >
                    {!requesting
                      ? 'Confirmar Reembolso'
                      : 'Solicitando reembolso...'}
                  </ButtonDS>
                </div>
              </form>
            </>
          )}
          {nav === 'give_commision' && (
            <>
              <form action='' onSubmit={handleSubmit(commisionAffiliate)}>
                <label>Selecione um afiliado</label>
                <Select
                  value={selectedAffiliate}
                  onChange={(value) => setSelectedAffiliate(value)}
                  defaultValue={'Selecionar afiliado...'}
                  styles={colourStyles}
                  options={listAffiliates}
                  formatOptionLabel={formatOptionLabel}
                  filterOption={filterOptions}
                />
                {!requestAffiliates && listAffiliates.length === 0 && (
                  <div style={{ fontSize: 14 }}>
                    Você não possui afiliados nesse produto
                  </div>
                )}
                <div className='d-flex justify-content-end mt-4'>
                  <ButtonDS
                    type='submit'
                    size='xs'
                    variant='primary'
                    disabled={
                      listAffiliates.length === 0 || !isValid || requesting
                    }
                  >
                    {!requesting ? 'Dar comissão' : 'Carrengado...'}
                  </ButtonDS>
                </div>
              </form>
            </>
          )}

          {modalCancelTrackingShow && (
            <ConfirmAction
              title={'Alterar dados'}
              show={modalCancelTrackingShow}
              setShow={setModalCancelTrackingShow}
              handleAction={submitChangeFieldsTracking}
              buttonText={'Salvar'}
              variant={'warning'}
              variantButton={'warning'}
              textAlert={
                'Caso tenha integração Bling ativa, tentaremos atualizar apenas o endereço do cliente. Esta alteração afetará <b>apenas</b> a integração com o Bling e <b>não</b> impactará outras integrações.'
              }
              simpleConfirm
              centered
            />
          )}
          {modalCancelShow && (
            <ConfirmAction
              title={'Alterar dados'}
              show={modalCancelShow}
              setShow={setModalCancelShow}
              handleAction={submitChangeFields}
              buttonText={'Salvar'}
              variant={'warning'}
              variantButton={'warning'}
              textAlert={
                'Caso tenha integração Bling ativa, tentaremos atualizar apenas o endereço do cliente. Esta alteração afetará <b>apenas</b> a integração com o Bling e <b>não</b> impactará outras integrações.'
              }
              simpleConfirm
              centered
            />
          )}
        </>
      )}
    </div>
  );
};

export default Sale;

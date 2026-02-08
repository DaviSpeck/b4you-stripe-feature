import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import { FormatBRL } from '@utils';
import moment from 'moment';
import PaymentMethod from '../components/PaymentMethod';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import ConfirmAction from '../components/ConfirmAction';

const configNotify = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export default function ViewStudentSales({
  show,
  getStudentData,
  toggle,
  data,
  student,
  canRefund = true,
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [agency, setAgency] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [confirm, setConfirm] = useState(false);

  const downloadRefundReceipt = async () => {
    try {
      const { data: blob } = await api.get(
        `/sales/${data.uuid}/refund-receipt`,
        {
          responseType: 'blob'
        }
      )
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `comprovante-reembolso-${data.uuid}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erro ao gerar comprovante de reembolso', configNotify)
    }
  }

  const refundSale = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/sales/refund/${data.uuid}`, {
        agency,
        bank_code: bankCode,
        account_number: accountNumber,
        account_type: accountType,
      });
      setLoading(false);
      getStudentData();
      setShowModal(false);
      setConfirm(false);
      toggle();
      toast.success('Reembolso solicitado com sucesso', configNotify);
    } catch (error) {
      setLoading(false);
      setConfirm(false);
      toast.error(
        'Erro ao solicitar reembolso, por favor, entre em contato com os devs',
        configNotify,
      );
    }
  };

  const handleRefund = async (e) => {
    if (
      data.payment_method === 'billet' &&
      !student.bank_code &&
      !student.account_agency &&
      !student.account_number
    ) {
      e.preventDefault();
      setConfirm(false);
      setShowModal(true);
    } else {
      await refundSale(e);
    }
  };

  const copyProviderId = async () => {
    if (!data.provider) return;
    
    const match = data.provider.match(/ch_.+/);
    if (match && match[0]) {
      const chargeId = match[0];
      
      if (data.provider.includes('B4YOU_PAGARME_2')) {
        const pagarmeUrl = `https://dash.pagar.me/merch_NoGEqG0SMXh0DkOy/acc_OKkRG0RFVLH28EZj/charges/${chargeId}`;
        window.open(pagarmeUrl, '_blank', 'noopener,noreferrer');
      } else if (data.provider.includes('B4YOU_PAGARME_3')) {
        const pagarmeUrl = `https://dash.pagar.me/merch_PQVDXBLi9tN0WAaG/acc_YjnXPQsAWczyOr7w/charges/${chargeId}`;
        window.open(pagarmeUrl, '_blank', 'noopener,noreferrer');
      } else {
        try {
          await navigator.clipboard.writeText(chargeId);
          toast.success('ID copiado para a área de transferência', configNotify);
        } catch (error) {
          toast.error('Erro ao copiar ID', configNotify);
        }
      }
    }
  };

  const copyChargeId = async () => {
    if (!data.provider) return;
    
    const match = data.provider.match(/ch_.+/);
    if (match && match[0]) {
      const chargeId = match[0];
      try {
        await navigator.clipboard.writeText(chargeId);
        toast.success('ID copiado para a área de transferência', configNotify);
      } catch (error) {
        toast.error('Erro ao copiar ID', configNotify);
      }
    }
  };

  return (
    <>
      <ConfirmAction
        title="Reembolsar venda"
        show={confirm}
        setShow={setConfirm}
        textAlert="Deseja realmente reembolsar esta venda?"
        simpleConfirm
        centered
        buttonText="Reembolsar"
        handleAction={handleRefund}
      />
      <Modal
        id="modalBankAccount"
        isOpen={showModal}
        toggle={() => setShowModal(false)}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setShowModal(false)}>
          Conta bancária para reembolso
        </ModalHeader>
        <ModalBody>
          <FormGroup className="form-bank-account">
            <Label>Número da conta com dígito</Label>
            <Input
              onChange={({ target }) => {
                setAccountNumber(target.value);
              }}
            />
            <Label>Agência</Label>
            <Input
              onChange={({ target }) => {
                setAgency(target.value);
              }}
            />
            <Label>Código do banco</Label>
            <Input
              onChange={({ target }) => {
                setBankCode(target.value);
              }}
            />
            <Label>Tipo de conta</Label>
            <Input
              type="select"
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="savings">Poupança</option>
              <option value="checking">Corrente</option>
            </Input>
          </FormGroup>
          <div className="d-flex justify-content-end">
            <Button 
              color="danger" 
              onClick={(e) => refundSale(e)} 
              outline
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Reembolsar Venda'}
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        id="modalViewStudentSales"
        isOpen={show}
        toggle={toggle}
        centered
        size="lg"
      >
        <ModalHeader toggle={toggle}>Compras</ModalHeader>
        <ModalBody>
          {show && data && (
            <Card key={data.uuid}>
              <CardBody>
                <div className="view-ss-container">
                  <div className="view-ss-item">
                    <span>ID</span>
                    <span>{data.uuid}</span>
                  </div>
                  <hr />
                  <div className="view-ss-item align-items-center">
                    <div className="d-block w-25">Transação de pagamento</div>
                    <div>{data.payment_transaction}</div>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>PSPID</span>
                    <span>{data.psp_id}</span>
                  </div>
                  <hr />
                  {data.provider && data.provider !== ' - ' && (
                    <>
                      <div className="view-ss-item">
                        <span>PROVEDOR - ID</span>
                        <span className="d-flex align-items-center gap-2">
                          {data.provider}
                          {(data.provider.includes('B4YOU_PAGARME_2') || data.provider.includes('B4YOU_PAGARME_3')) ? (
                            <>
                              <Button
                                color="secondary"
                                size="sm"
                                outline
                                onClick={copyProviderId}
                                style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Abrir no Pagar.me
                              </Button>
                              <Button
                                color="secondary"
                                size="sm"
                                outline
                                onClick={copyChargeId}
                                style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                Copiar ID
                              </Button>
                            </>
                          ) : (
                            <Button
                              color="secondary"
                              size="sm"
                              outline
                              onClick={copyProviderId}
                              style={{ padding: '0.125rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Copiar ID
                            </Button>
                          )}
                        </span>
                      </div>
                      <hr />
                    </>
                  )}
                  <div className="view-ss-item">
                    <span>Data</span>
                    <span>
                      {moment(data.created_at).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  <hr className="mb-3" />
                  {data?.charge?.provider_response_details && (
                    <>
                      <div className="view-ss-item">
                        <span>Motivo da recusa</span>
                        <span>{data.charge.provider_response_details}</span>
                      </div>
                      <hr className="mb-3" />
                    </>
                  )}

                  <div className="view-ss-item">
                    <span>Produto</span>
                    <span>
                      <Link
                        to={`/producer/${data.producer?.uuid}/product/${data.product?.uuid}`}
                      >
                        {data.product.name}
                      </Link>
                    </span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Produtor</span>
                    <span>
                      <Link to={`/producer/${data.producer?.uuid}`}>
                        {data.producer.full_name}
                      </Link>
                    </span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>E-mail de suporte</span>
                    <span>
                      {data.product?.support_email ? (
                        <a href={`mailto:${data.product.support_email}`}>
                          {data.product?.support_email}
                        </a>
                      ) : (
                        'Não informado'
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>WhatsApp de suporte</span>
                    {data.product?.support_whatsapp ? (
                      <a
                        href={`https://wa.me/55${data.product?.support_whatsapp.replace(
                          / /g,
                          '',
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {data.product?.support_whatsapp}
                      </a>
                    ) : (
                      'Não informado'
                    )}
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Preço</span>
                    <span>{FormatBRL(data.price)}</span>
                  </div>
                  {data.price !== data.price_total && (
                    <>
                      <hr />
                      <div className="view-ss-item">
                        <span>Preço pago</span>
                        <span>{FormatBRL(data.price_total)}</span>
                      </div>
                    </>
                  )}
                  <hr />
                  <div className="view-ss-item">
                    <span>Tipo</span>
                    <span>{data.type}</span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Tipo do Produto</span>
                    {data.type_sale}
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Pagamento</span>
                    <span>{data.payment_type}</span>
                  </div>
                  <hr />
                  <div className="view-ss-item">
                    <span>Método de Pagamento</span>
                    <span>
                      <PaymentMethod type={data.payment_method} />
                    </span>
                  </div>
                  {data.payment_method === 'billet' && data?.charge && (
                    <>
                      <hr />
                      <div className="view-ss-item">
                        <span>Url boleto</span>
                        <span>
                          <a
                            href={data?.charge?.billet_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Link
                          </a>
                        </span>
                      </div>
                    </>
                  )}
                  <hr />
                  {(data.payment_method === 'card' ||
                    data.payment_method === 'Único') && (
                    <>
                      <div className="view-ss-item">
                        <span>Parcelas</span>
                        {data.installments}
                      </div>
                      <hr />
                    </>
                  )}
                  <div className="view-ss-item">
                    <span>Pago em</span>
                    <span>
                      {data.paid_at
                        ? moment(data.paid_at).format('DD/MM/YYYY HH:mm')
                        : '-'}
                    </span>
                  </div>
                  <hr />
                  {data.card && (
                    <>
                      <div className="view-ss-item">
                        <span>Últimos quatro dígitos</span>
                        <span>{data.card}</span>
                      </div>
                      <hr />
                    </>
                  )}
                  <div className="view-ss-item">
                    <span>Prazo máximo de </span>
                    <span>
                      {moment(data.valid_refund_until).format(
                        'DD/MM/YYYY HH:mm',
                      )}
                    </span>
                  </div>
                  {console.log(data)}
                  {data.sale?.params?.ip && (
                    <>
                      <hr />
                      <div className="view-ss-item">
                        <span>IP da compra</span>
                        <span>{data.sale.params.ip}</span>
                      </div>
                    </>
                  )}

                  <hr />
                  {data.refunds && (
                    <>
                      <div className="view-ss-item">
                        <span>Motivo do reembolso</span>
                        <span>{data.refunds?.reason || 'Não informado'}</span>
                      </div>
                      <hr />
                      <div className="view-ss-item">
                        <span>Solicitação reembolso</span>
                        <span>
                          {moment(data.refunds?.created_at).format(
                            'DD/MM/YYYY HH:mm',
                          )}
                        </span>
                      </div>
                      <hr />
                      <div className="view-ss-item">
                        <span>Atualização reembolso</span>
                        <span>
                          {moment(data.refunds?.updated_at).format(
                            'DD/MM/YYYY HH:mm',
                          )}
                        </span>
                      </div>
                      <div className="d-flex justify-content-end mt-1">
                        <Button
                          color="secondary"
                          size="sm"
                          outline
                          onClick={downloadRefundReceipt}
                        >
                          Ver comprovante de reembolso
                        </Button>
                      </div>
                  <hr />
                </>
              )}
              {!data.refunds && data.status?.key === 'refunded' && (
                <>
                  <div className="d-flex justify-content-end mt-1">
                    <Button
                      color="secondary"
                      size="sm"
                      outline
                      onClick={downloadRefundReceipt}
                    >
                      Ver comprovante de reembolso
                    </Button>
                      </div>
                      <hr />
                    </>
                  )}
                  <div className="view-ss-item">
                    <span>Venda por afiliado</span>
                    <span>
                      {data.id_affiliate ? (
                        <Badge color="success">Sim</Badge>
                      ) : (
                        <Badge color="warning">Não</Badge>
                      )}
                    </span>
                  </div>
                  {data?.affiliate && (
                    <div className="view-ss-item mt-2">
                      <span>Afiliado</span>
                      <Link to={`/producer/${data?.affiliate?.uuid}`}>
                        <span>{data?.affiliate?.full_name}</span>
                      </Link>
                    </div>
                  )}
                  {data?.tracking_code && (
                    <>
                      <div className="view-ss-item mt-2">
                        <span>Código de Rastreio</span>
                        <span>{data?.tracking_code || 'Não informado'}</span>
                      </div>
                      <div className="view-ss-item mt-2">
                        <span>URL de Rastreio</span>
                        <a
                          href={`${data?.tracking_url || 'Não informado'}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>{data?.tracking_url || 'Não informado'}</span>
                        </a>
                      </div>
                      <div className="view-ss-item mt-2">
                        <span>Empresa de Rastreio</span>
                        <span>{data?.tracking_company || 'Não informado'}</span>
                      </div>
                    </>
                  )}
                  {data.referral_commission && (
                    <>
                      <hr />
                      <div className="view-ss-item mt-2">
                        <span>Comissão por indicação</span>
                        <span>
                          {FormatBRL(data?.referral_commission.amount)}
                        </span>
                      </div>

                      <hr />
                      <div className="view-ss-item">
                        <span>Status</span>
                        <span>{data?.referral_commission.status.label}</span>
                      </div>
                      {data?.referral_commission.release_date && (
                        <>
                          <hr />
                          <div className="view-ss-item">
                            <span>Data de liberação</span>
                            <span>
                              {moment(
                                data.referral_commission.release_date,
                                'YYYY-MM-DD',
                              ).format('DD/MM/YYYY')}
                            </span>
                          </div>
                        </>
                      )}

                      <hr />
                      <div className="view-ss-item">
                        <span>Produtor</span>
                        <span>
                          <Link
                            to={`/producer/${data.referral_commission.user_uuid}`}
                          >
                            {data.referral_commission.full_name}
                          </Link>
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {data.status.key === 'paid' && canRefund && (
                  <div className="d-flex justify-content-end">
                    <Button
                      color="danger"
                      className="mt-3"
                      onClick={(e) => {
                        e.preventDefault();
                        setConfirm(true);
                        /*   if (
                            data.payment_method === 'billet' &&
                            !student.bank_code &&
                            !student.account_agency &&
                            !student.account_number
                          ) {
                            e.preventDefault();
                            setShowModal(true);
                          } else {
                            refundSale(e);
                          } */
                      }}
                      outline
                      disabled={loading}
                    >
                      {loading ? 'Carregando...' : 'Reembolsar Venda'}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </ModalBody>
      </Modal>
    </>
  );
}

import React from 'react';
import { FormatBRL } from '../../../utility/Utils';
import moment from 'moment/moment';

const resolveMethod = (method) => {
  if (method === 'card') return 'Cartão de Crédito';
  if (method === 'pix') return 'Pix';
  return 'Boleto';
};

const styles = {
  text: {
    color: '#000',
    fontSize: '10px',
    margin: 0,
    padding: 0,
    display: 'block',
  },
};

const renderSales = (sale) => {
  return (
    <div key={sale.uuid} style={{ marginTop: '20px' }}>
      <label style={styles.text}>ID {sale.uuid}</label>
      <label style={styles.text}>Status: {sale.status.name}</label>
      <label style={styles.text}>
        Transação de pagamento: {sale.payment_transaction}
      </label>
      <label style={styles.text}>PSPID: {sale.psp_id}</label>
      {sale.provider && sale.provider !== ' - ' && (
        <label style={styles.text}>PROVEDOR - ID {sale.provider}</label>
      )}
      <label style={styles.text}>
        Data: {moment(sale.created_at).format('DD/MM/YYYY HH:mm')}
      </label>
      <label style={styles.text}>Produto: {sale.product.name}</label>
      <label style={styles.text}>Produtor: {sale.producer.full_name}</label>
      <label style={styles.text}>
        E-mail de suporte: {sale.product.support_email ?? 'Não informado'}
      </label>
      <label style={styles.text}>
        Whatsapp de Suporte: {sale.product.support_whatsapp ?? 'Não informado'}
      </label>
      <label style={styles.text}>Preço: {FormatBRL(sale.price)}</label>
      {sale.price !== sale.price_total && (
        <label style={styles.text}>
          Preço pago: {FormatBRL(sale.price_total)}
        </label>
      )}
      <label style={styles.text}>Tipo: {sale.type}</label>
      <label style={styles.text}>Tipo do produto: {sale.type_sale}</label>
      <label style={styles.text}>Pagamento: {sale.payment_type}</label>
      <label style={styles.text}>
        Método de pagamento: {resolveMethod(sale.payment_method)}
      </label>
      {(sale.payment_method === 'card' || sale.payment_method === 'Único') && (
        <label style={styles.text}>Parcelas: {sale.installments}</label>
      )}
      <label style={styles.text}>
        Pago em:{' '}
        {sale.paid_at ? moment(sale.paid_at).format('DD/MM/YYYY HH:mm') : ' - '}
      </label>
      {sale.card && (
        <label style={styles.text}>Últimos quatro dígitos: {sale.card}</label>
      )}
      <label style={styles.text}>
        Prazo máximo de reembolso:{' '}
        {moment(sale.valid_refund_until).format('DD/MM/YYYY HH:mm')}
      </label>
      <label style={styles.text}>
        Venda por afiliado: {sale.id_affiliate ? 'Sim' : 'Não'}
      </label>
      {sale?.affiliate && (
        <label style={styles.text}>Afiliado: {sale.affiliate.full_name}</label>
      )}
      {sale?.tracking_code && (
        <div>
          <label style={styles.text}>
            Código de Rastreio: {sale.tracking_code ?? 'Não informado'}
          </label>
          <label style={styles.text}>
            URL de Rastreio: {sale.tracking_url ?? 'Não informado'}
          </label>
          <label style={styles.text}>
            Empresa de rastreio: {sale.tracking_company ?? 'Não informado'}
          </label>
        </div>
      )}
    </div>
  );
};

export default function General({ student, sales }) {
  return (
    <div id="content-id" style={{ marginLeft: '20px', marginTop: '20px' }}>
      <label style={styles.text}>Nome: {student.full_name}</label>
      <label style={styles.text}>E-mail: {student.email}</label>
      <label style={styles.text}>CPF: {student.document_number}</label>
      <label style={{ ...styles.text, marginTop: '20px' }}>Compras</label>
      {sales.map((s) => renderSales(s))}
    </div>
  );
}

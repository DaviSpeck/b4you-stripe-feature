import moment from 'moment';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import BadgeDS from '../jsx/components/design-system/BadgeDS';
import api from '../providers/api';

const configNotify = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export function getRGBA(color, opacity = 1) {
  if (color.length == 7) {
    var r = parseInt(color.substr(1, 2), 16);
    var g = parseInt(color.substr(3, 2), 16);
    var b = parseInt(color.substr(5, 2), 16);

    return `rgba(${r},${g},${b},${opacity})`;
  } else {
    return false;
  }
}

export const notify = ({ message, type, time = 5000 }) => {
  configNotify.autoClose = time;
  if (type === 'success') {
    toast.success(message, configNotify);
  }
  if (type === 'info') {
    toast.info(message, configNotify);
  }
  if (type === 'warn') {
    toast.warn(message, configNotify);
  }
  if (type === 'error') {
    toast.error(message, configNotify);
  }
  if (type === 'default') {
    toast(message, configNotify);
  }
};

export const copyToClipboard = (param, text = 'Copiado com sucesso') => {
  navigator.clipboard.writeText(param);
  notify({
    message: text,
    type: 'success',
  });
  setTimeout(() => { }, 3000);
};

export const currency = (amount) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const convertStringToFloat = (value) => {
  if (value) {
    return parseFloat(
      value.toString().replaceAll('.', '').replaceAll(',', '.')
    );
  } else {
    return 0.0;
  }
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phoneNumber;
};

export const callExportExcel = (exportUrl, filterParams, format) => {
  const params = { format };
  for (const [key, value] of filterParams.entries()) {
    params[key] = value;
  }
  api
    .get(exportUrl, { params })
    .then(() => {
      notify({
        message:
          'Requisição feita com sucesso. Seu arquivo será processado e enviado em seu e-mail.',
        type: 'success',
      });
    })
    .catch(() => {
      notify({
        message: 'Erro ao exportar, tente novamente mais tarde.',
        type: 'error',
      });
    });
};

export const offerName = (
  index,
  offerName,
  upsell = null,
  order_bumps = null,
  hasSupplier = false,
  has_upsell_native = false,
  has_upsell_native_product = false
) => {
  const hasUpsellNativeOffer = Boolean(has_upsell_native);
  const hasUpsellNativeProduct = Boolean(
    !has_upsell_native && has_upsell_native_product
  );

  return (
    <>
      <div className='offer-name'>
        <span className='name'>{offerName}</span>
        <div className='d-flex ml-auto'>
          {upsell && (
            <div className='d-flex ml-1'>
              <BadgeDS variant='warning' size='icon'>
                UP-EXT
              </BadgeDS>
            </div>
          )}

          {hasUpsellNativeOffer && (
            <div className='d-flex ml-1' title='Upsell nativo na oferta'>
              <BadgeDS variant='info' size='icon'>
                UP-NAT-O
              </BadgeDS>
            </div>
          )}

          {hasUpsellNativeProduct && (
            <div className='d-flex ml-1' title='Upsell nativo no produto'>
              <BadgeDS variant='info' size='icon'>
                UP-NAT-P
              </BadgeDS>
            </div>
          )}

          <div className='d-flex ml-1'>
            {order_bumps.length > 0 && (
              <BadgeDS variant='primary' size='icon'>
                OB
              </BadgeDS>
            )}
          </div>

          <div className='d-flex ml-1'>
            {hasSupplier && (
              <BadgeDS variant='info' size='icon'>
                FN
              </BadgeDS>
            )}
          </div>
        </div>
      </div>
      <ReactTooltip id={`tt-us-${index}`}>Up-sell</ReactTooltip>
      <ReactTooltip id={`tt-ob-${index}`}>Order Bump</ReactTooltip>
      <ReactTooltip id={`tt-sup-${index}`}>Fornecedor vinculado</ReactTooltip>
    </>
  );
};

export const mysql_to_js_date = (dateString) => {
  if (dateString) {
    return new Date(Date.parse(dateString.replace(/[-]/g, '/')));
  } else {
    return null;
  }
};

export const date = (dateString, format = 'DD/MM/YYYY') => {
  return dateString && moment(dateString).format(format);
};

export const datetime = (dateString) => {
  return dateString && moment(dateString).format('DD/MM/YYYY - HH:mm');
};

export const mysql_date = (dateString, format = 'YYYY-MM-DD') => {
  return dateString && moment(dateString).format(format);
};

export const mysql_datetime = (dateString) => {
  return dateString && moment(dateString).format('YYYY-MM-DD HH:mm:ss');
};

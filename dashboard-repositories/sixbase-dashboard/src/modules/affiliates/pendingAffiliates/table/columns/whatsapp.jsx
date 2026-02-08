import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import { notify } from '../../../../functions';

export const WhatsappAction = (props) => {
  const { number } = props;

  const validatePhone = (number) => {
    if (!number) {
      return null;
    }

    const numberClean = String(number).replace(/\D/g, '');

    if (numberClean.length === 10) {
      return numberClean;
    }

    if (numberClean.length === 11 && numberClean[2] === '9') {
      return numberClean;
    }

    return null;
  };

  const openWhatsApp = (number) => {
    const numberValid = validatePhone(number);

    if (!numberValid) {
      notify({
        message: 'Número de WhatsApp inválido. Verifique e tente novamente',
        type: 'error',
      });
      return;
    }

    const url = `https://wa.me/+55${numberValid}`;
    window.open(url, '_blank');
  };

  return (
    <ButtonDS
      size={'icon'}
      className='mr-2'
      variant='success'
      onClick={() => openWhatsApp(number)}
    >
      <i className='bx bxl-whatsapp'></i>
    </ButtonDS>
  );
};

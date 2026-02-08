import Currency from '../../jsx/components/Currency';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import './style.scss';

const ModalFutures = ({
  withheld_balance,
  setModalFuturesShow,
  setModalExpectedReceipt,
}) => {
  const openModalExpectedReceipt = () => {
    setModalFuturesShow(false);
    setModalExpectedReceipt(true);
  };

  return (
    <div id='modal-futures'>
      <p>
        O <b>saldo pendente</b> é a soma dos valores que você tem a receber mais
        o valor retido para reserva de segurança.
      </p>
      <p>
        <b>Pix:</b> Disponível <b>instantaneamente</b>;
      </p>
      <p>
        <b>Boleto:</b> Disponível em <b>um dia</b> após a compensação deste;
      </p>
      <p>
        <b>Cartão:</b> Disponível em <b>15 dias</b> após a compra;
      </p>
      <p className='d-inline-block'>
        <b>*10% do saldo total ou a maior comissão</b> ficam como saldo de
        reserva por 30 dias para possíveis reembolsos e chargebacks.
        <a
          href='https://ajuda.b4you.com.br/post/523/como-funciona-a-reserva-de-seguranca-na-b4you'
          target='_blank'
          rel='noreferrer'
        >
          <ButtonDS variant='link' className='d-inline-block ml-1 text-left'>
            Saiba mais
          </ButtonDS>
        </a>
      </p>
      <p>
        Seu saldo em reserva de Segurança é de{' '}
        <b>
          <Currency amount={withheld_balance} />
        </b>
      </p>
      <ButtonDS onClick={openModalExpectedReceipt}>
        Previsão de Recebimentos
      </ButtonDS>
    </div>
  );
};

export default ModalFutures;

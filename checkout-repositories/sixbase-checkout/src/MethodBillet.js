import { currency } from 'functions';

const MethodBillet = ({ offer }) => {
  return (
    <>
      <h2>Atente-se aos detalhes do boleto bancário:</h2>
      <ul>
        <li>
          Boleto somente à vista: <b>{currency(offer.price)}</b>.
        </li>
        <li>
          Pagamentos com Boleto Bancário levam até 3 dias úteis para serem
          compensados e então terem os produtos liberados.
        </li>
        <li>
          Atente-se ao vencimento do boleto. Você pode pagar o boleto em
          qualquer banco ou casa lotérica até o dia do vencimento.
        </li>
        <li>
          Depois do pagamento, verifique seu e-mail para receber os dados de
          acesso ao produto (verifique também a caixa de SPAM).
        </li>
      </ul>
    </>
  );
};

export default MethodBillet;

import { currency } from 'functions';

const MethodPix = ({ offer, selectedPlan }) => {
  return (
    <div>
      <h2>Pague com o Pix, qualquer dia, a qualquer hora:</h2>
      <ul>
        <li>Pix somente à vista.</li>
        <li>Liberação imediata!</li>
        <li>
          É simples, só clicar no botão <span>&quot;Comprar Agora&quot;</span>{' '}
          abaixo;
        </li>
        <li>E usar o aplicativo do seu banco selecionando a opção PIX;</li>
        <li>
          Super seguro. O pagamento PIX foi desenvolvido pelo Banco Central do
          Brasil.
        </li>
        <li>
          Valor no Pix:{' '}
          {currency(selectedPlan ? selectedPlan.price : offer.price)}
        </li>
      </ul>
    </div>
  );
};

export default MethodPix;

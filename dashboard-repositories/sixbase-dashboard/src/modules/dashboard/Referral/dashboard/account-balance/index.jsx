import './style.scss';

export function AccountBalance(props) {
  const { availableBalance, outstandingBalance, registered } = props;

  return (
    <div className='wrapper-account-balance'>
      <span className='title'>Bônus por indicação</span>
      <div className='wrapper-content'>
        <div className='wrapper-available-balance'>
          <div className='withdrawal-available'>
            <span className='currency'>R$</span>
            <span className='price'>
              {availableBalance
                .toLocaleString('pt-br', {
                  currency: 'BRL',
                  style: 'currency',
                })
                .slice(3)}
            </span>
          </div>
          <span className='label'>Saldo disponível</span>
        </div>
        <div className='peading-balance-wrapper'>
          <div className='peading-balance'>
            <div className='withdrawal-peading'>
              <span className='currency'>R$</span>
              <span className='price'>
                {outstandingBalance
                  .toLocaleString('pt-br', {
                    currency: 'BRL',
                    style: 'currency',
                  })
                  .slice(3)}
              </span>
            </div>
            <span className='label'>Saldo pendente</span>
          </div>
        </div>
        <div className='line' />
        <div className='wrapper-amount-register'>
          <span className='amount'>{registered} pessoas cadastradas</span>
          <span className='label'>Cadastros</span>
        </div>
      </div>
    </div>
  );
}

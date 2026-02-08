const DoubleCard = () => {
  return (
    <div>
      <div className='tab-pane tab-pane-2 p-3'>
        <div className='row'>
          <div className='tab-pane-2-1 col-lg-6 col-md-12 '>
            <span className='tab-pane-2-title'>Cartão 1</span>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor='creditCardValue'>
                  <i className='las la-dollar-sign'></i>
                </label>
                <input
                  inputMode='numeric'
                  name='creditCardValue'
                  id='creditCardValue'
                  className='form-control'
                  type='text'
                  placeholder='Valor'
                  value='23,50'
                  autoComplete='cc-number'
                  required
                  onChange={dale}
                />
              </div>
            </div>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor='card'>
                  <i className='las la-credit-card'></i>
                </label>
                <input
                  name='card'
                  id='card'
                  className='form-control'
                  type='text'
                  placeholder='Número do Cartão'
                  autoComplete='cc-number'
                  required
                />
              </div>
            </div>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor='card-owner-name'>
                  <i className='las la-user'></i>
                </label>
                <input
                  name='card-owner-name'
                  id='card-owner-name'
                  className='form-control'
                  type='text'
                  placeholder='Nome do titular'
                  autoComplete='cc-name'
                />
              </div>
            </div>
            <div className='date form-group my-3'>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor='cc-exp'>
                    <i className='las la-calendar-minus'></i>
                  </label>
                  <input
                    name='cc-exp'
                    id='cc-exp'
                    className='form-control'
                    type='text'
                    placeholder='MM/YY'
                    autoComplete='cc-exp'
                    required
                  />
                </div>
              </div>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor='cvc'>
                    <i className='las la-lock'></i>
                  </label>
                  <input
                    name='cvc'
                    id='cvc'
                    className='form-control'
                    type='text'
                    placeholder='CVC/CVV'
                    autoComplete='cc-csc'
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <span className='span-style'>5x R$ 5,12</span>
              <div className='btn btn-link py-0 edit-parcels'>
                Editar Parcelas
              </div>
            </div>
          </div>
          <div className='tab-pane-2-2 col-lg-6 col-md-12'>
            <span className='tab-pane-2-title'>Cartão 2</span>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor='creditCardValue'>
                  <i className='las la-dollar-sign'></i>
                </label>
                <input
                  inputMode='numeric'
                  name='creditCardValue'
                  id='creditCardValue'
                  className='form-control'
                  type='text'
                  placeholder='Valor'
                  value='23,50'
                  autoComplete='cc-number'
                  required
                  onChange={dale}
                />
              </div>
            </div>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor='card'>
                  <i className='las la-credit-card'></i>
                </label>
                <input
                  name='card'
                  id='card'
                  className='form-control'
                  type='text'
                  placeholder='Número do Cartão'
                  autoComplete='cc-number'
                  required
                />
              </div>
            </div>
            <div className='input-group mb-3'>
              <div className='area'>
                <label htmlFor='card-owner-name'>
                  <i className='las la-user'></i>
                </label>
                <input
                  name='card-owner-name'
                  id='card-owner-name'
                  className='form-control'
                  type='text'
                  placeholder='Nome do titular'
                  autoComplete='cc-name'
                />
              </div>
            </div>
            <div className='date form-group my-3 '>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor='cc-exp'>
                    <i className='las la-calendar-minus'></i>
                  </label>
                  <input
                    name='cc-exp'
                    id='cc-exp'
                    className='form-control'
                    type='text'
                    placeholder='MM/YY'
                    autoComplete='cc-exp'
                    required
                  />
                </div>
              </div>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor='cvc'>
                    <i className='las la-lock'></i>
                  </label>
                  <input
                    name='cvc'
                    id='cvc'
                    className='form-control'
                    type='text'
                    placeholder='CVC/CVV'
                    autoComplete='cc-csc'
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <span className='span-style'>5x R$ 5,12</span>
              <div className='btn btn-link py-0 edit-parcels'>
                Editar Parcelas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubleCard;

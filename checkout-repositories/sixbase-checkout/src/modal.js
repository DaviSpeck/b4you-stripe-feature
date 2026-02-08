import React from 'react';

const Modal = () => {
  return (
    <div>
      <div
        className='modalSingIn'
        id='modalSingIn'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='modalSingInTitle'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id=''>
                Entre com a sua conta
              </h5>
            </div>
            <div className='modal-body'>
              <div className='warning'>Este email já está cadastrado.</div>
              <div className='currentMail'>nandokferrari@gmail.com</div>
              <div className='input-group'>
                <div className='area'>
                  <label htmlFor='pass'>
                    <i className='las la-key'></i>
                  </label>
                  <input
                    name='pass'
                    id='pass'
                    className='form-control'
                    type='password'
                    placeholder='Sua senha'
                    autoComplete='current-password'
                    required
                  />
                </div>
              </div>
              <button className='btn btn-primary'>Fazer Login</button>
              <div className='text-group'>
                <div>
                  <a href='#'>Esqueci minha senha</a>
                </div>
                <div>ou</div>
                <div>
                  <a href='#'>Quero comprar com outro e-mail</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

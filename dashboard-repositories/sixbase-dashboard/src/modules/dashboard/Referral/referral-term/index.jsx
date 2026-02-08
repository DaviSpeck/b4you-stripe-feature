import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import b4yImage from '../../../../images/logo-horizontal.png';
import ImageDocument from '../../../../images/regulamento-img.png';
import LoadingIconB4Y from '../../../../jsx/components/LoadingIconB4Y';
import './style.scss';
import { Document } from './document';

export function ReferralTerm(props) {
  const [isRead, setIsRead] = useState(false);
  const [isAccept, setIsAccept] = useState(false);

  const { isAccepting, isLoading, onAccept } = props;

  if (isLoading) {
    return (
      <div className='loading'>
        <LoadingIconB4Y />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
      }}
    >
      <div className='wrapper'>
        <div className='card-wrapper-referral'>
          <ReferralTerm.Header />
          <main className='card-main'>
            <div className='document-wrapper'>
              <Document
                isRead={isRead}
                onRead={(value) => {
                  if (!isRead) setIsRead(() => value);
                }}
              />
              <div className='document-wrapper-action'>
                <ReferralTerm.AcceptInput
                  isChecked={isAccept}
                  onCheck={(value) => setIsAccept(value)}
                />
                <button
                  disabled={!isAccept || !isRead || isAccepting}
                  className='document-btn-accept'
                  onClick={onAccept}
                >
                  {!isAccepting && 'Participar do programa'}
                  {isAccepting && (
                    <Spinner
                      animation='border'
                      size='sm'
                      role='status'
                    ></Spinner>
                  )}
                </button>
              </div>
            </div>
            <div className='image'>
              <img src={ImageDocument} />
            </div>
          </main>
        </div>
        <div className='footer'>
          <img src={b4yImage} />
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/display-name
ReferralTerm.Header = function () {
  return (
    <header className='header-page'>
      <h1>Programa de Indicação B4You</h1>
      <p>
        Ganhe 10% de comissão sobre a taxa de intermediação da B4You, das
        pessoas que você indicar, por 12 meses.
      </p>
    </header>
  );
};

// eslint-disable-next-line react/display-name
ReferralTerm.AcceptInput = function (props) {
  const { isChecked, onCheck } = props;

  return (
    <div className='d-flex align-items-center'>
      <input
        id='terms'
        style={{ cursor: 'pointer' }}
        value={isChecked}
        type='checkbox'
        name='terms'
        onClick={(e) => onCheck(e.target.checked)}
      />
      <label
        for='terms'
        className='d-flex mb-0 term-text'
        style={{ fontWeight: '500' }}
      >
        Li e aceito os Termos e Condições
      </label>
    </div>
  );
};

import { TurnstileChallenge } from '../shared/Turnstile';
import styles from './Footer.module.css';

export function Footer({ offer, handleToken, displayChallenge }) {
  const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';

  return (
    <>
      <div className={styles.footer} style={{ '--hex-color': hexColor }}>
        <span className={styles.text88}>
          <span>Formas de pagamento</span>
        </span>
        <div className={styles.cartoes}>
          <img
            src='/external/paymentmethodslightvisa3203-l31s.svg'
            alt='paymentmethodslightvisa3203'
            className={styles.paymentmethodslightvisa}
          />
          <img
            src='/external/paymentmethodslightmastercard3203-sf1i.svg'
            alt='paymentmethodslightmastercard3203'
            className={styles.paymentmethodslightmastercard}
          />
          <img
            src='/external/paymentmethodslightmaestro3203-r2a9.svg'
            alt='paymentmethodslightmaestro3203'
            className={styles.paymentmethodslightmaestro}
          />
          <img
            src='/external/paymentmethodslightjcb3203-m7i.svg'
            alt='paymentmethodslightjcb3203'
            className={styles.paymentmethodslightjcb}
          />
          <img
            src='/external/paymentmethodslighthipercard3203-5i8.svg'
            alt='paymentmethodslighthipercard3203'
            className={styles.paymentmethodslighthipercard}
          />
          <img
            src='/external/paymentmethodslightelo3203-zmb.svg'
            alt='paymentmethodslightelo3203'
            className={styles.paymentmethodslightelo}
          />
          <img
            src='/external/paymentmethodslightdiscover3203-b54o.svg'
            alt='paymentmethodslightdiscover3203'
            className={styles.paymentmethodslightdiscover}
          />
          <img
            src='/external/paymentmethodslightdinersclub3203-nqz8.svg'
            alt='paymentmethodslightdinersclub3203'
            className={styles.paymentmethodslightdinersclub}
          />
          <img
            src='/external/paymentmethodslightamericanexpress3203-2jw4.svg'
            alt='paymentmethodslightamericanexpress3203'
            className={styles.paymentmethodslightamericanexpress}
          />
        </div>
        <div className='d-flex justify-content-center'>
          <TurnstileChallenge
            isOpen={displayChallenge}
            siteKey={offer.site_key}
            onSuccess={handleToken}
            onExpire={() => handleToken('')}
          />
        </div>

        <div>
          <div className='footer'>
            <div>
              <div className='text-center'>
                <div>
                  Esse site é protegido pelo reCAPTCHA do Google
                  <div>
                    {/* <a
                      href='https://blog.b4you.com.br/wp-content/uploads/2023/08/B4you-Poli%CC%81tica-de-Privacidade-do-Site.pdf'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Política de Privacidade
                    </a>{' '}
                    e{' '} */}
                    <a
                      href='https://b4you.com.br/termos'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Termos de Uso
                    </a>
                  </div>
                </div>
              </div>
              {/*<p className='mb-0 text-center'>
                *Parcelamento com acréscimo. Ao prosseguir você concorda com a{' '}
                <a
                  href='https://blog.b4you.com.br/wp-content/uploads/2025/06/B4you-Politica-de-Pagamento.pdf'
                  target='_blank'
                  rel='noreferrer'
                >
                  Política de Pagamento
                </a>
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

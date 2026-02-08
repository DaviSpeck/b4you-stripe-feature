import { useEffect, useState } from 'react';
import { ReactComponent as ClockIcon } from '../styles/clock.svg';
import CountdownTimer from './CountdownTimer';
import styles from './Header.module.css';

export function Header({ offer, product }) {
  const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';
  const [isMobile, setIsMobile] = useState(false);
  const counterActive = offer?.counter_three_steps?.active
  ? true
  : false;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div className={styles.container} style={{ '--hex-color': hexColor }}>
        <div className={styles.header} style={{ '--hex-color': hexColor }}>
          <img
            src={
              product.logo
                ? product.logo
                : '/external/logotipobig13062-0c5e-200h.png'
            }
            alt='logo'
            className={styles.logotipobig1}
            style={{ '--hex-color': hexColor }}
          />

          {!isMobile && counterActive && (
            <div className={styles.pagamentoseg3}>
              <ClockIcon style={{ stroke: hexColor }} />
              <div className={styles.pagamentoseg4}>
                <span className={styles.text04}>
              <CountdownTimer
                initialSeconds={offer?.counter_three_steps?.seconds}
                label={offer?.counter_three_steps?.label}
                label_end={offer?.counter_three_steps?.label_end} />
                </span>
              </div>
            </div>
          )}

          <div className={styles.pagamentoseg}>
            <div className={styles.pagamentoseg2}>
              <img
                src='/external/shieldcheck3134-naqj.svg'
                alt='shieldcheck'
                className={styles.shieldcheck}
              />
            </div>
            <div className={styles.spc}>
              <span className={styles.text01}>
                <span>PAGAMENTO</span>
              </span>
              <span className={styles.text02}>
                <span>100% SEGURO</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {isMobile && counterActive && (
        <>
          <meta
            name='viewport'
            content='width=device-width, initial-scale=1, maximum-scale=1'
          ></meta>

          <div
            className={styles.pagamentoseg3}
            style={{ '--hex-color': hexColor }}
          >
            <div className={styles.pagamentoseg4}>
              <span className={styles.text04}>
                <span>Oferta termina em: </span>
              </span>
              <span className={styles.text06}>
              <CountdownTimer
                initialSeconds={offer?.counter_three_steps?.seconds}
                label={offer?.counter_three_steps?.label}
                label_end={offer?.counter_three_steps?.label_end}/>
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}

import { currency } from 'functions';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './Popup.module.css';

const PopupAlerta = ({ config, setCoupon, setConfirmAction }) => {
  const [canShowPopup, setCanShowPopup] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const shownTriggers = useRef({
    mouseMove: false,
    closePage: false,
    afterTime: false,
  });

  const confirmCoupon = () => {
    const validateDate = config.coupon.expires_at
      ? new Date(config.coupon.expires_at) > new Date()
      : true;

    if (config.coupon.active && validateDate) {
      setCoupon(config.coupon);
      setConfirmAction(true);
      setShowPopup(false);

      shownTriggers.current.closePage = true;
      shownTriggers.current.mouseMove = true;
      shownTriggers.current.afterTime = true;
    } else {
      setShowPopup(false);
      shownTriggers.current.closePage = true;
      toast.error(
        'Cupom inválido ou expirado. Por favor, verifique as informações.'
      );
    }
  };

  useEffect(() => {
    if (!config?.active) return;

    const delayInMs = parseInt(config.popup_delay, 10) * 1000;

    const timer = setTimeout(() => {
      setCanShowPopup(true);
    }, delayInMs);

    return () => clearTimeout(timer);
  }, [config]);

  useEffect(() => {
    if (!config?.active || !config.afterTime || !canShowPopup) return;
    if (shownTriggers.current.afterTime) return;

    shownTriggers.current.afterTime = true;
    setShowPopup(true);
  }, [canShowPopup, config]);

  useEffect(() => {
    if (!config?.active || !canShowPopup) return;

    const pushState = () =>
      window.history.pushState(null, '', window.location.href);

    pushState();

    const handlePopState = () => {
      if (config.closePage && !shownTriggers.current.closePage) {
        shownTriggers.current.closePage = true;
        setShowPopup(true);
        pushState();
      }
    };

    const handleMouseOut = (e) => {
      if (
        config.mouseMove &&
        e.relatedTarget === null &&
        !shownTriggers.current.mouseMove
      ) {
        shownTriggers.current.mouseMove = true;
        setShowPopup(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [canShowPopup, config]);

  if (!showPopup) return null;

  return (
    <div className={styles.container}>
      <div
        className={styles.bg}
        style={{
          backgroundColor: config.hex_color_bg || '#DB0000',
        }}
      >
        <button
          className={styles.buttonClose}
          onClick={() => setShowPopup(false)}
          style={{
            color: config.hex_color_text,
          }}
          aria-label='Fechar popup'
        >
          Fechar
        </button>

        <div
          className={styles.bgDashed}
          style={{
            color: config.hex_color_text || '#FFFFFF',
          }}
        >
          <h2 className={styles.title}>{config.popup_title.toUpperCase()}</h2>

          <div className={styles.coupon}>
            {config.coupon.amount
              ? currency(config.coupon.amount)
              : config.coupon.percentage + '%'}
          </div>

          <p className={styles.discountText}>{config.popup_discount_text}</p>
          <p className={styles.secondaryText}>{config.popup_secondary_text}</p>

          <button
            className={styles.buttonAccept}
            onClick={confirmCoupon}
            style={{
              backgroundColor: config.hex_color_button || '#51B55B',
              color: config.hex_color_button_text || '#FFFFFF',
            }}
          >
            {config.popup_button_text.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupAlerta;

import api from 'api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const Coupon = ({
  offer,
  setCoupon,
  cupom,
  coupon,
  id_product,
  cpf,
  oldCoupon,
  setOldCoupon,
  paymentMethod,
  priceTotal = 0,
  itemsQuantity = 0,
  confirmAction,
  setConfirmAction,
  trackEvent,
  getValues,
}) => {
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [userAttempted, setUserAttempted] = useState(false);

  const { uuidOffer } = useParams();

  const resetCoupon = () => {
    setCoupon(null);
    setOldCoupon(null);
    setError(false);
    setSuccess(false);
    setUserAttempted(false);
  };

  const validateCouponRules = (data) => {
    return (
      itemsQuantity >= data.min_items &&
      priceTotal >= data.min_amount &&
      priceTotal > 0 &&
      data.amount <= priceTotal * 0.8
    );
  };

  const applyCoupon = (value) => {
    const eventDetails = {
      step: 'payment',
      email: getValues ? getValues('email') : undefined,
      phone: getValues ? getValues('whatsapp') : undefined,
    };
    const couponCode = value.trim();
    if (!couponCode) {
      setError(true);
      setSuccess(false);
      setCoupon(null);
      setUserAttempted(true);
      trackEvent?.('checkout_coupon_error', eventDetails);
      return;
    }

    setError(false);
    setSuccess(false);
    setUserAttempted(true);

    api
      .get(
        `offers/${uuidOffer}/coupon/${couponCode}?cpf=${cpf}&id_product=${id_product}`
      )
      .then((r) => {
        const data = r.data;

        if (!data || data.already_used) {
          setError(true);
          setSuccess(false);
          setCoupon(null);
          trackEvent?.('checkout_coupon_error', eventDetails);
          return;
        }

        if (!data.payment_methods.includes(paymentMethod)) {
          setError(true);
          setSuccess(false);
          setCoupon(null);
          setOldCoupon(data);
          trackEvent?.('checkout_coupon_error', eventDetails);
          return;
        }

        if (!validateCouponRules(data)) {
          if (!(itemsQuantity >= data.min_items)) {
            toast.warning(
              `Cupom válido para compras de no mínimo de ${data.min_items} itens`,
              {
                position: 'top-right',
              }
            );
          }

          if (!(priceTotal >= data.min_amount)) {
            toast.warning(
              `Cupom válido para compras de no mínimo R$${Number(
                data.min_amount
              ).toLocaleString('pt-br', {
                currency: 'BRL',
                style: 'currency',
              })}`,
              {
                position: 'top-right',
              }
            );
          }

          setError(true);
          setSuccess(false);
          setCoupon(null);
          trackEvent?.('checkout_coupon_error', eventDetails);
          return;
        }

        setSuccess(true);
        setError(false);
        setCoupon({ ...data });
        setOldCoupon(data);
        trackEvent?.('checkout_coupon_applied', eventDetails);

        if (couponCode) {
          toast.success(`Cupom "${couponCode}" aplicado com sucesso!`, {
            position: 'top-right',
          });
        }
      })
      .catch(() => {
        setError(true);
        setSuccess(false);
        setCoupon(null);
        trackEvent?.('checkout_coupon_error', eventDetails);
      });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (!value.trim()) {
      resetCoupon();
    }
  };

  useEffect(() => {
    if (cupom) {
      setInputValue(cupom);
    }
  }, []);

  useEffect(() => {
    if (confirmAction && coupon) {
      setInputValue(coupon.coupon);
      applyCoupon(coupon.coupon);
      setConfirmAction(false);
    }
  }, [confirmAction, coupon]);

  useEffect(() => {
    if (oldCoupon) {
      if (!oldCoupon.payment_methods.includes(paymentMethod)) {
        setCoupon(null);
        setError(true);
        setSuccess(false);
      } else {
        setCoupon(oldCoupon);
        setError(false);
        setSuccess(true);
      }
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (coupon && !validateCouponRules(coupon)) {
      setCoupon(null);
      setError(true);
      setSuccess(false);
    }
  }, [itemsQuantity, priceTotal, coupon]);

  useEffect(() => {
    if (inputValue && cpf?.replace(/[^\d]/g, '').length === 11) {
      applyCoupon(inputValue);
    }
  }, [cpf]);

  useEffect(() => {
    if (
      cupom &&
      cpf &&
      cpf.replace(/[^\d]/g, '').length === 11 &&
      priceTotal > 0 &&
      itemsQuantity > 0 &&
      !coupon &&
      !success
    ) {
      applyCoupon(cupom);
    }
  }, [cupom, cpf, priceTotal, itemsQuantity, coupon, success]);

  return (
    <>
      {offer.hasActiveCoupon && (
        <form
          style={{ width: '100%', margin: 0, padding: 0 }}
          onSubmit={(e) => {
            e.preventDefault();
            applyCoupon(inputValue);
          }}
        >
          <div className='input-group'>
            <div className='d-flex area'>
              <label htmlFor='test'>
                <i className='las la-tags'></i>
              </label>
              <input
                id='coupon3steps'
                type='text'
                name='coupon'
                className='form-control'
                placeholder='Cupom de desconto'
                defaultValue={cupom}
                value={inputValue}
                onChange={handleInputChange}
              />
              <button
                className='btn btn-primary coupon-btn p-0 pl-3 pr-3'
                onClick={(e) => {
                  e.preventDefault();
                  applyCoupon(inputValue);
                }}
              >
                Aplicar
              </button>
            </div>
            {success && <div className='input-success'>Cupom aplicado</div>}
            {error && userAttempted && (
              <div className='input-error'>Cupom inválido</div>
            )}
          </div>
        </form>
      )}
    </>
  );
};

export default Coupon;

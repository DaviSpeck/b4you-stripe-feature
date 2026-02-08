import { currency } from 'functions';
import './OrderBump3Steps.scss';
import { useEffect, useRef } from 'react';

const OrderBump = ({
  offer,
  products,
  selectedBumps,
  setSelectedBumps,
  updateQuantity,
  paymentMethod,
  trackEvent,
}) => {
  const viewedRef = useRef(false);
  const selectBump = (item, assignment) => {
    let prevSelectedBumps = [...selectedBumps];

    if (!item.show_quantity) {
      const isItemInArray = prevSelectedBumps.find(
        (bump) => bump.uuid === item.uuid
      );
      if (isItemInArray) {
        setSelectedBumps(
          selectedBumps.filter((value) => {
            return value.uuid !== item.uuid;
          })
        );
      } else {
        setSelectedBumps([...prevSelectedBumps, item]);
      }
    }

    if (item.show_quantity) {
      if (assignment === '+') {
        setSelectedBumps([...prevSelectedBumps, item]);
      }
      if (assignment === '-') {
        if (item.quantity > 0) {
          const isItemInArray = prevSelectedBumps.find(
            (bump) => bump.uuid === item.uuid
          );

          if (isItemInArray) {
            setSelectedBumps([...prevSelectedBumps, item]);
          } else {
            setSelectedBumps(
              selectedBumps.filter((value) => {
                return value.uuid !== item.uuid;
              })
            );
          }
        } else {
          setSelectedBumps(
            selectedBumps.filter((value) => {
              return value.uuid !== item.uuid;
            })
          );
        }
      }
    }
  };

  useEffect(() => {
    if (!viewedRef.current && products.length > 0) {
      trackEvent?.('checkout_order_bump_viewed', { step: 'payment' });
      viewedRef.current = true;
    }

    const validBumps = selectedBumps.filter(bump => {
      const isSubscription = bump.payment_type === 'subscription';
      const isBillet = paymentMethod === 'billet';
      const isDisabled = isSubscription && isBillet;
      return !isDisabled;
    });
    if (validBumps.length !== selectedBumps.length) {
      setSelectedBumps(validBumps);
      products.forEach((product, index) => {
        const isSubscription = product.payment_type === 'subscription';
        const isBillet = paymentMethod === 'billet';
        if (isSubscription && isBillet) {
          if (product.quantity > 0) {
            updateQuantity(index, -product.quantity);
          }
        }
      });
    }
  }, [paymentMethod, products, selectedBumps, setSelectedBumps, updateQuantity]);

  return (
    <>
      <section id='order-bump3steps' className='order-bump3steps'>
        <div className='card-head'>
          {products.length === 1
            ? products[0]?.title || 'Oferta especial separada para você!'
            : products[0]?.title || 'Ofertas especiais separadas para você!'}
        </div>
        <div className='bump-list'>
          {products.map((item, index) => {
            const isSubscription = item.payment_type === 'subscription';
            const isPixOrBillet = paymentMethod === 'billet';
            const isDisabled = isSubscription && isPixOrBillet;
            return (
              <div className={`bump ${isDisabled ? 'disabled' : ''}`} key={item.uuid}>
                {item.show_quantity ? (
                  <label
                    htmlFor={`order-bump-${index}`}
                    className={`label-info ${isDisabled ? 'disabled' : ''}`}
                  >
                    <div className='d-flex flex-wrap ob-physical3steps'>
                      <div className='d-flex w-100'>
                        {offer?.customizations?.show_custom_image === 'true' &&
                          item.alternative_image ? (
                          <>
                            <img
                              src={item.alternative_image}
                              alt='Custom Image'
                            />
                          </>
                        ) : (
                          (item.cover || item.product.cover) && (
                            <div
                              style={{
                                width: '100%',
                                height: '150px',
                                marginTop: '20px',
                                marginBottom: '20px',
                              }}
                            >
                              <img
                                src={item?.cover || item?.product?.cover}
                                alt='Ob Image'
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  maxHeight: '200px',
                                  borderRadius: '8px',
                                }}
                              />
                            </div>
                          )
                        )}
                        <div className='description'>
                          <div className='text'>
                            <b className='mr-1'>
                              {item?.product_name || item.product.name}
                            </b>
                            <span>- {item.label}</span>
                          </div>
                          <div
                            className='price'
                            style={{ textAlign: 'center' }}
                          >
                            {item.price_before && (
                              <span className='before-price'>
                                de <span>{currency(item.price_before)}</span>
                              </span>
                            )}
                            <span className='current-price'>
                              {' '}
                              por <span>{currency(item.price)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='select-product select-product-physical'>
                        <div className='quantity'>
                          <button
                            className='quantity-button'
                            disabled={!item.quantity || isDisabled}
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.quantity === 1) {
                                trackEvent?.('checkout_order_bump_declined', {
                                  step: 'payment',
                                });
                              }
                              updateQuantity(index, -1);
                              selectBump(item, '-');
                            }}
                          >
                            -
                          </button>
                          <div className='quantity-number'>{item.quantity}</div>
                          <button
                            className='quantity-button'
                            disabled={
                              isDisabled ||
                              (item?.max_quantity
                                ? item.quantity == item.max_quantity
                                : false)
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.quantity === 0) {
                                trackEvent?.('checkout_order_bump_accepted', {
                                  step: 'payment',
                                });
                              }
                              updateQuantity(index, +1);
                              selectBump(item, '+');
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </label>
                ) : (
                  <label
                    htmlFor={`order-bump-${index}`}
                    className={`label-info ${isDisabled ? 'disabled' : ''}`}
                  >
                    <div className='d-flex flex-wrap ob-info3steps'>
                      <div className='d-flex w-100'>
                        <div className='text'>
                          <b className='mr-1'>
                            {item?.product_name || item.product.name}
                          </b>
                          <span>- {item.label}</span>
                        </div>
                        {offer?.customizations?.show_custom_image === 'true' &&
                          item.alternative_image ? (
                          <>
                            <img
                              src={item.alternative_image}
                              alt='Custom Image'
                            />
                          </>
                        ) : (
                          (item.cover || item.product.cover) && (
                            <div
                              style={{
                                width: '100%',
                                height: '150px',
                                marginTop: '20px',
                                marginBottom: '20px',
                              }}
                            >
                              <img
                                src={item?.cover || item?.product?.cover}
                                alt='Ob Image'
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  maxHeight: '200px',
                                  borderRadius: '8px',
                                }}
                              />
                            </div>
                          )
                        )}
                        <div
                          className='w-100 description center'
                          style={{ textAlign: 'center' }}
                        >
                          <div
                            className='price'
                            style={{ textAlign: 'center' }}
                          >
                            {item.price_before && (
                              <span className='before-price'>
                                de <span>{currency(item.price_before)}</span>
                              </span>
                            )}
                            <span className='current-price'>
                              {' '}
                              por <span>{currency(item.price)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='select-product'>
                      <input
                        id={`order-bump-${index}`}
                        type='checkbox'
                        disabled={isDisabled}
                        checked={!!selectedBumps.find((bump) => bump.uuid === item.uuid)}
                        onChange={() => {
                          const isSelected = selectedBumps.find(
                            (bump) => bump.uuid === item.uuid
                          );
                          trackEvent?.(
                            isSelected
                              ? 'checkout_order_bump_declined'
                              : 'checkout_order_bump_accepted',
                            { step: 'payment' }
                          );
                          updateQuantity(
                            index,
                            selectedBumps.find((bump) => bump.uuid === item.uuid) ? -1 : +1
                          );
                          selectBump(item);
                        }}
                      />
                      <span
                        className={`custom-check ${selectedBumps.find((bump) => bump.uuid === item.uuid) ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}`}
                      >
                        {isDisabled ? (
                          <i className='las la-times text-danger fs-5' />
                        ) : (
                          <>
                            <i className='las la-hand-point-right hand' />
                            <i className='las la-check checky' />
                          </>
                        )}
                      </span>
                    </div>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default OrderBump;

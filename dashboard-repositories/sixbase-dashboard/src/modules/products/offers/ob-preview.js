import { useState } from 'react';
import ProductSrc from '../../../images/produto-sem-foto.jpg';
import { currency } from '../../functions';
import './order-bump.scss';

const ObPreview = ({
  price_before = 0,
  price = 0,
  label = 'Seu Título',
  title,
  productName = 'Nome do produto',
  productCover,
  maxQuantity,
  showQuantity = false,
}) => {
  const [checked, setChecked] = useState(false);
  const [quantity, setQuantity] = useState(0);

  return (
    <section id='order-bump'>
      <div className='card-head'>{title}</div>

      <div className='bump-list'>
        <div onClick={() => setChecked(!checked)}>
          <label className='w-100' htmlFor='order-bump-1'>
            <div className='bump-card'>
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  marginTop: '20px',
                }}
              >
                <img
                  src={productCover || ProductSrc}
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                  }}
                />
              </div>

              <div className='bump'>
                {showQuantity ? (
                  <div>
                    <div className='description w-100'>
                      <div className='text'>
                        <b className='mr-1'>{productName}</b>
                        <span>- {label}</span>
                      </div>
                      <div className='price'>
                        {price_before && (
                          <span className='before'>
                            de <span>{currency(price_before)}</span>
                          </span>
                        )}
                        <span>
                          {' '}
                          por <span>{currency(price)}</span>
                        </span>
                      </div>
                    </div>
                    <div className='select-product'>
                      <div className='quantity'>
                        <button
                          className='quantity-button'
                          disabled={!quantity}
                          onClick={(e) => {
                            e.preventDefault();
                            setQuantity((prev) => Math.max(0, prev - 1));
                          }}
                        >
                          -
                        </button>
                        <div className='quantity-number'>{quantity}</div>
                        <button
                          className='quantity-button'
                          onClick={(e) => {
                            e.preventDefault();

                            if (!maxQuantity) {
                              setQuantity((prev) => prev + 1);
                            } else {
                              if (maxQuantity < 0) return;

                              setQuantity((prev) =>
                                Math.min(maxQuantity, prev + 1)
                              );
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      className={
                        !checked ? 'custom-check' : 'custom-check checked'
                      }
                    >
                      <i className='las la-hand-point-right hand'></i>
                      <i className='las la-check checky'></i>
                    </span>

                    <div className='description'>
                      <div className='text'>
                        <b className='mr-1'>{productName}</b>
                        <span>- {label}</span>
                      </div>
                      <div className='price'>
                        {price_before && (
                          <span className='before'>
                            de <span>{currency(price_before)}</span>
                          </span>
                        )}
                        <span>
                          {' '}
                          por <span>{currency(price)}</span>
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
};

export default ObPreview;

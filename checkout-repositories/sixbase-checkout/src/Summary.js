import { currency } from 'functions';
import React from 'react';
import { Card } from 'react-bootstrap';
import { TurnstileChallenge } from './shared/Turnstile';
import { calcSummary } from 'SummaryHelpers';

const Summary = ({
  offer,
  product,
  discounts,
  paymentMethod,
  totalPrice,
  orderBumps,
  selectedPlan,
  coupon,
  processedBy,
  installmentsList,
  currentInstallment,
  handleToken,
  displayChallenge,
  shippingChanged,
  selectedShipping,
  hasFrenet,
}) => {
  const shippingCost =
    offer.shipping_type === 0 || !!coupon?.free_shipping
      ? 0
      : hasFrenet
      ? selectedShipping?.price ?? 0
      : offer.shipping_price;
  const { totalPriceFinal, subTotal } = calcSummary(
    orderBumps,
    totalPrice,
    paymentMethod,
    coupon,
    offer,
    shippingCost
  );

  return (
    <Card className='p-3 mt-2'>
      <div className='summary'>
        <div className='title-1'>Resumo da compra</div>
        <ul>
          <li className='item'>
            <div className='d-flex w-100 justify-content-between'>
              <div className='product'>
                <span>
                  {offer.offer.alternative_name
                    ? offer.offer.alternative_name
                    : offer.offer.name}
                </span>
              </div>

              <span className='payment-details'>
                {offer.price
                  ? currency(offer.price)
                  : `${currency(selectedPlan?.price || 0)} / ${
                      selectedPlan?.frequency_label || ''
                    }`}
              </span>
            </div>

            <div className='d-flex w-100 justify-content-between'>
              <div
                className='quantity-small'
                style={{
                  textAlign: 'start',
                }}
              >
                {offer.description ? offer.description : ''}
              </div>

              {offer.quantity > 1 && (
                <div className='quantity-small'>
                  Quantidade: {offer.quantity}
                </div>
              )}
            </div>
          </li>

          {orderBumps.map((item) => {
            return (
              <React.Fragment key={item.uuid}>
                {item.quantity > 0 && (
                  <>
                    {item.product.type === 'physical' ? (
                      <li className='item'>
                        <div className='d-flex w-100 justify-content-between align-items-center'>
                          <div className='product'>
                            <span className='title m-0'>
                              {item?.product_name || item.product.name}
                            </span>
                          </div>
                          <div>
                            <span className='payment-details'>
                              {currency(item.price * item.quantity)}
                            </span>
                            <div className='ml-auto'>
                              <div className='quantity-small'>
                                Quantidade: {item.quantity}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ) : (
                      <li className='item'>
                        <div className='d-flex w-100 justify-content-between align-items-center'>
                          <div className='product'>
                            <span className='title m-0'>
                              {item?.product_name || item.product.name}
                            </span>
                          </div>
                          <span className='payment-details'>
                            {currency(item.price)}
                          </span>
                        </div>
                      </li>
                    )}
                  </>
                )}
              </React.Fragment>
            );
          })}
        </ul>
      </div>
      {discounts && discounts[paymentMethod] > 0 && (
        <>
          <div className='subtotal-box'>
            <span>Sub-total</span>
            <span className='text-decoration-line-through'>
              {currency(totalPrice)}
            </span>
          </div>
          <div className='discount-box'>
            <span>Desconto de {discounts[paymentMethod]}%</span>
            <span>{currency(subTotal * (discounts[paymentMethod] / 100))}</span>
          </div>
        </>
      )}
      {coupon && (
        <div className='discount-box'>
          <span>
            Cupom de{' '}
            {coupon.percentage > 0
              ? `${coupon.percentage}%`
              : `${currency(coupon.amount)}`}
          </span>
          <span>
            {currency(
              coupon.percentage > 0
                ? subTotal * (coupon.percentage / 100)
                : coupon.amount
            )}
          </span>
        </div>
      )}
      {product.type === 'physical' && (
        <>
          <div className='subtotal-box'>
            <span className='title title-shipping'>Frete</span>
            {hasFrenet ? (
              selectedShipping ? (
                <span>+ {currency(selectedShipping.price)}</span>
              ) : (
                <span>---</span>
              )
            ) : offer.shipping_type === 0 || !!coupon?.free_shipping ? (
              <span>GRÁTIS</span>
            ) : offer.shipping_type !== 0 &&
              offer.shipping_by_region &&
              Object.keys(offer.shipping_by_region).length !== 0 &&
              !shippingChanged ? (
              <span>A Calcular</span>
            ) : (
              <span>+ {currency(offer.shipping_price)}</span>
            )}
          </div>

          <div className='frete-quantity-small'>
            {offer.shipping_text ? offer.shipping_text : ''}
          </div>
        </>
      )}
      <div className='total-box'>
        <div className='title'>Total</div>
        {paymentMethod === 'card' ? (
          <>
            {currentInstallment == 1 ? (
              <div className='installment-price'>
                {currency(totalPriceFinal)} à vista
              </div>
            ) : (
              <>
                <div className='installment-price'>
                  {installmentsList.length > 0 &&
                    (currentInstallment ||
                      installmentsList[installmentsList.length - 1].n)}
                  x de{' '}
                  {installmentsList.length > 0 &&
                    (currentInstallment
                      ? currency(
                          installmentsList[currentInstallment - 1]?.price
                        )
                      : currency(
                          installmentsList[installmentsList.length - 1]?.price
                        ))}
                  {offer.payment.student_pays_interest ? '*' : ' sem juros'}
                </div>
                <div className='payment-details payment-details-last'>
                  Ou {currency(totalPriceFinal)} à vista
                </div>
              </>
            )}
          </>
        ) : (
          <div className='installment-price'>
            {currency(totalPriceFinal)} à vista
          </div>
        )}
      </div>
      <div>
        {product && (
          <div className='footer'>
            {' '}
            <div>
              <div className='text-center'>
                <p>
                  Esse site é protegido pelo reCAPTCHA do Google
                  <div>
                    {/*
                    <a
                      href='https://blog.b4you.com.br/wp-content/uploads/2023/08/B4you-Poli%CC%81tica-de-Privacidade-do-Site.pdf'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Política de Privacidade
                    </a>{' '}
                    e */}
                    <a
                      href='https://b4you.com.br/termos'
                      target='_blank'
                      rel='noreferrer'
                    >
                      Termos de Uso
                    </a>
                  </div>
                </p>
              </div>
              {/*<p className='mb-0 text-center'>
                {offer.payment.student_pays_interest
                  ? '*Parcelamento com acréscimo.'
                  : ''}{' '}
                Ao prosseguir você concorda com a{' '}
                <a
                  href='https://blog.b4you.com.br/wp-content/uploads/2025/06/B4you-Politica-de-Pagamento.pdf'
                  target='_blank'
                  rel='noreferrer'
                >
                  Política de Pagamento
                </a>
              </p> */}
            </div>
            <div className='d-flex justify-content-center'>
              <TurnstileChallenge
                isOpen={displayChallenge}
                siteKey={offer.site_key}
                onSuccess={handleToken}
                onExpire={() => handleToken('')}
              />
            </div>
            {processedBy && (
              <div>
                <b>B4you</b> está processando esta venda, ao continuar, você
                concorda com os <a href='#'>Termos de Compra</a>. Todos os
                direitos reservados. Referência de oferta:
                {' ' + uuidOffer}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Summary;

import { currency } from 'functions';
import { useEffect, useState } from 'react';
import { calcSummary } from 'SummaryHelpers';
import ProductNoImg from '../images/produto-sem-foto.jpg';
import { ReactComponent as CartIcon } from '../styles/cart.svg';
import styles from './Summary3Steps.module.css';
import Plans from 'Plans';

export function Summary3Steps({
  offer,
  product,
  productBumps,
  paymentMethod,
  totalPrice,
  orderBumps,
  coupon,
  cupom,
  currentInstallment,
  installmentsList,
  couponComponent,
  isMobile,
  shippingChanged,
  selectedShipping,
  hasFrenet,
  setCoupon,
  plans,
  setSelectedPlan,
  selectedPlan,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const shippingCost =
    offer.shipping_type === 0 || !!coupon?.free_shipping
      ? 0
      : hasFrenet
        ? parseFloat(selectedShipping?.price ?? 0)
        : Number(offer.shipping_price || 0);

  const { totalPriceFinal, subTotal } = calcSummary(
    orderBumps,
    totalPrice,
    paymentMethod,
    coupon,
    offer,
    shippingCost
  );

  let offerName = '';
  let offerCover = '';

  if (product && product.cover) {
    offerCover = product.cover;
  }

  if (offer && offer.offer && offer.offer.name) {
    if (offer.offerShopify && Array.isArray(offer.offerShopify)) {
      const items = offer.offerShopify;
      offerName = items.map((item, index) => (
        <>
          <div className={styles.container} key={index}>
            <div className={styles.imageplaceholder}>
              <img
                src={item.image}
                alt='image3I317'
                className={styles.image3}
              />
            </div>
            <div key={index} className={styles.item}>
              <div className={styles.offerName}>{item.title}</div>
              <div>
                <span className={styles.qtd}> Qtd: {item.quantity}</span>{' '}
                {currency(item.price)}
              </div>
            </div>
          </div>
        </>
      ));
    } else if (offer.offer.name) {
      offerName = (
        <>
          <div className={styles.container}>
            <div className={styles.imageplaceholder}>
              {offer?.customizations?.show_custom_image === 'true' &&
                offer?.customizations?.alternative_image ? (
                <>
                  <img
                    src={offer.customizations.alternative_image}
                    alt='Custom Image'
                    className={styles.image3}
                  />
                </>
              ) : offer?.customizations?.show_custom_image === 'false' ? (
                <>
                  <img
                    src={offerCover}
                    alt='image3I318'
                    className={styles.image3}
                  />
                </>
              ) : (
                <>
                  <img
                    src={offerCover}
                    alt='Default Image'
                    className={styles.image3}
                  />
                </>
              )}
            </div>
            <div className={styles.item}>
              {offer.customizations &&
                offer.customizations.show_alt_name === 'true' &&
                offer?.customizations?.alternative_name ? (
                <span className={styles.title}>
                  {offer.customizations.alternative_name}
                </span>
              ) : !offer?.customizations?.show_alt_name ? (
                <span className={styles.title}>{offer.offer.name}</span>
              ) : (
                <span className={styles.title}>{offer.offer.name}</span>
              )}
            </div>
          </div>
          {productBumps &&
            productBumps.length > 0 &&
            productBumps.map(
              (bump, index) =>
                bump.product &&
                bump.product.name && (
                  <div key={index} className={styles.container}>
                    <div className={styles.imageplaceholder}>
                      <img
                        src={bump.cover || bump.product.cover || ProductNoImg}
                        alt={`image-${index}`}
                        className={styles.image3}
                      />
                    </div>
                    <div className={styles.item}>
                      <span className={styles.title}>{bump.product.name}</span>
                      <span className={styles.qtd}>Qtd: {bump.quantity}</span>
                    </div>
                  </div>
                )
            )}
        </>
      );
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const hexColor = offer.checkout.hex_color
    ? offer.checkout.hex_color
    : 'var(--hex-color, rgba(248, 107, 134, 1))';

  useEffect(() => {
    if (cupom) {
      setCoupon(cupom);
    }
  }, []);

  if (offer.payment.plans.length > 0) {
    return (
      <div className='frame1-frame372601' style={{ '--hex-color': hexColor }}>
        <div className={styles.frame372544} style={{ '--hex-color': hexColor }}>
          <CartIcon style={{ stroke: hexColor }} />
          <span className={styles.text52}>
            <span>Resumo</span>
          </span>
        </div>
        <Plans.ThreeSteps
          isMessageDiscount={offer.is_plan_discount_message}
          checkout={offer.checkout}
          plans={plans}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          offer={offer}
        />
        {couponComponent}
        <Summary3Steps.Total
          product={product}
          offer={offer}
          coupon={coupon}
          hasFrenet={hasFrenet}
          totalPrice={totalPrice}
          paymentMethod={paymentMethod}
          totalPriceFinal={totalPriceFinal}
          shippingChanged={shippingChanged}
          installmentsList={installmentsList}
          selectedShipping={selectedShipping}
          currentInstallment={currentInstallment}
        />
      </div>
    );
  }

  return (
    <>
      <div className='frame1-frame372601' style={{ '--hex-color': hexColor }}>
        <div className={styles.frame372544} style={{ '--hex-color': hexColor }}>
          <CartIcon style={{ stroke: hexColor }} />

          <span className={styles.text52}>
            <span>Resumo</span>
          </span>
          {isMobile && (
            <img
              src={'/external/down-arrow.png'}
              alt='toggle arrow'
              className={styles.arrow}
              onClick={toggleExpand}
            />
          )}
        </div>

        <span
          className={styles.text11}
          style={{ display: isExpanded ? 'none' : '' }}
        >
          Informações da sua compra
        </span>

        <div
          className={styles.frameNotExpanded}
          style={{ display: isExpanded ? 'none' : '' }}
        >
          <span className={styles.textTotal}>
            <span>Total</span>
          </span>
          <div className={styles.frame531}>
            <span className={styles.text76}>
              <span>{currency(totalPriceFinal)}</span>
            </span>
          </div>
        </div>

        <div
          className={styles.cart}
          style={{ display: isExpanded ? '' : 'none' }}
        >
          <div className={styles.frame37261}>
            <span className={styles.text54}>{offerName}</span>

            {offer.customizations &&
              offer.customizations.show_custom_description === 'true' && (
                <span className={styles.text11}>{offer.description}</span>
              )}

            <div className={styles.frame37262}>
              <div className={styles.frame47}>
                <>
                  {totalPrice > totalPriceFinal ? (
                    <>
                      <span className={styles.text56}>
                        <span className={styles.text57}>
                          De:
                          <span
                            dangerouslySetInnerHTML={{
                              __html: ' ',
                            }}
                          />
                        </span>
                        <span>{currency(totalPrice)}</span>
                      </span>
                      <span className={styles.text59}>
                        <span>
                          Por: {currency(totalPriceFinal)}{' '}
                          {coupon && (
                            <div className='discount-box'>
                              <span>
                                Cupom de{' '}
                                {coupon.percentage > 0
                                  ? `${coupon.percentage}%`
                                  : `${currency(coupon.amount)}`}
                              </span>
                            </div>
                          )}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      {coupon && (
                        <div className={styles.text59}>
                          <span>
                            Cupom de{' '}
                            {coupon.percentage > 0
                              ? `${coupon.percentage}% `
                              : `${currency(coupon.amount)}`}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {/* {totalDiscounts > 0 && ( */}
                  {/*   <> */}
                  {/*     <span className={styles.text59}> */}
                  {/*       <span>Desconto: {totalDiscounts}%</span> */}
                  {/*     </span> */}
                  {/*   </> */}
                  {/* )} */}
                </>

                {isMobile && product.type === 'physical' && (
                  <>
                    <div className={styles.frame37271}>
                      <span className={styles.text74}>
                        <span>Produtos</span>
                      </span>
                      <div className={styles.frame531}>
                        <span className={styles.text74}>
                          <span>{currency(subTotal)}</span>
                        </span>
                      </div>
                    </div>
                    <div className={styles.frame37271}>
                      <span className={styles.text74}>
                        <span>Frete</span>
                      </span>
                      <div className={styles.text74}>
                        {hasFrenet ? (
                          !!coupon?.free_shipping ? (
                            <span>GRÁTIS</span>
                          ) : selectedShipping ? (
                            <span>+ {currency(selectedShipping.price)}</span>
                          ) : (
                            <span>---</span>
                          )
                        ) : offer.shipping_type === 0 ||
                          (!!coupon?.free_shipping) ? (
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
                    </div>
                    {offer.customizations &&
                      offer.customizations.show_shipping_text === 'true' && (
                        <span className={styles.text11}>
                          {offer.customizations.shipping_text}
                        </span>
                      )}
                    {/* {totalDiscounts > 0 && ( */}
                    {/*   <> */}
                    {/*     <div className={styles.frame37271}> */}
                    {/*       <span className={styles.text74}> */}
                    {/*         <span>Desconto</span> */}
                    {/*       </span> */}
                    {/*       <div className={styles.frame531}> */}
                    {/*         <span className={styles.text76}> */}
                    {/*           <span>{totalDiscounts}%</span> */}
                    {/*         </span> */}
                    {/*       </div> */}
                    {/*     </div> */}
                    {/*   </> */}
                    {/* )} */}
                    <div className={styles.frame37271}>
                      <span className={styles.textTotal}>
                        <span>Total</span>
                      </span>
                      <div className={styles.frame531}>
                        {offer.customizations.exibition_type === '1' && (
                          <>
                            {currentInstallment === 1 ||
                              paymentMethod === 'pix' ||
                              paymentMethod === 'billet' ? (
                              <div className={styles.text82}>
                                <span>{currency(totalPriceFinal)}</span>
                              </div>
                            ) : (
                              <>
                                <span>
                                  <span className={styles.text78}>
                                    Em até{' '}
                                    {offer?.customizations
                                      ?.show_max_installments
                                      ? installmentsList.length
                                      : currentInstallment}
                                    x de{' '}
                                    <span className={styles.text76}>
                                      {installmentsList.length > 0 &&
                                        (offer?.customizations
                                          ?.show_max_installments
                                          ? currency(
                                            installmentsList[
                                              installmentsList.length - 1
                                            ].price
                                          )
                                          : currentInstallment
                                            ? currency(
                                              installmentsList[
                                                currentInstallment - 1
                                              ].price
                                            )
                                            : currency(
                                              installmentsList[
                                                installmentsList.length - 1
                                              ].price
                                            ))}
                                    </span>
                                  </span>
                                </span>
                              </>
                            )}
                          </>
                        )}

                        {offer.customizations.exibition_type === '2' && (
                          <>
                            <span className={styles.text82}>
                              {currentInstallment == 1 ||
                                paymentMethod === 'pix' ||
                                paymentMethod === 'billet' ? (
                                <div className={styles.text82}>
                                  <span>{currency(totalPriceFinal)}</span>
                                </div>
                              ) : (
                                <>
                                  <div className={styles.text82}>
                                    {installmentsList.length > 0 &&
                                      (currentInstallment ||
                                        installmentsList[
                                          installmentsList.length - 1
                                        ].n)}
                                    x de{' '}
                                    {installmentsList.length > 0 &&
                                      (currentInstallment
                                        ? currency(
                                          installmentsList[
                                            currentInstallment - 1
                                          ].price
                                        )
                                        : currency(
                                          installmentsList[
                                            installmentsList.length - 1
                                          ].price
                                        ))}
                                    {offer.payment.student_pays_interest
                                      ? '*'
                                      : ' sem juros'}
                                  </div>
                                </>
                              )}
                            </span>
                          </>
                        )}
                        {offer.customizations.exibition_type === '3' && (
                          <>
                            <span>
                              <span className={styles.text78}>
                                Parcelas de{' '}
                                {installmentsList.length > 0 &&
                                  (currentInstallment
                                    ? currency(
                                      installmentsList[currentInstallment - 1]
                                        .price
                                    )
                                    : currency(
                                      installmentsList[
                                        installmentsList.length - 1
                                      ].price
                                    ))}{' '}
                              </span>
                            </span>
                          </>
                        )}
                        {offer.customizations.exibition_type === '4' && (
                          <>
                            {paymentMethod === 'card' ? (
                              <>
                                {currentInstallment == 1 ? (
                                  <div className={styles.text82}>
                                    {currency(totalPriceFinal)} à vista
                                  </div>
                                ) : (
                                  <>
                                    <div className={styles.text82}>
                                      {installmentsList.length > 0 &&
                                        (currentInstallment ||
                                          installmentsList[
                                            installmentsList.length - 1
                                          ].n)}
                                      x de{' '}
                                      {installmentsList.length > 0 &&
                                        (currentInstallment
                                          ? currency(
                                            installmentsList[
                                              currentInstallment - 1
                                            ].price
                                          )
                                          : currency(
                                            installmentsList[
                                              installmentsList.length - 1
                                            ].price
                                          ))}
                                      <div className={styles.text76}>
                                        * Ou {currency(totalPriceFinal)} à vista
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            ) : (
                              <div className={styles.text82}>
                                {currency(totalPriceFinal)} à vista
                              </div>
                            )}
                          </>
                        )}
                        {!offer?.customizations?.exibition_type && (
                          <>
                            <span className={styles.text82}>
                              {currentInstallment == 1 ||
                                paymentMethod === 'pix' ||
                                paymentMethod === 'billet' ? (
                                <div className={styles.text82}>
                                  <span>{currency(totalPriceFinal)}</span>
                                </div>
                              ) : (
                                <>
                                  <div className={styles.text82}>
                                    {installmentsList.length > 0 &&
                                      (currentInstallment ||
                                        installmentsList[
                                          installmentsList.length - 1
                                        ].n)}
                                    x de{' '}
                                    {installmentsList.length > 0 &&
                                      (currentInstallment
                                        ? currency(
                                          installmentsList[
                                            currentInstallment - 1
                                          ].price
                                        )
                                        : currency(
                                          installmentsList[
                                            installmentsList.length - 1
                                          ].price
                                        ))}
                                    {offer.payment.student_pays_interest
                                      ? '*'
                                      : ' sem juros'}
                                  </div>
                                </>
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {isMobile && product.type !== 'physical' && (
                  <>
                    <div className={styles.frame37271}>
                      <span className={styles.text74}>
                        <span>Total</span>
                      </span>
                      <div className={styles.frame531}>
                        <span className={styles.text76}>
                          <span>{currency(totalPriceFinal)} </span>
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.inputwithlabel4}>
          {!isMobile && (
            <span className={styles.text62TextsmMedium}>
              {offer.hasActiveCoupon && <span>Tem cupom?</span>}
            </span>
          )}
          <div
            className={styles.frame37263}
            style={{ display: isExpanded ? '' : 'none' }}
          >
            {couponComponent}
          </div>
        </div>

        {!isMobile && (
          <Summary3Steps.Total
            offer={offer}
            product={product}
            coupon={coupon}
            hasFrenet={hasFrenet}
            totalPrice={totalPrice}
            paymentMethod={paymentMethod}
            totalPriceFinal={totalPriceFinal}
            shippingChanged={shippingChanged}
            installmentsList={installmentsList}
            selectedShipping={selectedShipping}
            currentInstallment={currentInstallment}
          />
        )}
      </div>
    </>
  );
}

// eslint-disable-next-line react/display-name
Summary3Steps.Total = function (props) {
  const {
    offer,
    coupon,
    product,
    hasFrenet,
    totalPrice,
    paymentMethod,
    totalPriceFinal,
    shippingChanged,
    installmentsList,
    selectedShipping,
    currentInstallment,
  } = props;
  const getInstallmentPrice = () => {
    if (!installmentsList || installmentsList.length === 0) return null;

    if (offer?.customizations?.show_max_installments) {
      return currency(
        installmentsList[installmentsList.length - 1].price
      );
    }

    if (currentInstallment) {
      return currency(
        installmentsList[currentInstallment - 1]?.price ??
        installmentsList[0].price
      );
    }

    return currency(
      installmentsList[installmentsList.length - 1].price
    );
  };

  return (
    <div className={styles.frame54}>
      <>
        <div className={styles.frame37269}>
          <span className={styles.text68}>
            <span>Subtotal</span>
          </span>
          <div className={styles.frame53}>
            <span className={styles.text70} />
            <span className={styles.text72}>
              <span>{currency(totalPrice)}</span>
            </span>
          </div>
        </div>
        <img
          src='/external/line1i317-6sz5.svg'
          alt='Line1I317'
          className={styles.line1}
        />
      </>
      {product.type === 'physical' && (
        <>
          <div className={styles.frame37271}>
            <span className={styles.text74}>
              <span>Frete</span>
            </span>
            <div className={styles.frame531}>
              {hasFrenet ? (
                !!coupon?.free_shipping ? (
                  <span>GRÁTIS</span>
                ) : selectedShipping ? (
                  <span>+ {currency(selectedShipping.price)}</span>
                ) : (
                  <span>---</span>
                )
              ) : offer.shipping_type === 0 ||
                (!!coupon?.free_shipping) ? (
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
          </div>
          {offer.customizations &&
            offer.customizations.show_shipping_text === 'true' && (
              <span className={styles.text11}>
                {offer.customizations.shipping_text}
              </span>
            )}
          <img
            src='/external/line2i317-n0ln.svg'
            alt='Line2I317'
            className={styles.line2}
          />
        </>
      )}

      <div className={styles.frame37273}>
        <div className={styles.frame37270}>
          <span className={styles.text78}>
            <span>Total:</span>
          </span>
          <div className={styles.frame37272}>
            <div className={styles.frame532}>
              <span className={styles.text80} />
              {offer?.customizations?.exibition_type === '1' && (
                <>
                  {paymentMethod === 'pix' ||
                    paymentMethod === 'billet' ||
                    offer.payment.type === 'subscription' ? (
                    <div className={styles.text82}>
                      <span>{currency(totalPriceFinal)}</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        <span className={styles.text78}>
                          Em até{' '}
                          {offer?.customizations?.show_max_installments
                            ? installmentsList.length
                            : currentInstallment}
                          x de{' '}
                          {getInstallmentPrice() && (
                            <span className={styles.text76}>
                              {getInstallmentPrice()}
                            </span>
                          )}

                        </span>
                      </span>
                    </>
                  )}
                </>
              )}
              {offer?.customizations?.exibition_type === '2' && (
                <>
                  <span className={styles.text82}>
                    {paymentMethod === 'pix' || paymentMethod === 'billet' ? (
                      <div className={styles.text82}>
                        <span>{currency(totalPriceFinal)}</span>
                      </div>
                    ) : (
                      <>
                        <div className={styles.text82}>
                          {installmentsList.length > 0 &&
                            (currentInstallment ||
                              installmentsList[installmentsList.length - 1].n)}
                          x de{' '}
                          {installmentsList.length > 0 &&
                            (currentInstallment
                              ? currency(
                                installmentsList[currentInstallment - 1].price
                              )
                              : currency(
                                installmentsList[installmentsList.length - 1]
                                  .price
                              ))}
                          *
                        </div>
                      </>
                    )}
                  </span>
                </>
              )}
              {offer?.customizations?.exibition_type === '3' && (
                <>
                  <span>
                    Parcelas de{' '}
                    <span className={styles.text76}>
                      {installmentsList.length > 0 &&
                        (currentInstallment
                          ? currency(
                            installmentsList[currentInstallment - 1].price
                          )
                          : currency(
                            installmentsList[installmentsList.length - 1]
                              .price
                          ))}
                    </span>
                  </span>
                </>
              )}
              {offer?.customizations?.exibition_type === '4' && (
                <>
                  {paymentMethod === 'card' ? (
                    <>
                      <div className={styles.text82}>
                        {installmentsList.length > 0 &&
                          (currentInstallment ||
                            installmentsList[installmentsList.length - 1].n)}
                        x de{' '}
                        {installmentsList.length > 0 &&
                          (currentInstallment
                            ? currency(
                              installmentsList[currentInstallment - 1].price
                            )
                            : currency(
                              installmentsList[installmentsList.length - 1]
                                .price
                            ))}
                        <div className={styles.text76}>
                          * Ou {currency(totalPriceFinal)} à vista
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.text82}>
                      {currency(totalPriceFinal)} à vista
                    </div>
                  )}
                </>
              )}
              {(!offer?.customizations?.exibition_type ||
                offer?.customizations?.exibition_type === 'NaN' ||
                offer.payment.type === 'subscription') && (
                  <>
                    <span className={styles.text82}>
                      {currentInstallment === 1 ||
                        paymentMethod === 'pix' ||
                        paymentMethod === 'billet' ||
                        offer.payment.type === 'subscription' ? (
                        <div className={styles.text82}>
                          <span>{currency(totalPriceFinal)}</span>
                        </div>
                      ) : (
                        <>
                          <div className={styles.text82}>
                            {installmentsList.length > 0 &&
                              (currentInstallment ||
                                installmentsList[installmentsList.length - 1].n)}
                            x de{' '}
                            {installmentsList.length > 0 &&
                              (currentInstallment
                                ? currency(
                                  installmentsList[currentInstallment - 1]
                                    ?.price
                                )
                                : currency(
                                  installmentsList[installmentsList.length - 1]
                                    ?.price
                                ))}
                            {offer.payment.student_pays_interest
                              ? '*'
                              : ' sem juros'}
                          </div>
                        </>
                      )}
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>

        <span className={styles.text84}>
          {coupon && (
            <div className='discount-box'>
              <span>
                Cupom de{' '}
                {coupon.percentage > 0
                  ? `${coupon.percentage}%`
                  : `${currency(coupon.amount)}`}
              </span>
            </div>
          )}
          <br></br>
          {/*<span>ou 6x R$ 58,50 sem R$ 123,00juros</span>*/}
        </span>
      </div>
    </div>
  );
};

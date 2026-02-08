import { Form } from 'react-bootstrap';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { IoCardOutline } from 'react-icons/io5';
import './style.scss';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from 'api';
import { IoIosCheckmarkCircle } from 'react-icons/io';

export function CardCurrentInformation(props) {
  const [installmentSelect, setInstallmentSelect] = useState(null);

  const {
    creditCardData,
    isSelect,
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
    onError,
    onSelect,
    onProcess,
    onPaymentSucces,
  } = props;

  const { uuidOffer, uuidSaleItem } = useParams();

  async function handlePayment() {
    try {
      onProcess(true);

      await api.post('/sales/process-upsell', {
        offer_id: planSelectUuid
          ? upsellOfferUuid
          : offerSelectUuid ?? uuidOffer,
        sale_item_id: uuidSaleItem,
        installments: Number(installmentSelect),
        payment_method: 'card',
        plan_id: planSelectUuid ?? null,
      });

      onPaymentSucces(true);
      onError(false);
    } catch (error) {
      onError(true);
    } finally {
      onProcess(false);
    }
  }

  useEffect(() => {
    if (!creditCardData) return;
    setInstallmentSelect(creditCardData.default_installment);
  }, [creditCardData]);

  if (!creditCardData?.lastFourDigits) return <div/>;

  return (
    <div className='wrapper-upsell-native-current-card'>
      <div className='wrapper-upsell-native-inputs'>
        <CardCurrentInformation.InputCard
          isSelect={isSelect}
          lastDigits={creditCardData.lastFourDigits}
          onSelect={onSelect}
        >
          <CardCurrentInformation.InstallmentOptions
            studentPaysInterest={creditCardData.studentPaysInterest}
            installments={creditCardData.installments}
            installmentValue={installmentSelect}
            onInstallment={(e) => setInstallmentSelect(e.target.value)}
          />

          <button type='button' onClick={handlePayment}>
            Comprar agora
          </button>
        </CardCurrentInformation.InputCard>
      </div>
    </div>
  );
}

// eslint-disable-next-line react/display-name
CardCurrentInformation.InputCard = function ({
  lastDigits,
  isSelect,
  children,
  onSelect,
}) {
  return (
    <div className='current-card-container'>
      <div className='card-title-wrapper'>
        {isSelect ? (
          <IoIosCheckmarkCircle size={23} color='#020246' />
        ) : (
          <button type='button' onClick={onSelect} />
        )}

        <div className='title-text'>
          <h3 className='text-[0.875rem] font-medium text-[#344054]'>
            Pagar com cartão de crédito
          </h3>
          <p className='text-[0.775rem] font-normal text-[#667085]'>
            Pague agora mesmo com seu cartão já utilizado
          </p>
        </div>
      </div>

      {isSelect && lastDigits && (
        <>
          <div className='wrapper-current-card'>
            <IoCardOutline size={20} />
            <div className='card-number-current'>
              <HiOutlineDotsHorizontal size={30} />
              <HiOutlineDotsHorizontal size={30} />
              <HiOutlineDotsHorizontal size={30} />
              <div>{lastDigits}</div>
            </div>
          </div>

          {children}
        </>
      )}
    </div>
  );
};

// eslint-disable-next-line react/display-name
CardCurrentInformation.InstallmentOptions = function ({
  studentPaysInterest,
  installments,
  installmentValue,
  onInstallment,
}) {
  return (
    <Form.Control
      as='select'
      value={Number(installmentValue)}
      onChange={onInstallment}
      style={{
        fontSize: '0.85rem',
        height: '35px',
      }}
    >
      {installments.map((item) => (
        <option value={item.parcel} key={item.parcel}>
          {item.parcel}x de{' '}
          {Number(item.value.toFixed(2)).toLocaleString('pt-br', {
            currency: 'BRL',
            style: 'currency',
          })}
          {studentPaysInterest && item.parcel > 1 && '*'}
        </option>
      ))}
    </Form.Control>
  );
};

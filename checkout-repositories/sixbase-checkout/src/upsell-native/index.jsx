import { BiSolidCheckShield, BiSolidLock } from 'react-icons/bi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './style.scss';
import { useEffect, useMemo, useState } from 'react';
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import api from 'api';
import { HeaderStep } from './components/header-steps';
import { HeaderText } from './components/header-text';
import { CardMessageNotClose } from './components/card-message-not-close';
import { Title } from './components/title';
import { Subtitle } from './components/subtitle';
import { MediaUpsell } from './components/media-upsell';
import { MultiOffers } from './components/multi-offers';
import { BtnUpsellRefuse } from './components/btn-refuse';
import { BtnBuy } from './components/btn-buy';
import { MultiPlans } from './components/multi-plans';

export function UpsellNative() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔑 Fallback TOTAL (path OU query)
  const uuidOffer =
    params.uuidOffer || searchParams.get('offer_id');

  const uuidSaleItem =
    params.uuidSaleItem || searchParams.get('sale_item_id');

  const [upsellData, setUpsellData] = useState(null);
  const [offerSelected, setOfferSelected] = useState(null);
  const [planSelected, setPlanSelected] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isOneClickLoading, setIsOneClickLoading] = useState(false);

  const canFetch = useMemo(
    () => Boolean(uuidOffer) && Boolean(uuidSaleItem),
    [uuidOffer, uuidSaleItem]
  );

  const getUpsellNativeData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      if (!uuidOffer || !uuidSaleItem) {
        throw new Error('uuidOffer ou uuidSaleItem ausente');
      }

      const { data } = await api.get(
        `/upsell-native/${uuidOffer}`,
        {
          params: { sale_item_id: uuidSaleItem },
        }
      );

      setUpsellData(data);

      if (Array.isArray(data?.offers) && data.offers.length > 0) {
        if (!data?.is_multi_offer) {
          setOfferSelected((prev) => prev ?? data.offers[0]?.uuid);
        }
      }

      if (Array.isArray(data?.plans) && data.plans.length > 0) {
        setPlanSelected((prev) => prev ?? data.plans[0]?.uuid);
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canFetch) return;
    getUpsellNativeData();
  }, [canFetch]);

  /**
   * 🚨 REDIRECT CORRETO (SIDE-EFFECT)
   * Nunca fazer navigate() no render
   */
  useEffect(() => {
    if (
      upsellData?.is_already_purchased &&
      upsellData.already_purchased_sale_item_uuid
    ) {
      navigate(
        `/compra-realizada/${upsellData.already_purchased_sale_item_uuid}`,
        { replace: true }
      );
    }
  }, [upsellData, navigate]);

  const handleRetry = () => {
    setHasError(false);
    getUpsellNativeData();
  };

  const handleOneClickSubmit = async ({
    offerSelectUuid,
    planSelectUuid,
    upsellOfferUuid,
  }) => {
    if (!uuidSaleItem) return;

    try {
      setIsOneClickLoading(true);

      const offerUuid =
        offerSelectUuid ?? upsellOfferUuid ?? uuidOffer;

      const { data } = await api.post(
        '/sales/process-upsell',
        {
          offer_id: offerUuid,
          plan_id: planSelectUuid ?? null,
          sale_item_id: uuidSaleItem,
          installments: 1,
          payment_method: 'card',
        }
      );

      const saleItemId = data?.sale_item_id ?? uuidSaleItem;

      if (saleItemId) {
        navigate(`/compra-realizada/${saleItemId}`, {
          replace: true,
        });
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setIsOneClickLoading(false);
    }
  };

  /* ---------- STATES ---------- */

  if (isLoading) {
    return (
      <div className='upsell-native-loading'>
        <AiOutlineLoading3Quarters size={30} className='spin' />
      </div>
    );
  }

  if (hasError || !upsellData) {
    return (
      <div className='upsell-native-not-found'>
        <p>Oferta de upsell não encontrada</p>
        <button type='button' onClick={handleRetry}>
          Tentar novamente
        </button>
      </div>
    );
  }

  const isMultiOffer = Boolean(upsellData.is_multi_offer);
  const isPlan = Boolean(upsellData.is_plan);
  const showFooter = Boolean(upsellData.is_footer_visible);

  /**
   * ⛔ Já adquirido → não renderiza página
   * (redirect já ocorreu no useEffect)
   */
  if (upsellData.is_already_purchased) {
    return null;
  }

  return (
    <div className='page-upsell-native-wrapper'>
      <HeaderStep
        stepColorBackground={upsellData.step_color_background}
        stepColor={upsellData.step_color}
        isVisible={upsellData.is_step_visible}
      />

      <HeaderText
        text={upsellData.header}
        textColor={upsellData.header_text_color}
        backgroundColor={upsellData.header_background_color}
        isVisible={upsellData.is_header_visible}
      />

      <main
        className='upsell-native-content'
        style={{ backgroundColor: upsellData.background }}
      >
        <div
          className='upsell-background-image'
          {...(upsellData.background_image_desktop && {
            style: {
              backgroundImage: `url(${upsellData.background_image_desktop})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '24px',
            },
          })}
        >
          <div className='upsell-native-inner'>
            <CardMessageNotClose
              alertNotClosePrimaryColor={
                upsellData.alert_not_close_primary_color
              }
              alertNotClosePrimaryTextColor={
                upsellData.alert_not_close_primary_text_color
              }
              isVisible={upsellData.is_message_not_close}
            />

            <div className='title-container'>
              {upsellData.title_image && (
                <img
                  src={upsellData.title_image}
                  alt=''
                  style={{ width: 130, objectFit: 'contain' }}
                />
              )}

              <Title
                title={upsellData.title}
                titleSize={upsellData.title_size}
                titleColor={upsellData.title_color}
              />

              <Subtitle
                subtitleOne={upsellData.subtitle_one}
                subtitleOneColor={upsellData.subtitle_one_color}
                subtitleOneSize={upsellData.subtitle_one_size}
                subtitleOneWeight={upsellData.subtitle_one_weight}
                subtitleTwo={upsellData.subtitle_two}
                subtitleTwoColor={upsellData.subtitle_two_color}
                subtitleTwoSize={upsellData.subtitle_two_size}
                subtitleTwoWeight={upsellData.subtitle_two_weight}
              />
            </div>

            <div className='upsell-native-body'>
              <MediaUpsell
                isEmbed={upsellData.is_embed_video}
                embedUrl={upsellData.media_embed}
                mediaUrl={upsellData.media_url}
              />

              {isMultiOffer && (
                <MultiOffers
                  offers={upsellData.offers}
                  offerSelected={offerSelected}
                  isOneClick={upsellData.is_one_click}
                  onSelect={setOfferSelected}
                />
              )}

              {isPlan && upsellData.plans?.length > 0 && (
                <MultiPlans
                  plans={upsellData.plans}
                  planSelectUuid={planSelected}
                  onSelect={setPlanSelected}
                />
              )}

              <div className='wrapper-btn-actions'>
                <BtnBuy
                  btnTextAccept={upsellData.btn_text_accept}
                  btnColorAccept={upsellData.btn_color_accept}
                  btnTextAcceptSize={upsellData.btn_text_accept_size}
                  btnTextColorAccept={upsellData.btn_text_color_accept}
                  planSelectUuid={planSelected}
                  offerSelectUuid={offerSelected}
                  upsellOfferUuid={upsellData.upsell_offer_id}
                  isOneClick={upsellData.is_one_click}
                  onOneClickSubmit={handleOneClickSubmit}
                  isLoading={isOneClickLoading}
                />

                <BtnUpsellRefuse
                  btnTextRefuse={upsellData.btn_text_refuse}
                  btnTextColorRefuse={upsellData.btn_text_color_refuse}
                  btnTextRefuseSize={upsellData.btn_text_refuse_size}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showFooter && <UpsellNative.Footer />}
    </div>
  );
}

// eslint-disable-next-line react/display-name
UpsellNative.Footer = function () {
  return (
    <footer className='footer-upsell-native'>
      <div className='wrapper-footer-icons'>
        <div className='icon-footer-upsell'>
          <BiSolidCheckShield size={40} />
          <p>COMPRA<br />SEGURA</p>
        </div>
        <div className='icon-footer-upsell'>
          <img src='/trophy.svg' alt='' />
          <p>SATISFAÇÃO<br />GARANTIDA</p>
        </div>
        <div className='icon-footer-upsell'>
          <BiSolidLock size={40} />
          <p>PRIVACIDADE<br />PROTEGIDA</p>
        </div>
      </div>
    </footer>
  );
};

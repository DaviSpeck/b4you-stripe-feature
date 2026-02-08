import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { fecthRead } from "@/utils/fetch";
import { iUpsellNative } from "@/interfaces/offer";
import { BtnBuy } from "./btn-buy";
import { BtnUpsellRefuse } from "./components/button/refuse";
import { CardMessageNotClose } from "./components/card-message-not-close";
import { FooterPage } from "./components/footer-page";
import { HeaderStep } from "./components/header-steps";
import { HeaderText } from "./components/header-text";
import { MediaUpsell } from "./components/media-upsell";
import { MultiOffers } from "./components/multi-offers";
import { MultiPlans } from "./components/multi-plans";
import { Subtitle } from "./components/subtitle";
import { Title } from "./components/title";
import { useUpsellNativeStorage } from "./storage";

export function UpsellNativePage() {
  const router = useRouter();
  const { set } = useUpsellNativeStorage();

  useEffect(() => {
    return () => {
      useUpsellNativeStorage.setState({
        offerSelectUuid: null,
        upsellOfferUuid: null,
        planSelect: null,
        saleItemId: null,
        cardData: null,
        pixData: null,
        hydrated: false,
      });
    };
  }, []);

  /**
   * ✅ A identidade da página vem SOMENTE da URL
   */
  const offerId = useMemo(() => {
    if (!router.isReady) return null;
    return typeof router.query.offer_id === "string"
      ? router.query.offer_id
      : null;
  }, [router.isReady, router.query.offer_id]);

  const saleItemId = useMemo(() => {
    if (!router.isReady) return null;
    return typeof router.query.sale_item_id === "string"
      ? router.query.sale_item_id
      : null;
  }, [router.isReady, router.query.sale_item_id]);

  useEffect(() => {
    if (!offerId || !saleItemId) return;

    useUpsellNativeStorage.getState().hydrateFromUrl({
      offerId,
      saleItemId,
    });
  }, [offerId, saleItemId]);

  /**
   * ⛔ Não renderiza nada até a URL existir (SSR safe)
   */
  if (!offerId || !saleItemId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  /**
   * ✅ Fetch agora é 100% estável (sem race, sem hydrate)
   */
  const {
    data: upsellNative,
    isError,
    isLoading,
  } = fecthRead<iUpsellNative>({
    route: `/upsell-native/upsell-data/${offerId}?sale_item_id=${saleItemId}`,
    queryKey: ["upsell-native-data", offerId, saleItemId],
    options: {
      enabled: Boolean(offerId && saleItemId),
    },
  });

  /**
   * Redirect erro
   */
  useEffect(() => {
    if (!isError) return;
    router.replace(`/payment-thanks/${saleItemId}`);
  }, [isError, router, saleItemId]);

  /**
   * Redirect já comprado
   */
  useEffect(() => {
    if (!upsellNative) return;

    if (upsellNative.is_already_purchased) {
      const id =
        upsellNative.already_purchased_sale_item_uuid ?? saleItemId;
      router.replace(`/payment-thanks/${id}`);
    }
  }, [upsellNative, router, saleItemId]);

  /**
   * Seta somente flags globais (permitido)
   */
  useEffect(() => {
    if (!upsellNative) return;

    set({
      upsellOfferUuid: upsellNative.upsell_offer_id,
      isOneClick: upsellNative.is_one_click,
    });
  }, [upsellNative, set]);

  useEffect(() => {
    if (!upsellNative) return;

    if (!upsellNative.is_multi_offer && upsellNative.offers?.length) {
      useUpsellNativeStorage.setState({
        offerSelectUuid: upsellNative.offers[0].uuid,
      });
    }
  }, [upsellNative]);

  if (isLoading || !upsellNative) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  const isMultiOfferMode = upsellNative.is_multi_offer;
  const isPlanMode = upsellNative.is_plan;

  /**
   * ✅ Render estável, SSR-safe, sem dependência de store
   */
  return (
    <div className="max-h-[calc(100vh)] overflow-y-auto">
      <HeaderStep
        stepColor={upsellNative.step_color}
        stepColorBackground={upsellNative.step_color_background}
        isVisible={upsellNative.is_step_visible}
      />

      <HeaderText
        text={upsellNative.header}
        textColor={upsellNative.header_text_color}
        backgroundColor={upsellNative.header_background_color}
        isVisible={upsellNative.is_header_visible}
      />

      <main
        className="flex h-full w-full flex-col items-center justify-center py-4 min-[600px]:py-8 min-[850px]:py-9"
        style={{ backgroundColor: upsellNative.background }}
      >
        <div className="w-full max-w-[1200px] p-4">
          <div className="m-auto w-full max-w-[650px] py-10 pt-4">
            <CardMessageNotClose
              alertNotClosePrimaryColor={
                upsellNative.alert_not_close_primary_color
              }
              alertNotClosePrimaryTextColor={
                upsellNative.alert_not_close_primary_text_color
              }
              isVisible={upsellNative.is_message_not_close}
            />

            <div className="flex flex-col items-center justify-center gap-4 pt-6">
              <Title
                title={upsellNative.title}
                titleSize={upsellNative.title_size}
                titleColor={upsellNative.title_color}
              />

              <Subtitle
                subtitleOne={upsellNative.subtitle_one}
                subtitleOneColor={upsellNative.subtitle_one_color}
                subtitleOneSize={upsellNative.subtitle_one_size}
                subtitleOneWeight={upsellNative.subtitle_one_weight}
                subtitleTwo={upsellNative.subtitle_two}
                subtitleTwoColor={upsellNative.subtitle_two_color}
                subtitleTwoSize={upsellNative.subtitle_two_size}
                subtitleTwoWeight={upsellNative.subtitle_two_weight}
              />
            </div>

            <div className="px-4">
              <MediaUpsell
                isEmbed={upsellNative.is_embed_video}
                embedUrl={upsellNative.media_embed}
                mediaUrl={upsellNative.media_url}
              />

              {isMultiOfferMode && (
                <MultiOffers offers={upsellNative.offers} />
              )}

              {isPlanMode && (
                <MultiPlans plans={upsellNative.plans} />
              )}

              <div className="flex w-full flex-col items-center justify-center">
                <BtnBuy
                  text={upsellNative.btn_text_accept}
                  color={upsellNative.btn_text_color_accept}
                  btnColor={upsellNative.btn_color_accept}
                  fontSize={`${upsellNative.btn_text_accept_size}px`}
                />

                <BtnUpsellRefuse
                  color={upsellNative.btn_text_color_refuse}
                  fontSize={`${upsellNative.btn_text_refuse_size}px`}
                  text={upsellNative.btn_text_refuse}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {Boolean(upsellNative.is_footer_visible) && <FooterPage />}
    </div>
  );
}
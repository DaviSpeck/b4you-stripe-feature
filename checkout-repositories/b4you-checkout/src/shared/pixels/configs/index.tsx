import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { FacebookPixelConfig } from "./facebook-config";
import { GooglePixelConfig } from "./google-config";
import { PinterestPixelConfig } from "./pinterest-config";
import { TikTokPixelConfig } from "./tiktok-config";

interface iPixelConfig extends Pick<iOffer, "pixels"> {
  nonce: string;
}

export function PixelConfig(props: iPixelConfig) {
  const { offerData } = useOfferData();

  const { pixels, nonce } = props;

  if (!pixels || !offerData) return <></>;

  const googleAnalytics = offerData?.pixels["google-analytics"]?.map((data) => ({
    pixel_id: data.settings.pixel_id,
  }));

  const googleAds = offerData?.pixels["google-ads"]?.map((data) => ({
    pixel_id: data.settings.pixel_id,
  }));

  return (
    <>
      <PinterestPixelConfig pixels={pixels?.pinterest} />
      <FacebookPixelConfig pixels={pixels.facebook} nonce={nonce} />
      <GooglePixelConfig
        pixels={googleAds.concat(googleAnalytics)}
        nonce={nonce}
      />
      <TikTokPixelConfig pixels={pixels.tiktok} nonce={nonce} />
    </>
  );
}

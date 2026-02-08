import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";

// COMPONENTE RESPONSÁVEL POR CRIAR O HEADER CUSTOMIZADO
export function CustomHeader() {
  const { offerData } = useOfferData();

  function extractIframeSrc(iframeHtml: string) {
    const cleaned =
      iframeHtml.startsWith('"') && iframeHtml.endsWith('"')
        ? iframeHtml.slice(1, -1)
        : iframeHtml;

    const match = cleaned.match(/src="([^"]+)"/);

    return match ? match[1] : null;
  }

  if (!offerData) return <></>;

  const videoSrc = extractIframeSrc(
    offerData.checkout.url_video_checkout ?? "",
  );

  const headerPicture =
    offerData.image_offer.header_picture ?? offerData.checkout.header_picture;

  const headerPictureSecundary =
    offerData.image_offer.header_picture_secondary ??
    offerData.checkout.header_picture_secondary;

  const headerPictureMobile =
    offerData.image_offer.header_picture_mobile ??
    offerData.checkout.header_picture_mobile;

  const headerPictureMobileSecundary =
    offerData.image_offer.second_header_mobile ??
    offerData.checkout.second_header_mobile;

  return (
    <div className="w-full">
      {videoSrc && (
        <div className="h-[210px] pb-2 min-[470px]:h-[310px] min-[770px]:h-[400px]">
          <iframe className="h-full w-full" src={videoSrc} />
        </div>
      )}
      {headerPicture && (
        <img
          src={headerPicture}
          className={cn(
            "w-full rounded-[6px] rounded-b-none bg-white object-fill max-[770px]:hidden",
            !headerPictureSecundary && "rounded-[6px]",
          )}
        />
      )}
      {headerPictureSecundary && (
        <img
          src={headerPictureSecundary}
          className={cn(
            "block w-full rounded-[6px] rounded-t-[0px] bg-white bg-no-repeat object-fill max-[770px]:hidden",
          )}
        />
      )}
      {headerPictureMobile && (
        <img
          src={headerPictureMobile}
          className={cn(
            "block w-full rounded-[6px] bg-white bg-contain bg-center bg-no-repeat object-fill object-center min-[770px]:hidden",
            headerPictureMobileSecundary && "rounded-b-none",
          )}
        />
      )}
      {headerPictureMobileSecundary && (
        <img
          src={headerPictureMobileSecundary}
          className={cn(
            "block w-full rounded-[6px] rounded-t-[0px] bg-white object-fill min-[770px]:hidden",
          )}
        />
      )}
    </div>
  );
}

import { IoImageOutline } from "react-icons/io5";
import { PiVideo } from "react-icons/pi";

interface iProps {
  isEmbed: boolean;
  embedUrl: string | null;
  mediaUrl: string | null;
}

export const MediaUpsell = ({ isEmbed, embedUrl, mediaUrl }: iProps) => {
  const shouldEmbed = isEmbed === true;

  return (
    <div className="flex w-full justify-center py-4">
      {shouldEmbed ? (
        <MediaUpsell.Embed embedUrl={embedUrl} />
      ) : (
        <MediaUpsell.Image mediaUrl={mediaUrl} />
      )}
    </div>
  );
};

MediaUpsell.Image = function (props: Pick<iProps, "mediaUrl">) {
  const { mediaUrl } = props;

  if (!mediaUrl) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center gap-1 rounded-[8px] bg-[#e0e0e0] text-[0.775rem] text-[#464950] min-[580px]:h-[350px] min-[800px]:text-[0.875rem]">
        <IoImageOutline className="text-[1rem] min-[800px]:text-[1.5rem]" />
        <span>Adicione uma imagem</span>
      </div>
    );
  }

  return (
    <img src={mediaUrl} className="h-[250px] w-full min-[580px]:h-[350px]" />
  );
};

MediaUpsell.Embed = function (props: Pick<iProps, "embedUrl">) {
  const { embedUrl } = props;

  const getIframeSrc = (htmlString: string) => {
    const regex = /src="([^"]+)"/;
    const match = htmlString.match(regex);
    return match ? match[1] : null;
  };

  let url = getIframeSrc(String(embedUrl));

  if (!url) {
    return (
      <div className="flex h-[250px] w-full items-center justify-center gap-1 rounded-[8px] bg-[#e0e0e0] text-[#464950] min-[580px]:h-[350px]">
        <PiVideo size={22} />
        <span>Adicione uma mídia</span>
      </div>
    );
  }

  url = url?.startsWith('"') && url.endsWith('"') ? url.slice(1, -1) : url;

  return (
    <iframe
      className="h-[250px] w-full min-[580px]:h-[350px]"
      src={url}
    ></iframe>
  );
};

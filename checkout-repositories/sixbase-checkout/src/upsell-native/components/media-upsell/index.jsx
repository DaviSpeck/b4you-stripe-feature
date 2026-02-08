import { IoImageOutline } from 'react-icons/io5';
import { PiVideo } from 'react-icons/pi';
import './style.scss';

export const MediaUpsell = ({ isEmbed, embedUrl, mediaUrl }) => {
  const shouldEmbed = isEmbed === true;

  return (
    <div className='media-wrapper'>
      {shouldEmbed ? (
        <MediaUpsell.Embed embedUrl={embedUrl} />
      ) : (
        <MediaUpsell.Image mediaUrl={mediaUrl} />
      )}
    </div>
  );
};

const extractIframeSrc = (htmlString) => {
  if (!htmlString) return null;

  const match = String(htmlString).match(/src="([^"]+)"/);
  return match ? match[1] : null;
};

// eslint-disable-next-line react/display-name
MediaUpsell.Image = function ({ mediaUrl }) {
  if (!mediaUrl) {
    return (
      <div className='media-placeholder image'>
        <IoImageOutline />
        <span>Adicione uma imagem</span>
      </div>
    );
  }

  return (
    <img
      src={mediaUrl}
      className='media-image'
      alt=''
    />
  );
};

// eslint-disable-next-line react/display-name
MediaUpsell.Embed = function ({ embedUrl }) {
  let url = extractIframeSrc(embedUrl);

  if (!url) {
    return (
      <div className='media-placeholder video'>
        <PiVideo size={22} />
        <span>Adicione uma mídia</span>
      </div>
    );
  }

  url =
    url.startsWith('"') && url.endsWith('"')
      ? url.slice(1, -1)
      : url;

  return (
    <iframe
      className='media-embed'
      src={url}
      title='upsell-video'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
      allowFullScreen
    />
  );
};
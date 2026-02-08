import { useState } from 'react';
import api from '../../../providers/api';
import { notify } from '../../../modules/functions';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import { Spinner } from 'react-bootstrap';
import './style.scss';

const ALLOWED_HOSTS = [
  'youtube.com',
  'youtu.be',
  'player.vimeo.com',
  'vimeo.com',
  'loom.com',
  'wistia.com',
  'fast.wistia.net',
  'pandavideo.com.br',
  'player.pandavideo.com.br',
  'drive.google.com',
  'twitch.tv',
  'facebook.com',
];

const extractSrcFromIframe = (iframeHTML) => {
  const match = iframeHTML.match(/src="([^"]+)"/);
  return match ? match[1] : null;
};

const normalizeToEmbedUrl = (input) => {
  if (!input) return null;

  const raw = input.includes('<iframe')
    ? extractSrcFromIframe(input)
    : input;

  try {
    const url = new URL(raw);

    if (!ALLOWED_HOSTS.some((host) => url.hostname.includes(host))) {
      return null;
    }

    /* ========== YOUTUBE ========== */
    if (url.hostname.includes('youtube') || url.hostname.includes('youtu.be')) {
      const videoId =
        url.searchParams.get('v') || url.pathname.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    /* ========== VIMEO ========== */
    if (url.hostname.includes('vimeo')) {
      const videoId = url.pathname.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }

    /* ========== LOOM ========== */
    if (url.hostname.includes('loom')) {
      const videoId = url.pathname.split('/').pop();
      return `https://www.loom.com/embed/${videoId}`;
    }

    /* ========== WISTIA ========== */
    if (url.hostname.includes('wistia') || url.hostname.includes('fast.wistia')) {
      return raw;
    }

    /* ========== PANDA VIDEO ========== */
    if (url.hostname.includes('pandavideo')) {
      return raw.replace('/embed/', '/embed/?');
    }

    /* ========== GOOGLE DRIVE PREVIEW ========== */
    if (url.hostname.includes('drive.google.com')) {
      const fileId = url.pathname.split('/')[3];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    /* ========== TWITCH ========== */
    if (url.hostname.includes('twitch')) {
      const videoId = url.pathname.split('/').pop();
      return `https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}`;
    }

    /* ========== FACEBOOK VIDEO ========== */
    if (url.hostname.includes('facebook')) {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
};

export const UploadEmbed = ({ form, uploadUrl, removeUrl, isActive }) => {
  const [embedText, setEmbedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mediaEmbed = form.watch('mediaEmbed');

  const handleSendEmbed = async () => {
    const embedUrl = normalizeToEmbedUrl(embedText);

    if (!embedUrl) {
      notify({
        message:
          'Link inválido. Use YouTube, Vimeo, Loom, Wistia, Panda, Drive, Twitch ou Facebook.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.patch(uploadUrl, {
        media_embed: embedUrl,
      });

      form.setValue('mediaEmbed', embedUrl);

      notify({
        message: 'Mídia adicionada com sucesso!',
        type: 'success',
      });
    } catch {
      notify({
        message: 'Não foi possível adicionar o vídeo.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (mediaEmbed) {
    return (
      <UploadEmbed.iFrame
        form={form}
        isActive={isActive}
        removeUrl={removeUrl}
      />
    );
  }

  return (
    <div className='w-100 d-flex mb-0'>
      <input
        className='input-embed'
        type='text'
        placeholder='Cole o link do vídeo aqui (YouTube, Vimeo, Panda, etc)'
        disabled={!isActive}
        onChange={(e) => setEmbedText(e.target.value)}
      />

      <ButtonDS
        type='button'
        variant='primary'
        className='d-flex align-items-center'
        style={{ borderRadius: '0px 6px 6px 0px', fontSize: 14 }}
        disabled={isLoading || !embedText}
        onClick={handleSendEmbed}
      >
        {isLoading ? (
          <Spinner variant='light' size='sm' animation='border' />
        ) : (
          'Enviar'
        )}
      </ButtonDS>
    </div>
  );
};

UploadEmbed.iFrame = function ({ form, isActive, removeUrl }) {
  const [isLoading, setIsLoading] = useState(false);

  const mediaEmbed = form.watch('mediaEmbed');
  const videoUrl = normalizeToEmbedUrl(mediaEmbed);

  const removeMidia = async () => {
    setIsLoading(true);
    try {
      await api.patch(removeUrl, { media_embed: null });
      form.setValue('mediaEmbed', null);
    } catch {
      notify({
        message: 'Não foi possível remover o vídeo.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='removing-media'>
        <span>Removendo mídia...</span>
        <Spinner size='sm' animation='border' />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      {videoUrl ? (
        <iframe
          src={`${videoUrl}?autoplay=1&mute=1`}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          style={{ width: '370px', height: '200px' }}
        />
      ) : (
        <div className='invalid-embed'>Embed inválido</div>
      )}

      <ButtonDS
        size='icon'
        className='btn-remove-media'
        onClick={removeMidia}
        outline
        type='button'
        variant='danger'
        disabled={!isActive}
        style={{ width: 22, height: 22 }}
      >
        <i className='bx bx-x'></i>
      </ButtonDS>
    </div>
  );
};
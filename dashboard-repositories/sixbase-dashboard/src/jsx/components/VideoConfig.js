export const WELCOME_VIDEOS = {
  creator: {
    videoUrl:
      'https://b-vz-76776874-a55.tv.pandavideo.com.br/880fe21e-db4f-4165-9da7-f9eab530e829/playlist.m3u8',
    title: 'Bem-vindo, Creator!',
    titleIcon: 'bx-video',
    description:
      'Assista este vídeo para descobrir como maximizar seus ganhos como creator na nossa plataforma.',
    duration: '6:41',
    giftUrl:
      'https://youtube.com/playlist?list=PLrIDE4veN4L302fYzIEs8ekPNQfG35O_7&si=-fSfqFi_M-1TYoy_',
    giftButtonText: 'Receber presente',
  },
  marca: {
    contentType: 'message',
    title: 'Bem-vindo, Marca!',
    titleIcon: 'bx-buildings',
    messageHeading: 'Tudo pronto com seu cadastro!',
    messageParagraphs: [
      'Você pode entrar na sua conta normalmente e explorar a plataforma no seu ritmo.',
      'Mas, se quiser um direcionamento personalizado, a Bê pode te ajudar a entender seus objetivos e encaminhar você a um gerente de conta B4you.',
    ],
    primaryAction: {
      label: 'Entrar na conta',
      action: 'close',
    },
    secondaryAction: {
      label: 'Conversar com a Bê',
      action: 'link',
      url: 'https://api.whatsapp.com/send?phone=5521966640724&text=Oi!%20Gostaria%20de%20um%20direcionamento%20personalizado%20com%20um%20gerente%20B4You.',
      style: {
        backgroundColor: '#00c896',
        borderColor: '#00c896',
        color: '#001432',
      },
    },
  },
};

export const getVideoUrl = (config) => {
  return config?.videoUrl || null;
};

export const getVideoConfig = (userType) => {
  if (userType === 'creator' || userType === 'marca') {
    return WELCOME_VIDEOS[userType];
  }
  return null;
};

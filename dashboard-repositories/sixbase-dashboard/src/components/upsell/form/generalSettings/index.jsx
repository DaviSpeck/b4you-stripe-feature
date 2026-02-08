import { GoDotFill } from 'react-icons/go';
import { InputColor } from '../../inputColor';
import { InputText } from '../../inputText';
import { SwitchInput } from '../../switch';
import { UploadEmbed } from '../../uploadEmbed';
import { ImageUpload } from '../../uploadImage';
import './style.scss';

export const GeneralSettings = (props) => {
  return (
    <div className='wrapper-general-configs'>
      <GeneralSettings.ImageMedia {...props} />
    </div>
  );
};

// eslint-disable-next-line react/display-name
GeneralSettings.ImageMedia = function (props) {
  const {
    form,
    imageUrl,
    embedUrl,
    isActive,
    imageBackgroundImageDesktop,
    imageBackgroundImageMobile,
  } = props;

  const isEmbedVideo = form.watch('isEmbedVideo');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div className='wrapper-header'>
        <GoDotFill />
        <h3>Configurações gerais</h3>
      </div>
      <div className='wrapper-img-upload'>
        <InputText.InputWrapper label='Imagem de fundo (Desktop)'>
          <ImageUpload
            form={form}
            fieldName='backgroundImageDesktop'
            uploadField='background_image_desktop'
            isActive={isActive}
            uploadUrl={imageBackgroundImageDesktop.upload}
            deleteUrl={imageBackgroundImageDesktop.remove}
          />
        </InputText.InputWrapper>
      </div>
      <div className='wrapper-img-upload'>
        <InputText.InputWrapper label='Imagem de fundo (Mobile)'>
          <ImageUpload
            form={form}
            isActive={isActive}
            fieldName='backgroundImageMobile'
            uploadField='background_image_mobile'
            uploadUrl={imageBackgroundImageMobile.upload}
            deleteUrl={imageBackgroundImageMobile.remove}
          />
        </InputText.InputWrapper>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {!isEmbedVideo && (
          <div className='wrapper-img-upload'>
            <InputText.InputWrapper label='Imagem da Oferta'>
              <ImageUpload
                form={form}
                isActive={isActive}
                fieldName='mediaUrl'
                uploadField='media_url'
                uploadUrl={imageUrl.upload}
                deleteUrl={imageUrl.remove}
              />
            </InputText.InputWrapper>
          </div>
        )}
        {isEmbedVideo && (
          <InputText.InputWrapper label='Embed Vídeo'>
            <UploadEmbed
              form={form}
              isActive={isActive}
              fieldName='mediaEmbed'
              uploadField='media_embed'
              uploadUrl={embedUrl.upload}
              removeUrl={embedUrl.remove}
            />
          </InputText.InputWrapper>
        )}
        <SwitchInput
          label={isEmbedVideo ? 'Embed Vídeo' : 'Imagem'}
          name='isEmbedVideo'
          form={form}
          isActive={isActive}
        />
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <InputColor
          label='Cor de fundo'
          form={form}
          isActive={isActive}
          name='background'
        />
        <SwitchInput
          form={form}
          name='isFooterVisible'
          label={
            form.watch('isFooterVisible')
              ? 'Não mostrar rodapé'
              : 'Mostrar rodapé'
          }
          isActive={isActive}
        />
      </div>
    </div>
  );
};

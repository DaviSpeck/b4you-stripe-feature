import { useState } from 'react';
import { InputText } from './inputText';
import { SwitchInput } from './switch';
import { UploadEmbed } from './uploadEmbed';
import { ImageUpload } from './uploadImage';
import { StepConfig } from './form/step';
import { NotCloseMesseConfigs } from './form/notCloseMessage';
import { BtnBuyConfigs } from './form/btnBuy';
import { BtnRefuse } from './form/btnRefuse';
import { Spinner } from 'react-bootstrap';
import './style.scss';
import { HeaderPageConfigs } from './form/headerPage';
import { TitleConfig } from './form/title';
import { GeneralSettings } from './form/generalSettings';

export const FormUpsellNativeConfig = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    form,
    imageUrls,
    embedUrls,
    imageTitleUrls,
    isActive,
    handlerOnSubmit,
    buttonDelete,
    onChangeProduct,
    imageBackgroundImageDesktop,
    imageBackgroundImageMobile,
  } = props;
  const isFormValid = form.formState.isValid;

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await handlerOnSubmit(data);
    } catch (error) {
      return error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className='container-fields'>
      {buttonDelete && buttonDelete}
      <div className='input-wrapper'>
        <StepConfig form={form} isActive={isActive} />
        <HeaderPageConfigs form={form} isActive={isActive} />
        <NotCloseMesseConfigs form={form} isActive={isActive} />
        <TitleConfig
          form={form}
          isActive={isActive}
          imageTitleUrls={imageTitleUrls}
        />
        <BtnBuyConfigs
          form={form}
          isActive={isActive}
          onChangeProduct={onChangeProduct}
        />
        <BtnRefuse form={form} isActive={isActive} />
        <GeneralSettings
          form={form}
          imageUrl={imageUrls}
          embedUrl={embedUrls}
          isActive={isActive}
          imageBackgroundImageDesktop={imageBackgroundImageDesktop}
          imageBackgroundImageMobile={imageBackgroundImageMobile}
        />
        <div className='wrapper-btn-html-copy'>
          <button
            disabled={!isActive || isSubmitting || !isFormValid}
            type='button'
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            Salvar
            {isSubmitting && (
              <Spinner animation='border' role='status' size='sm' />
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

// eslint-disable-next-line react/display-name
FormUpsellNativeConfig.ImageMedia = function (props) {
  const { form, imageUrl, embedUrl, isActive } = props;

  const isEmbedVideo = form.watch('isEmbedVideo');

  return (
    <div className='wrapper-image-media'>
      {!isEmbedVideo && (
        <div className='wrapper-img-upload'>
          <InputText.InputWrapper label='Embed Video'>
            <ImageUpload
              form={form}
              isActive={isActive}
              uploadUrl={imageUrl.upload}
              deleteUrl={imageUrl.remove}
            />
          </InputText.InputWrapper>
        </div>
      )}
      {isEmbedVideo && (
        <div className='wrapper-embed-upload'>
          <InputText.InputWrapper label='Embed Vídeo'>
            <UploadEmbed
              form={form}
              isActive={isActive}
              uploadUrl={embedUrl.upload}
              removeUrl={embedUrl.remove}
            />
          </InputText.InputWrapper>
        </div>
      )}
      <SwitchInput
        label={isEmbedVideo ? 'Embed Vídeo' : 'Imagem'}
        name='isEmbedVideo'
        form={form}
        isActive={isActive}
      />
    </div>
  );
};

import { GoDotFill } from 'react-icons/go';

import { InputSize } from '../../inputSize';
import { InputColor } from '../../inputColor';
import { InputText } from '../../inputText';
import { FontWeigthList } from '../../upsellfontWeigthSelect';
import './style.scss';
import { ImageUpload } from '../../uploadImage';

export const TitleConfig = (props) => {
  const { form, imageTitleUrls, isActive } = props;

  return (
    <>
      <div className='container-inputs-buy'>
        <div className='wrapper-header'>
          <GoDotFill />
          <h3>Configuração do título da oferta</h3>
        </div>
        <div className='wrapper-inputs'>
          <InputText.InputWrapper label='Logo'>
            <ImageUpload
              form={form}
              fieldName='titleImage'
              uploadField='title_image'
              isActive={isActive}
              uploadUrl={imageTitleUrls.upload}
              deleteUrl={imageTitleUrls.remove}
            />
          </InputText.InputWrapper>
          <TitleConfig.Title form={form} isActive={isActive} />
          <TitleConfig.SubTitleOne form={form} isActive={isActive} />
          <TitleConfig.SubTitleTwo form={form} isActive={isActive} />
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line react/display-name
TitleConfig.Title = function (props) {
  const { form, isActive } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <InputText
        label='Título da oferta'
        name='title'
        form={form}
        isActive={isActive}
        placeholder='Digite o nome da oferta...'
      />
      <div
        style={{
          display: 'flex',
          gap: '16px',
        }}
      >
        <InputSize
          label='Tamanho'
          name='titleSize'
          form={form}
          isActive={isActive}
        />
        <InputColor
          label='Cor do texto'
          form={form}
          isActive={isActive}
          name='titleColor'
        />
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
TitleConfig.SubTitleOne = function (props) {
  const { form, isActive } = props;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        border: '1px solid #e6e6e6',
        padding: '16px',
        borderRadius: '8px',
      }}
    >
      <InputText
        form={form}
        label='Subtítulo 1'
        name='subtitleOne'
        isActive={isActive}
        placeholder='Digite o primeiro subtitulo da oferta...'
      />
      <FontWeigthList
        form={form}
        fieldName='subtitleOneWeight'
        disabled={!isActive}
      />
      <div
        style={{
          display: 'flex',
          gap: '16px',
        }}
      >
        <InputSize
          form={form}
          label='Tamanho'
          name='subtitleOneSize'
          isActive={isActive}
        />
        <InputColor
          form={form}
          label='Cor do texto'
          name='subtitleOneColor'
          isActive={isActive}
        />
      </div>
    </div>
  );
};

// eslint-disable-next-line react/display-name
TitleConfig.SubTitleTwo = function (props) {
  const { form, isActive } = props;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        border: '1px solid #e6e6e6',
        padding: '16px',
        borderRadius: '8px',
      }}
    >
      <InputText
        label='Subtítulo 2'
        name='subtitleTwo'
        form={form}
        isActive={isActive}
        placeholder='Digite o primeiro subtitulo da oferta...'
      />
      <FontWeigthList
        form={form}
        fieldName='subtitleTwoWeight'
        disabled={!isActive}
      />
      <div
        style={{
          display: 'flex',
          gap: '16px',
        }}
      >
        <InputSize
          label='Tamanho'
          name='subtitleTwoSize'
          form={form}
          isActive={isActive}
        />
        <InputColor
          label='Cor do texto'
          form={form}
          isActive={isActive}
          name='subtitleTwoColor'
        />
      </div>
    </div>
  );
};

import { GoDotFill } from 'react-icons/go';
import { InputSize } from '../../inputSize';
import { InputColor } from '../../inputColor';
import { InputText } from '../../inputText';
import './style.scss';

export const BtnRefuse = (props) => {
  const { form, isActive } = props;
  return (
    <>
      <div className='container-inputs-refuse'>
        <div className='wrapper-header'>
          <GoDotFill />
          <h3>Configuração de botão de recusa</h3>
        </div>
        <div className='wrapper-inputs'>
          <InputText
            form={form}
            label='Texto do botão de recusar Upsell'
            isActive={isActive}
            name='btnTextRefuse'
            placeholder='Texto do botão'
          />
        </div>
        <div className='wrapper-btn'>
          <InputSize
            label='Tamanho do texto'
            name='btnTextRefuseSize'
            form={form}
            isActive={isActive}
          />
          <InputColor
            label='Cor texto'
            form={form}
            isActive={isActive}
            name='btnTextColorRefuse'
          />
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line react/display-name
BtnRefuse.InputWraper = function (props) {
  const { label, children } = props;
  return (
    <div className='input-native-upsell'>
      <label>{label}</label>
      {children}
    </div>
  );
};

// eslint-disable-next-line react/display-name
BtnRefuse.FieldError = function (props) {
  const { message } = props;

  if (!message || (message && message.length === 0)) return <></>;

  return (
    <div className='form-error' id='cep_help'>
      <span>{message}</span>
    </div>
  );
};

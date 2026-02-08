import { GoDotFill } from 'react-icons/go';
import { InputColor } from '../../inputColor';
import { SwitchInput } from '../../switch';
import './style.scss';

export const NotCloseMesseConfigs = (props) => {
  const { form, isActive } = props;

  return (
    <div className='container-inputs-not-close-message'>
      <div className='wrapper-header'>
        <GoDotFill />
        <h3>{'Configuração mensagem "Não feche esta página"'}</h3>
      </div>
      <div className='wrapper-inputs'>
        <InputColor
          label='Cor principal'
          form={form}
          isActive={isActive && form.watch('isMessageNotClose')}
          name='alertNotClosePrimaryColor'
        />
        <InputColor
          label='Cor do texto'
          form={form}
          isActive={isActive && form.watch('isMessageNotClose')}
          name='alertNotClosePrimaryTextColor'
        />
        <SwitchInput
          form={form}
          name='isMessageNotClose'
          label={form.watch('isMessageNotClose') ? 'Ativo' : 'Inativo'}
          isActive={isActive}
        />
      </div>
    </div>
  );
};

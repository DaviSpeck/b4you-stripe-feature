import { GoDotFill } from 'react-icons/go';
import './style.scss';
import { InputColor } from '../../inputColor';
import { SwitchInput } from '../../switch';

export const StepConfig = (props) => {
  const { form, isActive } = props;

  return (
    <div className='container-inputs-steps'>
      <div className='wrapper-header'>
        <GoDotFill />
        <h3>Configuração de etapas de venda</h3>
      </div>
      <div className='wrapper-inputs'>
        <InputColor
          label='Cor do fundo'
          form={form}
          isActive={isActive && form.watch('isStepVisible')}
          name='stepColorBackground'
        />
        <InputColor
          label='Cor das etapas'
          form={form}
          isActive={isActive && form.watch('isStepVisible')}
          name='stepColor'
        />
        <SwitchInput
          form={form}
          name='isStepVisible'
          label={form.watch('isStepVisible') ? 'Ativo' : 'Inativo'}
          isActive={isActive}
        />
      </div>
    </div>
  );
};

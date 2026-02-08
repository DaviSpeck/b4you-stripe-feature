import { GoDotFill } from 'react-icons/go';
import { InputColor } from '../../inputColor';
import { InputText } from '../../inputText';
import './style.scss';
import { SwitchInput } from '../../switch';

export const HeaderPageConfigs = (props) => {
  const { form, isActive } = props;

  return (
    <div className='wrapper-header-page-config'>
      <div className='wrapper-header'>
        <GoDotFill />
        <h3>Configuração do cabeçalho da página</h3>
      </div>
      <div className='wrapper-fields'>
        <InputText
          label='Não saia desta página sem conferir esta oferta imperdível!'
          name='header'
          form={form}
          isActive={isActive && form.watch('isHeaderVisible')}
          placeholder='Digite o nome da oferta...'
        />
        <div className='wrapper-colors'>
          <InputColor
            label='Cor do fundo'
            form={form}
            isActive={isActive && form.watch('isHeaderVisible')}
            name='headerBackgroundColor'
          />
          <InputColor
            label='Cor do texto'
            form={form}
            isActive={isActive && form.watch('isHeaderVisible')}
            name='headerTextColor'
          />
          <SwitchInput
            form={form}
            name='isHeaderVisible'
            label={form.watch('isHeaderVisible') ? 'Ativo' : 'Inativo'}
            isActive={isActive}
          />
        </div>
      </div>
    </div>
  );
};

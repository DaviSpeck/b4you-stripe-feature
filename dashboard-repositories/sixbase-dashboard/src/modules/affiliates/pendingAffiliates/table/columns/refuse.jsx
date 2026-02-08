import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../../providers/api';
import { notify } from '../../../../functions';

export const RefuseAction = (props) => {
  const { inviteId, onRefresh, isLoading, onLoading } = props;

  const onRefuse = async () => {
    try {
      onLoading(true);
      await api.put(`/affiliates/reject/${inviteId}`);
      notify({ message: 'Salvo com sucesso', type: 'success' });
      onRefresh();
    } catch (error) {
      notify({ message: 'Falha ao salvar', type: 'error' });
    } finally {
      onLoading(false);
    }
  };

  return (
    <ButtonDS
      size={'icon'}
      variant='danger'
      disabled={isLoading}
      onClick={onRefuse}
    >
      <i className='bx bx-dislike'></i>
    </ButtonDS>
  );
};

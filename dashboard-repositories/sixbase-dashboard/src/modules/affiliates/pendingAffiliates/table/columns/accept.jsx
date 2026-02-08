import ButtonDS from '../../../../../jsx/components/design-system/ButtonDS';
import api from '../../../../../providers/api';
import { notify } from '../../../../functions';

export const AcceptAction = (props) => {
  const { inviteId, onRefresh, isLoading, onLoading } = props;

  const onAccept = async () => {
    try {
      onLoading(true);
      await api.put(`/affiliates/active/${inviteId}`);
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
      variant='success'
      disabled={isLoading}
      onClick={onAccept}
    >
      <i className='bx bx-like'></i>
    </ButtonDS>
  );
};

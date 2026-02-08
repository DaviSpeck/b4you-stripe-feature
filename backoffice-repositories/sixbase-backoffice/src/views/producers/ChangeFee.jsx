import { api } from '../../services/api';
import { Button, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { configNotify } from '../../configs/toastConfig';
import { toast } from 'react-toastify';

const ChangeFee = ({ name, user, setUser, show, setShow }) => {
  const labels = {
    fee_fixed_amount_service: 'Tarifa Fixa',
    fee_variable_percentage_service: 'Tarifa Variavel',
    release_billet: 'Prazo Boleto',
    release_pix: 'Prazo Pix',
    release_credit_card: 'Prazo Cartão',
    withheld_balance_percentage: 'Porcentagem',
    use_highest_sale: 'Usar apenas porcentagem',
  };

  const oldValue = user?.sale_settings?.[name];

  const onSubmit = (newValue) => {
    const fields = {
      ...(user?.sale_settings || {}),
      [name]: newValue,
    };

    api
      .put(`users/${user.uuid}/fees`, fields)
      .then(() => {
        setUser((prev) => ({
          ...prev,
          sale_settings: {
            ...(prev?.sale_settings || {}),
            [name]: newValue,
          },
        }));
        toast.success(`${labels[name]} alterado com sucesso`, configNotify);
        setShow(false);
      })
      .catch(() => toast.error('Falha ao alterar', configNotify));
  };

  return (
    <Modal
      isOpen={show}
      toggle={() => {
        setShow(false);
      }}
      centered
    >
      <ModalHeader toggle={() => setShow(!show)}>{labels[name]}</ModalHeader>
      <ModalBody>
        <Label className="mb-1">Valor antigo</Label>
        <input className="form-control" value={oldValue} type="text" disabled />
        <Label className="mb-1 mt-1">Novo valor</Label>
        <div>
          <input className="form-control" type="number" />
          <div className="d-flex w-100 justify-content-end mt-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                onSubmit(
                  Number(
                    e.currentTarget.parentElement.parentElement.children[0]
                      .value,
                  ),
                );
              }}
              color="primary"
            >
              Salvar
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ChangeFee;

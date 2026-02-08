import { Avatar } from '@material-ui/core';
import { Modal } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import Loader from '../../utils/loader';
import NoDataComponentContent from '../NoDataComponentContent';
import { currency } from '../functions';

export default function RankingModalProductsAffiliations({
  open,
  setOpen,
  productsAffiliations,
  setProductsAffiliations,
  loadingModal,
  selectedUser,
  setSelectedUser,
}) {
  const columns = [
    {
      name: '',
      width: '80px',
      cell: (_, index) => `${index + 1}º`,
    },
    {
      name: 'Produto',
      width: '230px',
      cell: (item) => item.product_name,
    },
    {
      name: 'Comissão (%)',
      width: '150px',
      cell: (item) =>
        item.commission ? `${item.commission}%` : 'Sem comissão',
    },
    {
      name: 'Nº de Vendas',
      width: '180px',
      cell: (item) => item.total_items_sold,
    },
    {
      name: 'Nº de Cliques',
      width: '180px',
      cell: (item) => item.click_amount,
    },
    {
      name: 'Total em Comissões',
      width: '250px',
      cell: (item) => currency(item.total_commission_value),
    },
    {
      name: 'Status',
      width: '150px',
      center: true,
      cell: (item) => (
        <BadgeDS variant={item.status.color} disc>
          {item.status.name}
        </BadgeDS>
      ),
    },
  ];

  const handleClose = () => {
    setOpen(false);
    setProductsAffiliations([]);
    setSelectedUser(null);
  };

  return (
    <Modal
      show={open}
      onHide={handleClose}
      centered
      size='xl'
      className='modal-generic'
    >
      <Modal.Header closeButton>
        <Modal.Title>Produtos do Afiliado</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className='d-flex align-items-center'>
          <Avatar
            src={selectedUser?.profile_picture}
            style={{
              width: '60px',
              height: '60px',
              marginRight: '10px',
            }}
          />

          <div>
            <h6 className='mt-2'>{selectedUser.full_name}</h6>
            <p style={{ marginBottom: '0px !important' }}>
              {selectedUser.email}
            </p>
          </div>
        </div>

        {loadingModal ? (
          <Loader title='Carregando dados...' style={{ padding: '50px' }} />
        ) : (
          <div className='mt-3'>
            <DataTable
              columns={columns}
              data={productsAffiliations}
              responsive
              noDataComponent={<NoDataComponentContent />}
            />
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

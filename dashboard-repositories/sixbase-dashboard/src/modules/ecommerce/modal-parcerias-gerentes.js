import { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import api from '../../providers/api';
import '../products/styles.scss';
import { currency, notify } from '../functions';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ModalManager from '../products/ModalManager';
import NoDataComponentContent from '../NoDataComponentContent';
import Loader from '../../utils/loader';
import memoizeOne from 'memoize-one';

const columns = memoizeOne((BadgeDS, renderActions) => [
  {
    name: 'Usuário',
    cell: (item) => (
      <div key={item.id}>
        <div>{item.full_name}</div>
        <small>{item.email}</small>
      </div>
    ),
  },

  {
    name: 'Comissão',
    cell: (item) =>
      item.commission_type !== `percentage`
        ? currency(item.commission_with_affiliate)
        : item.commission_with_affiliate + `%`,
  },
  {
    name: 'Status',
    cell: (item) => (
      <BadgeDS key={item.id} variant={item.status.key}>
        {item.status.label}
      </BadgeDS>
    ),
  },
  {
    name: 'Ações',
    cell: (item) =>
      (item.status.id === 1 || item.status.id === 2) && renderActions(item),
  },
]);

const ManagerContent = ({ productUuid }) => {
  const [modalInviteShow, setModalInviteShow] = useState(false);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [countAffiliates, setCountAffiliates] = useState(0);

  const [requesting, setRequesting] = useState(true);
  const [activeManager, setActiveManager] = useState(null);
  const [alert, setAlert] = useState(null);
  const [records, setRecords] = useState(null);

  useEffect(() => {
    if (!modalInviteShow && !modalCancelShow) {
      fetchData();
    }
    setAlert(null);
  }, [modalInviteShow, modalCancelShow]);

  const fetchData = () => {
    if (!productUuid) return;
    api.get('/products/managers/' + productUuid).then((response) => {
      setRecords(response.data);
      setRequesting(false);
    });
  };

  const fetchCountAffiliates = (manager) => {
    api
      .get('/products/managers/' + productUuid + '/count/' + manager.id)
      .then((r) => setCountAffiliates(r.data.count))
      // eslint-disable-next-line
      .catch((err) => console.log(err));
  };

  const renderActions = (item) => {
    return (
      <>
        <div className='d-flex justify-content-start'>
          <div className='mr-1'>
            <ButtonDS
              size={'icon'}
              variant='primary'
              onClick={() => {
                fetchCountAffiliates(item);
                setActiveManager(item);
                setModalInviteShow(true);
              }}
            >
              <i className='bx bxs-pencil'></i>
            </ButtonDS>
          </div>
          <div>
            <ButtonDS
              size={'icon'}
              variant='danger'
              onClick={() => {
                setActiveManager(item);
                setModalCancelShow(true);
              }}
            >
              <i className='bx bx-x' style={{ fontSize: 20 }}></i>
            </ButtonDS>
          </div>
        </div>
      </>
    );
  };

  const handleCancel = () => {
    api
      .delete('/products/managers/' + productUuid + `/` + activeManager.id)
      .then(() => {
        notify({
          message: 'Gerente cancelado com sucesso',
          type: 'success',
        });
        fetchData();
      })
      .catch((err) => {
        if (err.response.data.code === 400) {
          setAlert(err.response.data.message);
        }
        notify({ message: 'Falha ao cancelar gerente', type: 'error' });
      })
      .finally(() => setModalCancelShow(false));
  };

  return (
    <Fragment>
      {modalInviteShow && (
        <>
          <ModalGeneric
            title={(activeManager ? 'Editar' : 'Convidar') + ' Gerente'}
            show={modalInviteShow}
            setShow={setModalInviteShow}
            centered
          >
            <ModalManager
              show={modalInviteShow}
              setShow={setModalInviteShow}
              activeManager={activeManager}
              setActiveManager={setActiveManager}
              uuidProduct={productUuid}
              requesting={'put'}
              setRequesting={setRequesting}
              alert={alert}
              setAlert={setAlert}
              records={records}
              setRecords={setRecords}
              count={countAffiliates}
              fetchCountAffiliates={fetchCountAffiliates}
            />
          </ModalGeneric>
        </>
      )}
      {modalCancelShow && (
        <ConfirmAction
          title={'Cancelar Gerente'}
          show={modalCancelShow}
          setShow={setModalCancelShow}
          handleAction={handleCancel}
          confirmText={activeManager?.full_name}
          centered
        />
      )}

      <Row>
        <Col>
          <div className='container-datatable card'>
            {records ? (
              <DataTable
                columns={columns(BadgeDS, renderActions)}
                data={records}
                progressPending={requesting}
                progressComponent={<Loader title='Carregando...' />}
                noDataComponent={<NoDataComponentContent />}
              />
            ) : (
              <NoDataComponentContent text={'Carregando...'} />
            )}
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <ButtonDS
            onClick={() => {
              setActiveManager(null);
              setModalInviteShow(true);
            }}
            size='md'
          >
            Convidar Gerente
          </ButtonDS>
        </Col>
      </Row>
    </Fragment>
  );
};

export default ManagerContent;

import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import ModalGeneric from '../../jsx/components/ModalGeneric';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import ConfirmAction from '../../jsx/layouts/ConfirmAction.js';
import PageTitle from '../../jsx/layouts/PageTitle';
import ModalManager from '../../modules/products/ModalManager';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import { currency, notify } from '../functions';
import NoDataComponentContent from '../NoDataComponentContent';
import ModalManagerAffiliates from './ModalManagerAffiliates.jsx';

const copyToClipboard = (param, text = 'Copiado com sucesso') => {
  navigator.clipboard.writeText(param);
  notify({
    message: text,
    type: 'success',
  });
  setTimeout(() => {}, 3000);
};

const columns = memoizeOne(
  (
    setRecords,
    showModalAffiliates,
    setShowModalAffiliates,
    setItemSelected
  ) => [
    {
      name: <RenderNameDataTable name='Produtor' iconClassName='bx bx-user' />,
      cell: (item) => (
        <div>
          {item.producer_name} {item.producer_email}
        </div>
      ),
    },
    {
      name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
      cell: (item) => item.product_name,
    },
    {
      name: (
        <RenderNameDataTable name='Comissão' iconClassName='bx bx-dollar' />
      ),
      cell: (item) =>
        item.commission_type !== `percentage`
          ? currency(item.commission_with_affiliate)
          : item.commission_with_affiliate + `%`,
    },
    {
      name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
      cell: (item) => (
        <BadgeDS variant={item.status.key}>{item.status.label}</BadgeDS>
      ),
    },
    {
      name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
      cell: (item) => {
        const changeManagerStatus = (status) => {
          api
            .put(`/managers`, { id: item.id, status: status })
            .then((response) => {
              const updatedStatus = response.data.status;
              setRecords((prevRecords) => {
                const newRecords = prevRecords.map((record) =>
                  record.id === item.id
                    ? { ...record, status: updatedStatus }
                    : record
                );
                return newRecords;
              });
              if (status === 2) {
                notify({ message: `Solicitação aceita`, type: 'success' });
              } else {
                notify({ message: `Cancelado com sucesso`, type: 'success' });
              }
            })
            .catch(() => {
              if (status === 2) {
                notify({
                  message: `Falha ao aceitar solicitação`,
                  type: 'error',
                });
              } else {
                notify({
                  message: `Falha ao cancelar solicitação`,
                  type: 'error',
                });
              }
            });
        };

        return (
          <div>
            <div className='d-flex align-items-center'>
              {item.status.id === 1 && (
                <>
                  <ButtonDS
                    size='icon'
                    variant='success'
                    onClick={() => changeManagerStatus(2)}
                  >
                    <i class='bx bx-check'></i>
                  </ButtonDS>
                  <ButtonDS
                    size='icon'
                    variant='danger'
                    className={'ml-1'}
                    onClick={() => changeManagerStatus(3)}
                  >
                    <i class='bx bx-x'></i>
                  </ButtonDS>
                </>
              )}

              {item.status.id === 2 && item.link && (
                <ButtonDS
                  size='icon'
                  variant='primary'
                  onClick={(e) => {
                    e.preventDefault();
                    copyToClipboard(item.link, 'Link copiado com sucesso');
                  }}
                >
                  <i className='bx bx-copy-alt'></i>
                </ButtonDS>
              )}

              <ButtonDS
                size='icon'
                variant='primary'
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  setItemSelected(item);
                  setShowModalAffiliates(!showModalAffiliates);
                }}
              >
                <i class='bx bxs-user-detail'></i>
              </ButtonDS>
            </div>
          </div>
        );
      },
      center: true,
    },
  ]
);

const columnsManagement = memoizeOne((renderActions) => [
  {
    name: <RenderNameDataTable name='Usuário' iconClassName='bx bx-user' />,
    cell: (item) => (
      <div>
        {item.full_name} {item.email}
      </div>
    ),
  },
  {
    name: <RenderNameDataTable name='Produto' iconClassName='bx bx-cube' />,
    cell: (item) => item.product_name,
  },
  {
    name: <RenderNameDataTable name='Comissão' iconClassName='bx bx-dollar' />,
    cell: (item) =>
      item.commission_type !== `percentage`
        ? currency(item.commission_with_affiliate)
        : item.commission_with_affiliate + `%`,
  },
  {
    name: <RenderNameDataTable name='Status' iconClassName='bx bx-flag' />,
    cell: (item) => (
      <BadgeDS variant={item.status.key}>{item.status.label}</BadgeDS>
    ),
  },
  {
    name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
    cell: (item) =>
      (item.status.id === 1 || item.status.id === 2) && renderActions(item),
  },
]);

const index = () => {
  const [requesting, setRequesting] = useState(true);
  const [records, setRecords] = useState([]);
  const [recordsManagement, setRecordsManagement] = useState([]);
  const [activeManager, setActiveManager] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [countAffiliates, setCountAffiliates] = useState(0);
  const [loadingCountAffiliates, setLoadingCountAffiliates] = useState(false);
  const [showModalAffiliates, setShowModalAffiliates] = useState(false);
  const [itemSelected, setItemSelected] = useState(null);
  const [totalAfiliados, setTotalAfiliados] = useState(0);

  const customStyles = {
    headCells: {
      style: {
        justifyContent: 'center', // Centers the header text
      },
    },
    cells: {
      style: {
        justifyContent: 'center', // Centers the cell content
      },
    },
  };

  const fetchData = () => {
    setRequesting(true);
    api
      .get(`/managers`)
      .then((r) => {
        setRecords(r.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  };

  const fetchDataManagements = () => {
    setRequesting(true);
    api
      .get(`/managers/managements`)
      .then((r) => {
        setRecordsManagement(r.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
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
                setShowModal(true);
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
      .delete(
        '/products/managers/' +
          activeManager.product_uuid +
          `/` +
          activeManager.id
      )
      .then(() => {
        notify({
          message: 'Gerente cancelado com sucesso',
          type: 'success',
        });
        fetchDataManagements();
      })
      .catch((err) => {
        if (err.response.data.code === 400) {
          setAlert(err.response.data.message);
        }
        notify({ message: 'Falha ao cancelar gerente', type: 'error' });
      })
      .finally(() => setModalCancelShow(false));
  };

  const fetchCountAffiliates = (manager) => {
    setLoadingCountAffiliates(true);
    api
      .get(
        '/products/managers/' + manager.product_uuid + '/count/' + manager.id
      )
      .then((r) => setCountAffiliates(r.data.count))
      // eslint-disable-next-line
      .catch((err) => console.log(err))
      .finally(() => setLoadingCountAffiliates(false));
  };

  useEffect(() => {
    fetchData();
    fetchDataManagements();
  }, []);

  return (
    <>
      {showModal && (
        <>
          <ModalGeneric
            title={'Editar Gerente'}
            show={showModal}
            setShow={setShowModal}
            centered
          >
            <ModalManager
              show={showModal}
              setShow={setShowModal}
              activeManager={activeManager}
              setActiveManager={setActiveManager}
              uuidProduct={activeManager.product_uuid}
              requesting={requesting}
              setRequesting={setRequesting}
              alert={alert}
              setAlert={setAlert}
              records={recordsManagement}
              setRecords={setRecordsManagement}
              count={countAffiliates}
              loadingCount={loadingCountAffiliates}
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
          confirmText={activeManager.full_name}
          centered
        />
      )}

      {showModalAffiliates && (
        <ModalGeneric
          title={`Lista de Afiliados (${totalAfiliados})`}
          show={showModalAffiliates}
          setShow={setShowModalAffiliates}
          centered
          size='xl'
        >
          <ModalManagerAffiliates
            itemSelected={itemSelected}
            onTotalChange={setTotalAfiliados}
          />
        </ModalGeneric>
      )}

      <section id='pageManager'>
        <div className='page-title-wrap'>
          <PageTitle title='Gerentes' />
        </div>

        <Tabs
          defaultActiveKey='managers'
          id='uncontrolled-tab-example'
          className='mb-3'
          style={{ fontWeight: '500' }}
        >
          <Tab eventKey='managers' title='Meus Gerentes'>
            <div className='container-datatable card'>
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columnsManagement(renderActions)}
                data={recordsManagement}
                striped
                highlightOnHover
                progressPending={requesting}
                progressComponent={<Loader title='Carregando...' />}
                noDataComponent={<NoDataComponentContent />}
                responsive
                pagination
                paginationServer
                customStyles={customStyles}
              />
            </div>
          </Tab>

          <Tab eventKey='managements' title='Minhas Gerências'>
            <div className='container-datatable card'>
              <DataTable
                paginationComponentOptions={{
                  rowsPerPageText: 'Linhas por página',
                  rangeSeparatorText: 'de',
                  selectAllRowsItem: true,
                  selectAllRowsItemText: 'Todos',
                }}
                columns={columns(
                  setRecords,
                  showModalAffiliates,
                  setShowModalAffiliates,
                  setItemSelected
                )}
                data={records}
                striped
                highlightOnHover
                progressPending={requesting}
                progressComponent={<Loader title='Carregando...' />}
                noDataComponent={<NoDataComponentContent />}
                responsive
                customStyles={customStyles}
                pagination
                paginationServer
              />
            </div>
          </Tab>
        </Tabs>
      </section>
    </>
  );
};

export default index;

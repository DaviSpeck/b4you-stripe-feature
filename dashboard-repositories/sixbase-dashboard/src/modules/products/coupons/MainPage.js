import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { useParams } from 'react-router-dom';
import BadgeDS from '../../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../../jsx/components/design-system/ButtonDS';
import RenderNameDataTable from '../../../jsx/components/RenderNameDataTable';
import ConfirmAction from '../../../jsx/layouts/ConfirmAction';
import api from '../../../providers/api';
import formatDate from '../../../utils/formatters';
import Loader from '../../../utils/loader';
import { currency, notify } from '../../functions';
import NoDataComponentContent from '../../NoDataComponentContent';
import CouponCreated from './CouponCreated';
import ModalForm from './Form';

const columns = memoizeOne((renderActions) => [
  {
    name: <RenderNameDataTable name='Cupom' iconClassName='bx bxs-coupon' />,
    format: (item) => <div>{item.coupon}</div>,
    selector: 'coupon',
    minWidth: '200px',
  },
  {
    name: <RenderNameDataTable name='Desconto' iconClassName='bx bx-money' />,
    selector: 'percentage',
    format: (row) =>
      row.percentage ? `${row.percentage}%` : `${currency(row.amount)}`,
    center: true,
    minWidth: '150px',
  },
  {
    name: (
      <RenderNameDataTable name='Nº de usos' iconClassName='bx bx-grid-small' />
    ),
    selector: 'total_sold',
    format: (row) => row.total_sold,
    center: true,
    minWidth: '150px',
  },
  {
    name: <RenderNameDataTable name='Status' iconClassName='bx bx-stats' />,
    cell: (item) =>
      item.active ? (
        <BadgeDS variant='success'>Ativa</BadgeDS>
      ) : (
        <BadgeDS variant='light'>Inativa</BadgeDS>
      ),
    center: true,
    selector: 'active',
  },
  {
    name: (
      <RenderNameDataTable name='Expira em' iconClassName='bx bx-calendar' />
    ),
    format: (item) => (
      <>{item.expires_at ? formatDate(item.expires_at) : '-'}</>
    ),
    selector: 'expires_at',
    center: true,
    minWidth: '200px',
  },
  {
    name: (
      <RenderNameDataTable name='Último uso' iconClassName='bx bx-calendar' />
    ),
    format: (item) => <>{item.used_at ? formatDate(item.used_at) : '-'}</>,
    selector: 'used_at',
    center: true,
    minWidth: '200px',
  },
  {
    name: <RenderNameDataTable name='Ações' iconClassName='bx bxs-pencil' />,
    selector: (item) => renderActions(item),
    center: true,
  },
]);

const PageCoupons = () => {
  const { uuidProduct } = useParams();
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [modalCancelShow, setModalCancelShow] = useState(false);
  const [created, setCreated] = useState(null);
  const [openCreated, setOpenCreated] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [clearRowsToggle, setClearRowsToggle] = useState(false);
  const [bulkMode, setBulkMode] = useState(null); // 'selected' | 'all'
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const fetchCoupons = (coupon) => {
    setLoading(true);

    const url = coupon
      ? `/products/coupons/${uuidProduct}?coupon=${coupon}`
      : `/products/coupons/${uuidProduct}?size=${perPage}&page=${currentPage}`;

    api
      .get(url)
      .then((response) => {
        setRecords(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch((e) => {
        return e;
      })
      .finally(() => setLoading(false));
  };

  const deleteCoupon = async (data) => {
    setLoading(true);
    api
      .delete(`/products/coupons/${uuidProduct}/${data.uuid}`)
      .then(() => {
        fetchCoupons();
        setModalCancelShow(false);
        setShowModal(false);
        notify({ message: 'Salvo com sucesso', type: 'success' });
      })
      .catch((err) => {
        let message = 'Erro ao remover';
        if (err?.response?.data?.message) {
          message = err.response.data.message;
        }
        notify({ message, type: 'error' });
      })
      .finally(() => setLoading(false));
  };

  const renderActions = (coupon) => {
    return (
      <>
        <div className='d-flex justify-content-start'>
          <div className='mr-2'>
            <ButtonDS
              size={'icon'}
              variant='primary'
              onClick={() => {
                setActiveCoupon(coupon);
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
                setActiveCoupon(coupon);
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

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page - 1);
  };

  const handleSelectedRowsChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  const handleSearch = () => {
    if (!couponCode.trim()) {
      notify({ message: 'Digite o cupom', type: 'warn' });
    } else {
      fetchCoupons(couponCode);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkMode) return;

    const uuids =
      bulkMode === 'selected' ? selectedRows.map((item) => item.uuid) : null;

    if (bulkMode === 'selected' && (!uuids || uuids.length === 0)) {
      notify({ message: 'Selecione ao menos um cupom', type: 'warn' });
      setShowBulkConfirm(false);
      return;
    }

    try {
      setLoading(true);

      const url = `/products/coupons/${uuidProduct}`;
      const config = uuids ? { data: { uuids } } : undefined;

      const response = await api.delete(url, config);

      const affected =
        response?.data?.count ?? (uuids && uuids.length ? uuids.length : 0);

      notify({
        message: affected
          ? `Excluímos ${affected} cupom(s)`
          : 'Exclusão concluída',
        type: 'success',
      });

      setSelectedRows([]);
      setClearRowsToggle((prev) => !prev);
      fetchCoupons();
    } catch (err) {
      let message = 'Erro ao excluir cupons';
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      notify({ message, type: 'error' });
    } finally {
      setShowBulkConfirm(false);
      setBulkMode(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, perPage]);

  return (
    <section>
      <Row className='mb-3'>
        <Col md={12}>
          <Form.Group className='w-100 d-flex flex-column flex-md-row mb-0'>
            <Form.Control
              type='text'
              value={couponCode}
              placeholder='Digite o nome do cupom'
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ borderRadius: '8px', background: '#fff' }}
            />

            <ButtonDS
              onClick={handleSearch}
              size='sm'
              disabled={!couponCode}
              style={{
                minWidth: '150px',
              }}
              className='mt-2 mt-md-0 ml-md-2'
            >
              Pesquisar
            </ButtonDS>

            {couponCode && (
              <ButtonDS
                onClick={() => {
                  setCouponCode('');
                  fetchCoupons();
                }}
                variant='danger'
                size='sm'
                style={{
                  minWidth: '150px',
                }}
                className='mt-2 mt-md-0 ml-md-2'
              >
                Limpar busca
              </ButtonDS>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col className='d-flex justify-content-end flex-wrap'>
          <ButtonDS
            variant='danger'
            size='sm'
            disabled={!selectedRows.length || loading}
            className='mt-2 mt-md-0 ml-md-2'
            onClick={() => {
              setBulkMode('selected');
              setShowBulkConfirm(true);
            }}
          >
            Excluir selecionados
          </ButtonDS>

          <ButtonDS
            variant='danger'
            size='sm'
            disabled={(!totalRows && !records.length) || loading}
            className='mt-2 mt-md-0 ml-md-2'
            onClick={() => {
              setBulkMode('all');
              setShowBulkConfirm(true);
            }}
          >
            Excluir todos
          </ButtonDS>
        </Col>
      </Row>

      <Row>
        <Col>
          <div className='container-datatable card'>
            <DataTable
              paginationComponentOptions={{
                rowsPerPageText: 'Linhas por página',
                rangeSeparatorText: 'de',
                selectAllRowsItem: true,
                selectAllRowsItemText: 'Todos',
              }}
              columns={columns(renderActions)}
              data={records}
              striped
              keyField='uuid'
              selectableRows
              selectableRowsHighlight
              onSelectedRowsChange={handleSelectedRowsChange}
              clearSelectedRows={clearRowsToggle}
              highlightOnHover
              progressPending={loading}
              progressComponent={
                <Loader
                  title='Carregando cupons...'
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 210,
                  }}
                />
              }
              noDataComponent={<NoDataComponentContent />}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={perPage}
              onChangeRowsPerPage={handlePerRowsChange}
              onChangePage={handlePageChange}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <ButtonDS
            onClick={() => {
              setActiveCoupon(null);
              setShowModal(true);
            }}
            size='md'
          >
            Novo Cupom
          </ButtonDS>
        </Col>
      </Row>

      {showModal && (
        <ModalForm
          isOpen={showModal}
          setIsOpen={(reload = false) => {
            setShowModal(!showModal);
            if (reload) fetchCoupons();
          }}
          uuidProduct={uuidProduct}
          activeCoupon={activeCoupon}
          setOpenCreated={setOpenCreated}
          setCreated={setCreated}
          setActiveCoupon={setActiveCoupon}
          setModalCancelShow={setModalCancelShow}
        />
      )}

      {modalCancelShow && (
        <ConfirmAction
          title={'Apagar cupom'}
          show={modalCancelShow}
          setShow={setModalCancelShow}
          handleAction={() => deleteCoupon(activeCoupon)}
          confirmText={`${activeCoupon.coupon}`}
          description={`${activeCoupon.coupon}`}
          centered
        />
      )}

      <CouponCreated
        couponCode={created ?? null}
        show={openCreated}
        onClose={() => setOpenCreated(false)}
      />

      {showBulkConfirm && (
        <ConfirmAction
          title={
            bulkMode === 'all'
              ? 'Excluir todos os cupons?'
              : 'Excluir cupons selecionados?'
          }
          show={showBulkConfirm}
          setShow={setShowBulkConfirm}
          handleAction={handleBulkDelete}
          confirmText={
            bulkMode === 'all'
              ? 'Todos os cupons deste produto'
              : `Todos os selecionados`
          }
          description='Ação irreversivel. Cupons excluídos não poderão ser usados novamente.'
          centered
        />
      )}
    </section>
  );
};

export default PageCoupons;

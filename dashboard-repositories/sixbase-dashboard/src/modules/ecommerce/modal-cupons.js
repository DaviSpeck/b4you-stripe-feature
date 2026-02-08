import memoizeOne from 'memoize-one';
import { useEffect, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import ButtonDS from '../../jsx/components/design-system/ButtonDS';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import ConfirmAction from '../../jsx/layouts/ConfirmAction';
import api from '../../providers/api';
import formatDate from '../../utils/formatters';
import Loader from '../../utils/loader';
import { currency, notify } from '../functions'; 
import NoDataComponentContent from '../NoDataComponentContent';
import CouponCreated from '../products/coupons/CouponCreated';
import ModalForm from '../products/coupons/Form';
import ProductProvider from '../../providers/contextProduct';

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

const ModalCupons = ({ setShow, shop, embedded = false }) => {
  const productUuid = shop?.container_product?.uuid;
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
  const [bulkMode, setBulkMode] = useState(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [product, setProduct] = useState(null);

  const fetchCoupons = (coupon) => {
    if (!productUuid) return;
    setLoading(true);

    const url = coupon
      ? `/products/coupons/${productUuid}?coupon=${coupon}`
      : `/products/coupons/${productUuid}?size=${perPage}&page=${currentPage}`;

    api
      .get(url)
      .then((response) => {
        setRecords(response.data.rows);
        setTotalRows(response.data.count);
      })
      .catch((e) => {
        return e;
      })
      .finally(() => {
        setLoading(false);
        setInitialLoading(false);
      });
  };

  const fetchProduct = async () => {
    if (!productUuid) return;
    try {
      const response = await api.get(`/products/product/${productUuid}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
    }
  };

  useEffect(() => {
    if (productUuid) {
      fetchCoupons();
      fetchProduct();
    } else {
      setInitialLoading(false);
    }
  }, [productUuid, currentPage, perPage]);

  const deleteCoupon = async (data) => {
    if (!productUuid) return;
    setLoading(true);
    api
      .delete(`/products/coupons/${productUuid}/${data.uuid}`)
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

  if (initialLoading) {
    return <Loader title='Carregando cupons...' />;
  }

  if (!productUuid) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>Produto container não encontrado</p>
      </div>
    );
  }

  return (
    <ProductProvider value={{ product, setProduct }}>
      <ConfirmAction
        show={modalCancelShow}
        setShow={setModalCancelShow}
        handleAction={() => deleteCoupon(activeCoupon)}
        title='Remover cupom'
        textDetails='Deseja realmente remover este cupom?'
      />

      <Row className='mb-3'>
        <Col md={12} className='d-flex justify-content-between align-items-center'>
          <div>
            <h4>Cupons</h4>
            <small>
              Crie cupons de desconto para seus produtos e aumente suas vendas.
            </small>
          </div>
          <ButtonDS
            onClick={() => {
              setActiveCoupon(null);
              setShowModal(true);
            }}
          >
            <i className='bx bx-plus mr-1'></i>
            Novo Cupom
          </ButtonDS>
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col md={12}>
          <Form.Control
            type='text'
            placeholder='Buscar cupom...'
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              if (e.target.value.length >= 3) {
                fetchCoupons(e.target.value);
              } else if (e.target.value.length === 0) {
                fetchCoupons();
              }
            }}
          />
        </Col>
      </Row>

      <DataTable
        paginationComponentOptions={{
          rowsPerPageText: 'Linhas por página',
          rangeSeparatorText: 'de',
          selectAllRowsItem: false,
          selectAllRowsItemText: 'Todos',
        }}
        columns={columns(renderActions)}
        data={records}
        striped
        progressComponent={<Loader title='Carregando...' />}
        noDataComponent={<NoDataComponentContent />}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        selectableRows
        onSelectedRowsChange={({ selectedRows }) => {
          setSelectedRows(selectedRows);
        }}
        clearSelectedRows={clearRowsToggle}
      />

      {showModal && (
        <ModalForm
          isOpen={showModal}
          setIsOpen={(reload = false) => {
            setShowModal(false);
            if (reload) fetchCoupons();
          }}
          uuidProduct={productUuid}
          activeCoupon={activeCoupon}
          setOpenCreated={setOpenCreated}
          setCreated={setCreated}
          setActiveCoupon={setActiveCoupon}
          setModalCancelShow={setModalCancelShow}
        />
      )}

      {openCreated && (
        <CouponCreated
          couponCode={created ?? null}
          show={openCreated}
          onClose={() => {
            setOpenCreated(false);
            setCreated(null);
          }}
        />
      )}
    </ProductProvider>
  );
};

export default ModalCupons;

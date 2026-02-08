import memoizeOne from 'memoize-one';
import { useState } from 'react';
import { Button, Col, Form, Modal, Spinner } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import RenderNameDataTable from '../../jsx/components/RenderNameDataTable';
import api from '../../providers/api.js';
import Loader from '../../utils/loader';
import regexCoupons from '../../utils/regexCoupons.js';
import { currency } from '../functions';
import './ModalCoupons.css';
import PixImage from './PixImage.jsx';

const columnsCoupons = memoizeOne((copyToClipboard) => [
  {
    name: <RenderNameDataTable name='Cupom' iconClassName='bx bx-outline' />,
    selector: (item) => <div className='d-flex flex-wrap'>{item.coupon}</div>,
    width: '50%',
  },
  {
    name: <RenderNameDataTable name='Desconto' iconClassName='bx bx-money' />,
    selector: (item) => (
      <div className='d-flex flex-wrap'>
        {item.percentage > 0
          ? `${item.percentage}%`
          : `${currency(item.amount)}`}
      </div>
    ),
    width: '35%',
  },
  {
    name: <RenderNameDataTable name='Ações' />,
    selector: (item) => (
      <div
        className='d-flex'
        style={{
          width: '100%',
        }}
      >
        <Button
          variant={'primary'}
          onClick={(e) => {
            e.preventDefault();
            copyToClipboard(e, item.coupon);
          }}
          className='d-flex align-items-center'
          style={{
            borderRadius: '20px',
            height: '35px',
          }}
        >
          <i className='bx bx-copy-alt' style={{ fontSize: 21 }}></i>
        </Button>
      </div>
    ),
  },
]);

const ModalCoupons = ({
  show,
  setShow,
  size,
  coupons,
  couponsRules,
  copyToClipboard,
  fetchCoupons,
  productUuid,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(true);

  const [rule] = couponsRules;

  const createCoupon = () => {
    setLoading(true);
    const body = {
      coupon: coupon.trim(),
      id_rule: rule?.id,
    };
    api
      .post(`/market/coupon/${productUuid}`, body)
      .then(() => {
        setOpenModal(false);
        setError('');
        setCoupon('');
        fetchCoupons();
      })
      .catch((error) => {
        if (error && error.response && error.response.status === 400) {
          if (error.response.data.body) {
            setError(error.response.data.body.errors[0].coupon);
          } else {
            setError(error.response.data.message);
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCancel = () => {
    setCoupon('');
    setOpenModal(false);
    setShowInfo(true);
  };

  return (
    <Modal
      show={show}
      className='modal-filter'
      size={size}
      onHide={() => setShow(false)}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className='w-100 text-center color-coupon'>
          Cupons
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Modal
          show={openModal}
          className='modal-filter'
          size='lg'
          onHide={handleCancel}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title className='w-100 text-center color-coupon'>
              Novo Cupom
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Col xs={12}>
              <Form.Group>
                <label className='label-coupon' htmlFor=''>
                  Cupom
                </label>
                <Form.Control
                  name='coupon'
                  value={coupon}
                  onChange={(e) => {
                    e.preventDefault();
                    setCoupon(e.target.value);
                    const regex = regexCoupons(e.target.value);

                    if (!regex) {
                      setError(
                        'Permitido apenas número e letras (sem espaços ou caracteres especiais)'
                      );
                    } else {
                      setError('');
                    }
                  }}
                  className='input-coupon'
                  placeholder='Digite o nome do cupom'
                />
                {error && (
                  <span style={{ color: 'red', fontSize: '12px' }}>
                    * {error}
                  </span>
                )}
              </Form.Group>
            </Col>

            {showInfo && (
              <Col xs={12} className='mt-3 mb-3'>
                <div className='info-coupon'>
                  <button
                    className='close-info'
                    onClick={() => setShowInfo(false)}
                  >
                    X
                  </button>

                  <p>
                    Use no máximo 30 letras e/ou números, sem espaços ou
                    caracteres especiais{' '}
                  </p>
                  <p className='mt-1'>{'{.@!#$%&}'} Exemplo: B4YOU10</p>
                </div>
              </Col>
            )}

            <Col xs={12}>
              <h4 className='label-coupon'>Regras</h4>
              <ul className='details'>
                {rule?.percentage && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bxs-discount mr-2'></i>
                    <span>Desconto de {rule?.percentage}%</span>
                  </li>
                )}
                {rule?.amount > 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bxs-discount mr-2'></i>
                    <span>Desconto de {currency(rule?.amount)}</span>
                  </li>
                )}
                {rule?.min_items > 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-list-plus mr-2'></i>
                    <span>Mínimo de {rule?.min_items} itens na compra</span>
                  </li>
                )}
                {rule?.min_amount > 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-money mr-2'></i>
                    <span>
                      Mínimo de {currency(rule?.min_amount)} na compra
                    </span>
                  </li>
                )}
                {rule?.first_sale_only > 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bxs-user-check mr-2'></i>
                    <span>Uso somente na primeira compra</span>
                  </li>
                )}
                {rule?.single_use_by_client > 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-user mr-2'></i>
                    <span>Uso único por cliente</span>
                  </li>
                )}
                {rule?.free_shipping > 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-package mr-2'></i>
                    <span>Frete grátis</span>
                  </li>
                )}
                {rule?.override_cookie === 0 && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-cookie mr-2'></i>
                    <span>Sobreposição ao cookie</span>
                  </li>
                )}
                {rule?.payment_methods.includes('card') && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-credit-card-alt mr-2'></i>
                    <span>Cartão de crédito</span>
                  </li>
                )}
                {rule?.payment_methods.includes('billet') && (
                  <li className='d-flex align-items-center'>
                    <i className='bx bx-barcode mr-2'></i>
                    <span>Boleto</span>
                  </li>
                )}
                {rule?.payment_methods.includes('pix') && (
                  <li className='d-flex align-items-center'>
                    <PixImage size={12} className='mr-2' />
                    <span>Pix</span>
                  </li>
                )}
              </ul>
            </Col>

            <div className='d-flex flex-column flex-md-row mt-3 justify-content-between'>
              <Button
                size='sm'
                variant='danger'
                onClick={handleCancel}
                className='mb-2 mb-md-0'
                style={{
                  minWidth: '130px',
                  borderRadius: '20px',
                }}
              >
                Cancelar
              </Button>

              <Button
                size='sm'
                variant='success'
                onClick={createCoupon}
                disabled={
                  coupon.trim().length === 0 || loading || error.length > 0
                }
                style={{
                  minWidth: '130px',
                  borderRadius: '20px',
                }}
              >
                {loading ? (
                  <Spinner variant='light' animation='border' size='sm' />
                ) : (
                  'Criar'
                )}
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        <DataTable
          paginationComponentOptions={{
            rowsPerPageText: 'Linhas por página',
            rangeSeparatorText: 'de',
            selectAllRowsItem: true,
            selectAllRowsItemText: 'Todos',
          }}
          columns={columnsCoupons(copyToClipboard)}
          data={coupons}
          striped
          highlightOnHover
          progressComponent={<Loader title='Carregando cupons...' />}
          noDataComponent={
            <div className='no-data-component'>
              <div className='mr-3 not-found'>
                <div className='text-center'>
                  <div className='strong'>Nenhum cupom</div>
                  <span>para mostrar...</span>
                </div>
              </div>
            </div>
          }
        />

        <div className='d-flex justify-content-end mt-4'>
          <Button
            variant='success'
            size='sm'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              minWidth: '130px',
              borderRadius: '20px',
            }}
            onClick={() => setOpenModal(true)}
          >
            Criar novo cupom
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalCoupons;

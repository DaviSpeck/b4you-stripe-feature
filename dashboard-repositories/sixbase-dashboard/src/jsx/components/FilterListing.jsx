import moment from 'moment';
import { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import CalendarInline from '../../jsx/components/CalendarInline';
import FilterAbandonedCart from '../../modules/abandonedCart/FilterAbandonedCart';
import FilterAffiliates from '../../modules/affiliates/FilterAffiliates';
import FilterAffiliatesRequests from '../../modules/affiliates/FilterAffiliatesRequests';
import FilterDashboard from '../../modules/dashboard/FilterDashboard';
import FilterInvoices from '../../modules/invoices/FilterInvoices';
import FilterStudents from '../../modules/products/students/filter';
import FilterSales from '../../modules/sales/FilterSale';
import FilterSubscriptions from '../../modules/subscriptions/components/FilterSubscriptions';
import FilterWallet from '../../modules/wallet/FilterWallet';
import api from '../../providers/api';
import Loader from '../../utils/loader';
import ButtonDS from './design-system/ButtonDS';
const momentFormat = 'DD/MM/YYYY';

const minDate = moment().set('year', 2022).startOf('year').startOf('day');

const FilterListing = ({
  pageFilter,
  filterParams,
  setFilterParams,
  exportUrl,
  hideSearch,
  placeHolder = 'Buscar...',
  showFilter = true,
  calendar,
  showCalendar,
  setShowCalendar,
  exportData,
  exportLoading,
  configData = {
    start: moment().subtract(6, 'days'),
    end: moment().format(momentFormat),
    option: 3,
  },
  calendarFullWidth = false,
}) => {
  const [delayDebounce, setDelayDebounce] = useState(null);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalFilterShow, setModalFilterShow] = useState(false);
  const [filters, setFilters] = useState({});
  const [requesting, setRequesting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [selectedCupons, setSelectedCoupons] = useState([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(['paid']);
  const [utmParams, setUtmParams] = useState({});
  const [filteredValuesCount, setFilteredValuesCount] = useState(0);
  const [allSelectedCoupon, setAllSelectedCoupon] = useState('');
  const [filterDates, setFilterDates] = useState(configData);

  const { register, reset, getValues, setValue, handleSubmit } = useForm({
    mode: 'onChange',
  });

  const filterDatesParams = () => {
    return {
      startDate: moment(filterDates.start, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      endDate: moment(filterDates.end, 'DD/MM/YYYY').format('YYYY-MM-DD'),
    };
  };

  const removeFilters = () => {
    reset({});
    setFilters({});
    setFilterParams({});
    setSearchInputValue('');
    setSearchTerm('');
    setModalFilterShow(false);
    setSelectedAffiliate(null);
    setSelectedOffers([]);
    setSelectedCoupons([]);
    setAllSelectedCoupon(null);
    setSelectedProducts([]);
    setSelectedStatus([]);
    setSelectedPaymentMethod([]);
    setUtmParams([]);
    countFilteredValues(null);
  };

  const onSubmit = () => {
    prepareFilterParams(getValues());
  };

  const countFilteredValues = (params) => {
    let count = 0;

    if (params !== null) {
      params.forEach((value, key) => {
        if (
          key !== 'startDate' &&
          key !== 'endDate' &&
          key !== 'role' &&
          value.trim() !== ''
        ) {
          count += value.split(',').length;
        }
      });
    }

    setFilteredValuesCount(count);
  };

  const scheduleSearchUpdate = (value, delay) => {
    clearTimeout(delayDebounce);
    setDelayDebounce(
      setTimeout(() => {
        setSearchTerm(value);
      }, delay)
    );
  };

  const sanitizeParams = (obj = {}) => {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach((key) => {
      if (
        cleaned[key] === '' ||
        cleaned[key] === null ||
        typeof cleaned[key] === 'undefined'
      ) {
        delete cleaned[key];
      }
    });
    return cleaned;
  };

  const prepareFilterParams = () => {
    const productsUuid = selectedProducts.map((p) => p.value).join(',');
    const offers = selectedOffers.map((o) => o.value);
    const affiliates = selectedAffiliate?.value || '';
    const coupons = allSelectedCoupon || '';
    const input = searchTerm ? searchTerm.trim() : '';

    const commonData = {
      product: productsUuid,
      affiliates,
      offers,
      coupons,
      ...filterDatesParams(),
    };

    if (pageFilter === 'sales') {
      const data = {
        ...commonData,
        role: 'all',
        status: selectedStatus.join(','),
        paymentMethod: selectedPaymentMethod.join(','),
        ...utmParams,
      };

      const params = new URLSearchParams();

      Object.entries(data).forEach(([key, value]) => {
        params.set(key, value);
      });

      if (input) {
        params.set('input', input);
      }

      setFilterParams((prev) => {
        const merged = new URLSearchParams(params);
        if (prev instanceof URLSearchParams) {
          prev.forEach((value, key) => {
            if (!merged.has(key)) {
              merged.set(key, value);
            }
          });
        }
        return merged;
      });

      countFilteredValues(params);
    } else {
      let values = getValues();
      setFilters(values);

      if (pageFilter === 'sales' && Object.keys(values).length === 0) {
        values = { status: 'paid' };
      }

      const data = {
        ...values,
        ...commonData,
      };

      if (pageFilter === 'students') {
        if (input) {
          data.input = input;
        } else {
          delete data.input;
        }
        setFilterParams(sanitizeParams(data));
      } else {
        const params = new URLSearchParams();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            params.append(key, value);
          }
        });

        if (input) {
          params.append('input', input);
        }

        setFilterParams(params);
      }
    }

    setModalFilterShow(false);
  };

  const getComponent = () => {
    if (pageFilter === 'sales') {
      return (
        <FilterSales
          register={register}
          getValues={getValues}
          setValue={setValue}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          selectedAffiliate={selectedAffiliate}
          setSelectedAffiliate={setSelectedAffiliate}
          selectedOffers={selectedOffers}
          setSelectedOffers={setSelectedOffers}
          selectedCupons={selectedCupons}
          setSelectedCoupons={setSelectedCoupons}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          setUtmParams={setUtmParams}
          utmParams={utmParams}
          setAllSelectedCoupon={setAllSelectedCoupon}
        />
      );
    }
    if (pageFilter === 'abandonedCart') {
      return (
        <FilterAbandonedCart
          selectedOffers={selectedOffers}
          setSelectedOffers={setSelectedOffers}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'dashboard') {
      return (
        <FilterDashboard
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'wallet') {
      return (
        <FilterWallet
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'affiliates') {
      return (
        <FilterAffiliates
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'affiliatesRequests') {
      return (
        <FilterAffiliatesRequests
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'invoices') {
      return (
        <FilterInvoices
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'subscriptions') {
      return (
        <FilterSubscriptions
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
    if (pageFilter === 'students') {
      return (
        <FilterStudents
          register={register}
          getValues={getValues}
          setValue={setValue}
        />
      );
    }
  };

  const defineFilterColumn = () => {
    if (!exportUrl && hideSearch) {
      return 12;
    }
    if (exportUrl && hideSearch) {
      return 10;
    }
    if (!exportUrl && !hideSearch && !calendar) {
      return 4;
    }
    return 2;
  };

  useEffect(() => {
    if (modalFilterShow === true) {
      reset(filters);
    }
  }, [modalFilterShow]);

  useEffect(() => {
    prepareFilterParams();
  }, [filterDates]);

  useEffect(() => {
    if (searchTerm !== null) {
      prepareFilterParams();
    }
  }, [searchTerm]);

  return (
    <>
      {modalFilterShow && (
        <Modal
          show={modalFilterShow}
          className='modal-filter'
          onHide={() => setModalFilterShow(false)}
          centered
          size='lg'
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title className='filter-sales-header'>Filtrar</Modal.Title>
          </Modal.Header>
          <Modal.Body>{getComponent()}</Modal.Body>
          <Modal.Footer className='filter-sales-footer'>
            {pageFilter !== 'dashboard' && (
              <ButtonDS size={'sm'} variant='light' onClick={removeFilters}>
                Remover Filtros
              </ButtonDS>
            )}

            <ButtonDS
              size={'sm'}
              variant='success'
              onClick={handleSubmit(onSubmit)}
            >
              Aplicar Filtros
            </ButtonDS>
          </Modal.Footer>
        </Modal>
      )}

      <Loader title='Gerando arquivo excel...' fullscreen show={requesting} />

      <div className='data-filter'>
        <Row noGutters className='align-items-center w-100 mb-4'>
          {!hideSearch && (
            <Col
              className='col-search'
              lg={calendar ? 7 : 8}
              md={calendar ? 7 : 8}
              xs={calendar ? 7 : 8}
            >
              <div className='form-group'>
                <i
                  style={{ backgroundColor: 'transparent' }}
                  className='bx bx-search'
                />
                <Form.Control
                  value={searchInputValue}
                  placeholder={placeHolder}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInputValue(value);
                    if (pageFilter === 'students') {
                      scheduleSearchUpdate(value.trim(), 400);
                    } else {
                      scheduleSearchUpdate(value, 1000);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      const value = event.currentTarget.value;
                      clearTimeout(delayDebounce);
                      if (pageFilter === 'students') {
                        setSearchTerm(value.trim());
                      } else {
                        setSearchTerm(value);
                      }
                    }
                  }}
                />
              </div>
            </Col>
          )}

          {calendar && (
            <Col
              className='d-flex justify-content-end col-calendar'
              xs={
                calendarFullWidth
                  ? 12
                  : !hideSearch && calendar && !showFilter
                  ? 5
                  : 3
              }
            >
              <CalendarInline
                value={[filterDates.start, filterDates.end]}
                defaultActiveOption={filterDates.option}
                onChange={(e) => {
                  setFilterDates((prev) => ({
                    ...prev,
                    start: e[0],
                    end: e[1],
                  }));
                }}
                maxDate={new Date()}
                minDate={minDate}
                show={showCalendar}
                setShow={setShowCalendar}
                calendarSize={27}
              />
            </Col>
          )}

          {showFilter && (
            <Col
              xs={defineFilterColumn()}
              className='d-flex justify-content-end col-data-filter'
            >
              {pageFilter === 'subscriptions' && (
                <ButtonDS
                  iconRight='bx-export'
                  onClick={() => exportData(true)}
                  outline
                  className='mr-2'
                >
                  {exportLoading ? 'Aguarde...' : 'Exportar xlsx'}
                </ButtonDS>
              )}

              <ButtonDS
                iconRight='bx-filter-alt'
                onClick={() => setModalFilterShow(true)}
                id='button-filter'
              >
                Filtrar
                {pageFilter === 'sales' &&
                  (filteredValuesCount ? <div>{filteredValuesCount}</div> : '')}
              </ButtonDS>
            </Col>
          )}

          {exportUrl && (
            <Col xs={2} className='col-export d-flex justify-content-end'>
              <ButtonDS
                variant='success'
                className='d-flex align-items-center'
                onClick={() => {
                  const query = new URLSearchParams();
                  if (filterParams.size) {
                    query.append(
                      'product_uuid',
                      filterParams.get('product_uuid') || ''
                    );
                    query.append('types', filterParams.get('types') || '');
                    query.append('product', filterParams.get('product') || '');
                    query.append(
                      'affiliates',
                      filterParams.get('affiliates') || ''
                    );
                  }
                  api
                    .get(`${exportUrl}&${query.toString()}`, {
                      responseType: 'blob',
                    })
                    .then((r) => r.data)
                    .then((blob) => {
                      // Create blob link to download
                      const url = window.URL.createObjectURL(new Blob([blob]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `FileName.xlsx`);

                      // Append to html link element page
                      document.body.appendChild(link);

                      // Start download
                      link.click();

                      // Clean up and remove the link
                      link.parentNode.removeChild(link);
                    });
                }}
                iconLeft='bxs-file-export'
              >
                <span style={{ fontSize: 15 }}>Exportar</span>
              </ButtonDS>
            </Col>
          )}
        </Row>
      </div>
    </>
  );
};

export default FilterListing;

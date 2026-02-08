import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { MultiSelect } from 'react-multi-select-component';
import Select from 'react-select';
import api from '../../providers/api';
import { formattedFullName } from '../../utils/formattedName';
import Loader from '../../utils/loader';
import { FilterSwitchList } from './components/FilterSwitchList';
import { UTMField } from './components/UTMField';

const configSelect = {
  allItemsAreSelected: 'Todos estão selecionados',
  clearSearch: 'Limpar filtro',
  clearSelected: 'Limpar selecionado',
  noOptions: 'Sem opções',
  search: 'Buscar',
  selectAll: 'Selecionar todos',
  selectAllFiltered: 'Selecionar todos (com filtros)',
  selectSomeItems: 'Selecione...',
  create: 'Cadastrar',
};

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderRadius: '12px',
    height: '40px',
    borderColor: state.isFocused ? '#222' : '#dadce0',
    boxShadow: 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#222' : '#dadce0',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#aaa',
    fontSize: '14px',
    fontWeight: '400',
  }),
};

const FilterSales = ({
  register,
  selectedProducts,
  setSelectedProducts,
  selectedAffiliate,
  setSelectedAffiliate,
  selectedOffers,
  setSelectedOffers,
  selectedCupons,
  setSelectedCoupons,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  selectedStatus,
  setSelectedStatus,
  setUtmParams,
  utmParams,
  setAllSelectedCoupon,
}) => {
  const [activeProducts, setActiveProducts] = useState([]);
  const [filterProperties, setFilterProperties] = useState(null);
  const [offers, setOffers] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [show, setShow] = useState(false);
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [optionSelected, setOptionSelected] = useState();
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
  const [affiliates, setAffiliates] = useState([]);

  const optionsAffiliate = [
    { value: 'not-affiliates', label: 'Nenhum' },
    { value: 'all-affiliates', label: 'Todos' },
    { value: 'specific-affiliate', label: 'Afiliado específico' },
  ];

  const order = ['card', 'pix', 'billet'];

  const paymentsMethodsSorted = filterProperties?.paymentMethods?.sort(
    (a, b) => {
      const aIndex = order.indexOf(a.key);
      const bIndex = order.indexOf(b.key);

      return (
        (aIndex === -1 ? Infinity : aIndex) -
        (bIndex === -1 ? Infinity : bIndex)
      );
    }
  );

  const handleCouponChange = (selected) => {
    const allCouponsSelected = selected.length === activeCoupons.length;
    setAllSelectedCoupon(
      allCouponsSelected ? 'all' : selected.map((o) => o.label)
    );
    setSelectedCoupons(selected);
  };

  const handleUTMChange = (e) => {
    const { name, value } = e.target;
    setUtmParams((prev) => ({ ...prev, [name]: value }));
  };

  const loadAffiliates = async (search = '') => {
    try {
      setLoadingAffiliates(true);
      const response = await api.get('sales/filters', {
        params: {
          search,
        },
      });

      const affiliatesData = response.data.affiliates.map((a) => ({
        value: a.uuid,
        label: `${formattedFullName(a.full_name)} - ${a.email}`,
      }));

      setAffiliates(affiliatesData);
      setLoadingAffiliates(false);
    } catch (error) {
      setLoadingAffiliates(false);
      return error;
    }
  };

  useEffect(() => {
    api
      .get('sales/filters', {
        params: {
          search: '',
        },
      })
      .then((r) => {
        setFilterProperties(r.data);
        setActiveProducts(
          r.data.products.all.map((item) => ({
            label: item.name,
            value: item.id,
            id: item.id,
          }))
        );
      })
      .catch((error) => {
        return error;
      });

    api.get('sales/filters/offers').then((r) => {
      setOffers(r.data.offers);
      const products = selectedProducts.map((p) => p.id);
      if (products.length > 0) {
        const productOffers = r.data.offers.filter((o) =>
          products.includes(o.id_product)
        );
        setActiveOffers(
          productOffers.map((o) => ({
            label: o.name,
            value: o.id,
            id_product: o.id_product,
          }))
        );
      } else {
        setActiveOffers(
          r.data.offers.map((o) => ({
            label: o.name,
            value: o.id,
            id_product: o.id_product,
          }))
        );
      }
    });

    api.get('sales/filters/coupons').then((r) => {
      setCoupons(r.data.coupons);
      setActiveCoupons(
        r.data.coupons.map((c) => ({
          label: `${c.coupon}`,
          value: c.id,
        }))
      );
    });

    setUtmParams({
      src: '',
      sck: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
    });
  }, []);

  useEffect(() => {
    const products = selectedProducts.map((p) => p.id);

    if (products.length > 0) {
      const productOffers = offers.filter((o) =>
        products.includes(o.id_product)
      );
      setActiveOffers(
        productOffers.map((o) => ({
          label: o.name,
          value: o.id,
          id_product: o.id_product,
        }))
      );
      setSelectedOffers((prevOffers) => {
        const previous = prevOffers.filter((o) =>
          products.includes(o.id_product)
        );
        return previous;
      });
      setSelectedCoupons((prevCoupons) => {
        const previous = prevCoupons.filter((o) =>
          products.includes(o.id_product)
        );
        return previous;
      });
    } else {
      setActiveOffers(
        offers.map((o) => ({
          label: o.name,
          value: o.id,
          id_product: o.id_product,
        }))
      );
    }

    setActiveCoupons(
      coupons.map((o) => ({
        label: `${o.coupon}`,
        value: o.id,
        id_product: o.id_product,
      }))
    );
  }, [selectedProducts]);

  useEffect(() => {
    if (affiliateSearch.length > 8) {
      loadAffiliates(affiliateSearch);
    }
  }, [affiliateSearch]);

  useEffect(() => {
    if (
      !selectedAffiliate &&
      optionSelected?.value !== 'specific-affiliate' &&
      !optionSelected?.value
    ) {
      setSelectedAffiliate(null);
      setAffiliates([]);
    }
  }, [optionSelected]);

  useEffect(() => {
    if (
      selectedAffiliate &&
      selectedAffiliate.value !== 'not-affiliates' &&
      selectedAffiliate.value !== 'all-affiliates'
    ) {
      setOptionSelected({
        value: 'specific-affiliate',
        label: 'Afiliado específico',
      });

      setAffiliates([selectedAffiliate]);
    } else if (
      selectedAffiliate &&
      (selectedAffiliate.value === 'not-affiliates' ||
        selectedAffiliate.value === 'all-affiliates')
    ) {
      setOptionSelected(selectedAffiliate);
      setAffiliates([]);
    }
  }, [selectedAffiliate]);

  if (!filterProperties) return <Loader title='Carregando...' />;

  return (
    <div className='filter-sales'>
      <Row>
        <Col md={12}>
          <div className='form-group'>
            <label htmlFor='' className='label-filter'>
              Produtos
            </label>
            <MultiSelect
              className='filter-sales'
              options={activeProducts}
              value={selectedProducts}
              onChange={setSelectedProducts}
              overrideStrings={configSelect}
            />
          </div>
        </Col>

        <Col md={12}>
          <div className='form-group'>
            <label htmlFor='' className='label-filter'>
              Ofertas
            </label>
            <MultiSelect
              className='filter-sales'
              options={activeOffers}
              value={selectedOffers}
              onChange={setSelectedOffers}
              overrideStrings={configSelect}
            />
          </div>
        </Col>
      </Row>

      <div className='form-group mt-2 mb-0'>
        <label className='label-filter'>Método de Pagamento</label>
        <Row>
          {paymentsMethodsSorted.map((item) => (
            <FilterSwitchList
              key={item.key}
              item={item}
              checked={selectedPaymentMethod.includes(item.key)}
              prefix='paymentMethod'
              onChange={(checked) => {
                setSelectedPaymentMethod((prev) =>
                  checked
                    ? [...prev, item.key]
                    : prev.filter((el) => el !== item.key)
                );
              }}
            />
          ))}
        </Row>
      </div>

      <div className='form-group mt-2'>
        <label className='label-filter'>Status</label>
        <Row>
          {filterProperties.salesStatus.map((item) => (
            <FilterSwitchList
              key={item.key}
              item={item}
              checked={selectedStatus.includes(item.key)}
              prefix='status'
              onChange={(checked) => {
                setSelectedStatus((prev) =>
                  checked
                    ? [...prev, item.key]
                    : prev.filter((el) => el !== item.key)
                );
              }}
            />
          ))}
        </Row>
      </div>

      <button className='btn-show' onClick={() => setShow(!show)}>
        {show ? 'Exibir menos' : 'Exibir mais'}

        {show ? (
          <i className='bx bx-chevron-up ml-2' />
        ) : (
          <i className='bx bx-chevron-down ml-2' />
        )}
      </button>

      <div className={`expandable ${show ? 'show' : ''}`}>
        {show && (
          <div>
            <div className='form-group mt-4'>
              <label htmlFor='' className='label-filter'>
                Cupons
              </label>

              <MultiSelect
                className='filter-sales'
                options={activeCoupons}
                value={selectedCupons}
                overrideStrings={configSelect}
                onChange={handleCouponChange}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='' className='label-filter'>
                Afiliados
              </label>

              <Select
                className='filter-sales'
                styles={customStyles}
                options={optionsAffiliate}
                value={optionSelected}
                onChange={(option) => {
                  setOptionSelected(option);

                  if (option.value && option.value !== 'specific-affiliate') {
                    setSelectedAffiliate(option);
                  } else {
                    setSelectedAffiliate(null);
                  }
                }}
                isClearable
                placeholder='Selecione como deseja filtrar o afiliado'
              />
            </div>

            {optionSelected?.value === 'specific-affiliate' && (
              <div className='form-group mt-2'>
                <Select
                  className='filter-sales'
                  styles={customStyles}
                  isLoading={loadingAffiliates}
                  onInputChange={(value) => setAffiliateSearch(value)}
                  options={affiliates}
                  value={selectedAffiliate}
                  onChange={(option) => setSelectedAffiliate(option)}
                  noOptionsMessage={() => 'Nenhum afiliado encontrado'}
                  placeholder='Ex: afiliado@email.com'
                  isClearable
                />
              </div>
            )}

            <div className='form-group mt-4 mb-0'>
              <label className='label-filter'>Parâmetros de UTM</label>

              <Row className='url-params'>
                {Object.entries(utmParams).map(([key, value]) => (
                  <UTMField
                    key={key}
                    name={key}
                    label={key}
                    register={register}
                    value={value}
                    onChange={handleUTMChange}
                  />
                ))}
              </Row>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSales;

import { useEffect, useState, useCallback } from 'react';
import { Card, Carousel, Col, Row, Spinner } from 'react-bootstrap';
import BadgeDS from '../../jsx/components/design-system/BadgeDS';
import { currency } from '../functions';
import api from '../../providers/api';
import FilterMarket from './FilterMarket';
import placeholderMarket from '../../images/placeholderMarket.png';
import LoadingIconB4Y from '../../jsx/components/LoadingIconB4Y';
import SearchNotFound from '../../images/search-not-found.png';
import { v4 as uuid } from 'uuid';

const tabs = [
  { id: 0, label: 'Recomendados', route: 'recommended' },
  { id: 1, label: 'Mais Vendidos', route: 'top' },
  { id: 2, label: 'Recentes', route: 'recents' },
];

const market = () => {
  const [activeTab, setActiveTab] = useState(0);

  const [search, setSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [commissionFilter, setCommisionFilter] = useState(0);

  const [tableData, setTableData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [isInitialLoading, setInitialLoading] = useState(true);
  const [isDataLoading, setDataLoading] = useState(true);

  const handleGetTableData = useCallback(async () => {
    try {
      setDataLoading(true);

      const searchParams = new URLSearchParams({
        size: 12,
        product: productFilter,
        commission: commissionFilter,
      });

      searchParams.set('page', currentPage - 1);

      // eslint-disable-next-line no-extra-boolean-cast
      if (Boolean(search)) {
        searchParams.set('searchTerm', search);
      }

      const { data } = await api.get(
        `/market/${tabs[activeTab].route}?${searchParams.toString()}`
      );

      if (activeTab === 1) {
        setTableData((prev) => ({
          ...prev,
          rows: data.rows,
          lastPage: Math.ceil(data.rows.length / 12),
        }));
      }

      if (activeTab !== 1) {
        setTableData(data);
      }
    } catch (error) {
      return error;
    } finally {
      setDataLoading(false);
      setInitialLoading(false);
    }
  }, [currentPage, search, productFilter, commissionFilter, activeTab]);

  useEffect(() => {
    handleGetTableData();
  }, [currentPage, search, productFilter, commissionFilter, activeTab]);

  useEffect(() => {
    if (activeTab !== 1) return;
  }, [activeTab, currentPage]);

  if (isInitialLoading || !tableData) {
    return (
      <div className='loading'>
        <LoadingIconB4Y />
      </div>
    );
  }

  const itemsPerPage = 12;
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageEnd = currentPage * itemsPerPage;

  let tableDataMostSaller = tableData.rows.slice(pageStart, pageEnd);

  if (search) {
    tableDataMostSaller = tableDataMostSaller.filter((item) =>
      item.product.name.includes(search)
    );
  }

  if (commissionFilter !== 0) {
    tableDataMostSaller = tableDataMostSaller.sort((a, b) => {
      if (commissionFilter === 1) {
        return b.maxCommission - a.maxCommission;
      }
      if (commissionFilter === 2) {
        return a.maxCommission - b.maxCommission;
      }
    });
  }

  return (
    <div id='page_market'>
      <h2 className='mb-3'>Vitrine</h2>
      <market.Banners />
      <Card>
        <div className='b4y-header-card'>
          <div className='filter-tab-market d-flex justify-content-between align-items-center'>
            <div className='pr-2'>
              <h3>Qual produto você está procurando?</h3>
              <p>Aqui você encontra os melhores produtos para se afiliar</p>
            </div>

            <div>
              <FilterMarket
                commission={commissionFilter}
                productFilter={productFilter}
                isProductFilter={activeTab !== 1}
                onSearch={(value) => {
                  setSearch(value);
                  setCurrentPage(1);
                }}
                onCommission={(value) => {
                  setCommisionFilter(value);
                  setCurrentPage(1);
                }}
                onProductFilter={(value) => {
                  setProductFilter(value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
        <Card.Body>
          <Row>
            <Col>
              <div className='list-tabs d-flex'>
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(1);
                      setActiveTab(tab.id);
                    }}
                  >
                    <div>{tab.label}</div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
          <Row className='mt-5'>
            {!isDataLoading && tableData.rows.length === 0 && (
              <market.ProductEmpty />
            )}
            {isDataLoading && (
              <div
                style={{
                  width: '100%',
                  height: '400px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Spinner animation='border' role='status'></Spinner>
              </div>
            )}
            <Col>
              <div className='list-products'>
                {activeTab === 1 &&
                  tableDataMostSaller.map((item) => (
                    <market.CardProduct key={item.id} item={item} />
                  ))}
                {activeTab !== 1 &&
                  tableData.rows &&
                  !isDataLoading &&
                  tableData.rows?.map((item) => (
                    <market.CardProduct key={item.id} item={item} />
                  ))}
              </div>
            </Col>
          </Row>
          {tableData && (
            <Row>
              <Col md={12} className='mb-4 mt-5'>
                <market.PageChangeActions
                  isPrevPage={tableData.isPrevPage}
                  isNextPage={tableData.isNextPage}
                  currentPage={currentPage}
                  amount={tableData.lastPage}
                  isDisabled={isDataLoading || tableData.rows.length === 0}
                  onPageChange={(value) => setCurrentPage(value)}
                />
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// eslint-disable-next-line react/display-name
market.Banners = function () {
  const [imagesDesktop, setImagesDesktop] = useState([]);
  const [imagesMobile, setImagesMobile] = useState([]);

  const [isBannersLoading, setIsBannersLoading] = useState(true);

  const handleGetBanners = async () => {
    try {
      const { data } = await api.get('market/banners');
      setImagesDesktop(data.filter((item) => item.type.type === 'desktop'));
      setImagesMobile(data.filter((item) => item.type.type === 'mobile'));
    } catch (error) {
      return error;
    } finally {
      setIsBannersLoading(false);
    }
  };

  useEffect(() => {
    handleGetBanners();
  }, []);

  if (isBannersLoading) {
    return (
      <div
        style={{
          width: '100%',
          height: '350px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
          backgroundColor: '#e8e8e8',
        }}
      >
        <Spinner animation='border' role='status'></Spinner>
      </div>
    );
  }

  return (
    <>
      {/* Banners Desktop */}
      <div
        className={`desktop ${imagesMobile.length > 0 ? '' : 'desktop-full'}`}
      >
        {imagesDesktop.length === 1 && (
          <a
            key={imagesDesktop[0].uuid}
            href={imagesDesktop[0].url || `#`}
            target={imagesDesktop[0].url && `_blank`}
            className='d-flex mb-3'
            rel='noreferrer'
          >
            <img src={imagesDesktop[0].file} style={{ width: '100%' }} />
          </a>
        )}
        {imagesDesktop.length > 1 && (
          <Carousel className='mb-3'>
            {imagesDesktop.map((image) => (
              <Carousel.Item key={image.uuid}>
                <a
                  href={image.url || `#`}
                  target={image.url && `_blank`}
                  className='d-flex'
                  rel='noreferrer'
                >
                  <img src={image.file} style={{ width: '100%' }} />
                </a>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </div>

      {/* Banners Mobile */}
      <div className='mobile'>
        {imagesMobile.length === 1 && (
          <a
            key={imagesMobile[0].uuid}
            href={imagesMobile[0].url || `#`}
            target={imagesMobile[0].url && `_blank`}
            className='d-flex mb-3'
            rel='noreferrer'
          >
            <img src={imagesMobile[0].file} style={{ width: '100%' }} />
          </a>
        )}
        {imagesMobile.length > 1 && (
          <Carousel className='mb-3'>
            {imagesMobile.map((image) => (
              <Carousel.Item key={image.uuid}>
                <a
                  href={image.url || `#`}
                  target={image.url && `_blank`}
                  className='d-flex'
                  rel='noreferrer'
                >
                  <img src={image.file} style={{ width: '100%' }} />
                </a>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </div>
    </>
  );
};

// eslint-disable-next-line react/display-name
market.CardProduct = function (props) {
  const { item } = props;

  const productLink = item?.manager_link
    ? item.manager_link
    : `/vitrine/produto/${item?.product?.slug}/${item?.product?.uuid}`;

  return (
    <a key={item?.product?.uuid} className='product' href={productLink}>
      {item?.product?.cover && item?.product?.cover.length > 1 ? (
        <Carousel indicators={false}>
          {item?.product?.cover.map((image) => (
            <Carousel.Item key={image.uuid}>
              <img src={image.file} style={{ width: '100%' }} />
            </Carousel.Item>
          ))}
        </Carousel>
      ) : (
        <img
          src={
            item?.product?.cover.length > 0
              ? item?.product?.cover[0].file
              : placeholderMarket
          }
          style={{ width: '100%' }}
        />
      )}

      <div className='content'>
        {item.temperatura && (
          <div className='d-block'>
            <BadgeDS className='badge' variant='danger' size='lg'>
              <i class='bx bxs-hot mr-1'></i>
              {item.temperatura}
            </BadgeDS>
          </div>
        )}
        <div className='label'>{item?.product?.name}</div>
        <div className='text'>Comissão de até:</div>
        <div className='price'>{currency(item?.maxCommission)}</div>
        <div className='text'>Preço máximo até {currency(item?.maxPrice)}</div>
      </div>
    </a>
  );
};

// eslint-disable-next-line react/display-name
market.PageChangeActions = function (props) {
  const {
    isPrevPage,
    isNextPage,
    amount,
    isDisabled,
    currentPage,
    onPageChange,
  } = props;

  const arrPages = Array.from({ length: amount }).map((_, i) => (
    <span
      key={uuid()}
      className='page-number'
      onClick={() => !isDisabled && onPageChange(i + 1)}
      style={{
        backgroundColor:
          currentPage === i + 1 || isDisabled ? '#8080801c' : 'transparent',
      }}
    >
      {i + 1}
    </span>
  ));

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <button
        className='btn-change-page prev'
        disabled={!isPrevPage || isDisabled}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>
      {currentPage >= 5 && (
        <>
          <span
            className='page-number'
            style={{
              backgroundColor: isDisabled ? '#8080801c' : 'transparent',
            }}
            onClick={() => onPageChange(1)}
          >
            1
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'end',
              fontSize: '1.5rem',
              height: 'content-fit',
              padding: '0px 8px',
            }}
          >
            ...
          </span>
        </>
      )}
      {arrPages.length < 6 && arrPages}
      {arrPages.length >= 6 &&
        currentPage !== amount &&
        arrPages.slice(
          currentPage > 4 ? currentPage - 3 : 0,
          currentPage > 4 ? currentPage + 2 : 6
        )}
      {arrPages.length >= 6 &&
        currentPage === amount &&
        arrPages.slice(currentPage - 4, currentPage)}
      {arrPages.length > 6 && currentPage + 2 < amount && (
        <>
          <span
            style={{
              display: 'flex',
              alignItems: 'end',
              fontSize: '1.5rem',
              height: 'content-fit',
              padding: '0px 8px',
            }}
          >
            ...
          </span>
          <span
            className='page-number'
            style={{
              backgroundColor: isDisabled ? '#8080801c' : 'transparent',
            }}
            onClick={() => onPageChange(amount)}
          >
            {amount}
          </span>
        </>
      )}

      <button
        className='btn-change-page next'
        disabled={!isNextPage || isDisabled}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próximo
      </button>
    </div>
  );
};

// eslint-disable-next-line react/display-name
market.ProductEmpty = function () {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '350px',
        gap: '16px',
      }}
    >
      <img src={SearchNotFound} style={{ width: '70px' }} />
      <h4 style={{ color: 'gray' }}>Nenhum produto encontrado</h4>
    </div>
  );
};

export default market;

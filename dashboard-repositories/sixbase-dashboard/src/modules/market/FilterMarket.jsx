import { useEffect, useRef } from 'react';
import { Container, Form, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { IoClose } from 'react-icons/io5';

const FilterMarket = (props) => {
  const {
    commission,
    productFilter,
    isProductFilter,
    onSearch,
    onCommission,
    onProductFilter,
  } = props;

  const debounceTimeout = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  useEffect(() => {
    return () => clearTimeout(debounceTimeout.current);
  }, []);

  return (
    <>
      <div className='d-flex list-nav'>
        <div className='col-search'>
          <div
            className='d-flex flex-row mx-auto'
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {isProductFilter && productFilter !== 'all' && (
                  <FilterMarket.OptionSelected
                    label={productFilter}
                    onClick={() => onProductFilter('all')}
                  />
                )}
                {isProductFilter && productFilter === 'all' && (
                  <Navbar
                    expand='lg'
                    className='bg-body-tertiary'
                    style={{
                      margin: '0px',
                      padding: '0px',
                    }}
                  >
                    <Container>
                      <Navbar
                        id='basic-navbar-nav'
                        className='basic-navbar-nav'
                      >
                        <Nav className='me-auto'>
                          <NavDropdown title='Produto' id='basic-nav-dropdown'>
                            <NavDropdown.Item
                              className={
                                productFilter === 'digital' && ' active'
                              }
                              onClick={() => onProductFilter('digital')}
                            >
                              Digital
                            </NavDropdown.Item>
                            <NavDropdown.Item
                              className={
                                productFilter === 'physical' && ' active'
                              }
                              onClick={() => onProductFilter('physical')}
                            >
                              Físico
                            </NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar>
                    </Container>
                  </Navbar>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {commission > 0 && (
                  <FilterMarket.OptionSelected
                    label={commission === 1 ? 'Máximo' : 'Mínimo'}
                    onClick={() => onCommission(0)}
                  />
                )}
                {commission === 0 && (
                  <Navbar
                    expand='lg'
                    id='bg-body-tertiary'
                    className='basic-navbar-nav'
                  >
                    <Container>
                      <Navbar
                        id='basic-navbar-nav'
                        style={{
                          margin: '0px',
                          padding: '0px',
                        }}
                      >
                        <Nav className='me-auto'>
                          <NavDropdown title='Comissão' id='basic-nav-dropdown'>
                            <NavDropdown.Item
                              className={commission === 1 && ' active'}
                              onClick={() => onCommission(1)}
                            >
                              Máxima
                            </NavDropdown.Item>
                            <NavDropdown.Item
                              className={commission === 2 && ' active'}
                              onClick={() => onCommission(2)}
                            >
                              Mínima
                            </NavDropdown.Item>
                          </NavDropdown>
                        </Nav>
                      </Navbar>
                    </Container>
                  </Navbar>
                )}
              </div>
            </div>
          </div>
          <div className='form-group mb-0 searchInputMarket'>
            <Form.Control
              placeholder='Buscar...'
              id='searchInput'
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line react/display-name
FilterMarket.OptionSelected = function (props) {
  const { label, onClick } = props;

  return (
    <div
      style={{
        backgroundColor: '#80808036',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 'fit-content',
        padding: '4px 8px',
        borderRadius: '4px',
        margin: '0px 15px',
      }}
    >
      <span style={{ display: 'block' }}>{label}</span>
      <IoClose
        size={20}
        style={{
          cursor: 'pointer',
        }}
        onClick={onClick}
      />
    </div>
  );
};

export default FilterMarket;

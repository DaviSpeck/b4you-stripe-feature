import { Card, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useParams } from 'react-router-dom';
import { useProduct } from '../../providers/contextProduct';
import { useUser } from '../../providers/contextUser';

const Navigation = ({ active }) => {
  const style = {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '20px',
    paddingRight: '10px',
  };

  const { uuidProduct } = useParams();
  const { product } = useProduct();
  const { user } = useUser();

  return (
    <>
      <Card>
        <Card.Body style={style}>
          <Nav
            className='nav-product'
            variant='pills'
            defaultActiveKey={active}
          >
            <Nav.Item>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/geral`}>
                <Nav.Link>Geral</Nav.Link>
              </LinkContainer>
            </Nav.Item>

            <NavDropdown
              title='Checkout'
              id='basic-nav-dropdown'
              className={
                (window.location.pathname.includes('/config') ||
                  window.location.pathname.includes('checkout')) &&
                'active'
              }
            >
              <LinkContainer to={`/produtos/editar/${uuidProduct}/config`}>
                <NavDropdown.Item>Configurações</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/checkout`}>
                <NavDropdown.Item>Personalizar</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>

            {!product.has_shop_integration && (
              <Nav.Item>
                <LinkContainer to={`/produtos/editar/${uuidProduct}/ofertas`}>
                  <Nav.Link>Ofertas</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            )}

            <Nav.Item>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/cupons`}>
                <Nav.Link>Cupons</Nav.Link>
              </LinkContainer>
            </Nav.Item>

            <Nav.Item>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/pages`}>
                <Nav.Link>Páginas</Nav.Link>
              </LinkContainer>
            </Nav.Item>

            {product.type !== 'payment_only' &&
              product.type !== 'physical' &&
              product.type !== 'ebook' && (
                <NavDropdown
                  title='Área de membros'
                  id='basic-nav-dropdown'
                  className={
                    window.location.pathname.includes('conteudo') && 'active'
                  }
                >
                  <LinkContainer
                    to={`/produtos/editar/${uuidProduct}/conteudo-config`}
                  >
                    <NavDropdown.Item>Configurações</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer
                    to={`/produtos/editar/${uuidProduct}/conteudo-builder`}
                  >
                    <NavDropdown.Item>Personalizar</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer
                    to={`/produtos/editar/${uuidProduct}/conteudo-integrations`}
                  >
                    <NavDropdown.Item>Integrações</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer
                    to={`/produtos/editar/${uuidProduct}/conteudo-comments`}
                  >
                    <NavDropdown.Item>Comentários</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer
                    to={`/produtos/editar/${uuidProduct}/conteudo-recommended`}
                  >
                    <NavDropdown.Item>Recomendados</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer
                    to={`/produtos/editar/${uuidProduct}/conteudo`}
                  >
                    <NavDropdown.Item>Conteúdo</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}

            {product.type === 'ebook' && (
              <Nav.Item>
                <LinkContainer to={`/produtos/editar/${uuidProduct}/conteudo`}>
                  <Nav.Link>Conteúdo</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            )}

            <Nav.Item>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/vitrine`}>
                <Nav.Link>Vitrine</Nav.Link>
              </LinkContainer>
            </Nav.Item>

            <NavDropdown
              title='Parcerias'
              id='basic-nav-dropdown'
              className={
                (window.location.pathname.includes('afiliados') ||
                  window.location.pathname.includes('coproducao')) &&
                'active'
              }
            >
              <LinkContainer to={`/produtos/editar/${uuidProduct}/afiliados`}>
                <NavDropdown.Item>Afiliados</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/coproducao`}>
                <NavDropdown.Item>Coprodução</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/gerentes`}>
                <NavDropdown.Item>Gerentes</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to={`/produtos/editar/${uuidProduct}/fornecedor`}>
                <NavDropdown.Item>Fornecedor</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>

            {['video', 'ebook'].includes(product.type) && (
              <NavDropdown
                title='Clientes'
                id='basic-nav-dropdown'
                className={
                  (window.location.pathname.includes('turmas') ||
                    window.location.pathname.includes('alunos') ||
                    window.location.pathname.includes('clientes')) &&
                  'active'
                }
              >
                {product.type === 'video' && (
                  <LinkContainer to={`/produtos/editar/${uuidProduct}/turmas`}>
                    <NavDropdown.Item>Turmas</NavDropdown.Item>
                  </LinkContainer>
                )}
                <LinkContainer
                  to={`/produtos/editar/${uuidProduct}/${product.type === 'physical' ? 'clientes' : 'alunos'
                    }`}
                >
                  <NavDropdown.Item>
                    {product.type === 'physical' ? 'Clientes' : 'Alunos'}
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            )}

            {product.type === 'physical' && (
              <Nav.Item>
                <LinkContainer to={`/produtos/editar/${uuidProduct}/rastreio`}>
                  <Nav.Link>Rastreio</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            )}
            {user?.upsell_native_enabled && <Nav.Item>
              <LinkContainer
                to={`/produtos/editar/${uuidProduct}/upsell-nativo`}
              >
                <Nav.Link>Upsell Nativo</Nav.Link>
              </LinkContainer>
            </Nav.Item>}
          </Nav>
        </Card.Body>
      </Card>
    </>
  );
};

export default Navigation;

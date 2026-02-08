import { memo, useEffect, useRef, useState } from 'react';
import {
  Overlay,
  SidebarItem,
  SidebarItemChildren,
  SidebarItemChildrenWrapper,
  SidebarItemList,
  SidebarWrapper,
} from './sidebar-style';
import { BiSolidChevronDown, BiSolidChevronUp } from 'react-icons/bi';
import { SidebarOptions } from './sidebarOption';
import { v4 as uuid } from 'uuid';
import { NavLink } from 'react-router-dom/cjs/react-router-dom.min';
import coin from '../../../images/coin.gif';
import { useUser } from '../../../providers/contextUser';
import api from '../../../providers/api';
import { Spinner, Modal, Button } from 'react-bootstrap';

export const NewSidebar = (props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const [loadingManager, setLoadingManager] = useState(false);
  const [showNoManagerModal, setShowNoManagerModal] = useState(false);
  const [hasManager, setHasManager] = useState(false);

  const { isMobileOpen, onClose } = props;

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    api
      .get('users/manager')
      .then((response) => {
        if (response.data?.has_manager && response.data?.manager?.phone) {
          setHasManager(true);
        } else {
          setHasManager(false);
        }
      })
      .catch(() => {
        setHasManager(false);
      });
  }, [user]);

  const handleContactManager = () => {
    setLoadingManager(true);
    api
      .get('users/manager')
      .then((response) => {
        if (response.data?.manager?.phone) {
          let phone = response.data?.manager?.phone?.replace(/\D/g, '') ?? '';

          if (!phone.startsWith('55')) {
            phone = `55${phone}`;
          }
          
          const message = encodeURIComponent('Olá, sou usuário da B4You. Gostaria de tirar uma dúvida...');
          const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
          window.open(whatsappUrl, '_blank');
        } else {
          setShowNoManagerModal(true);
        }
      })
      .catch(() => {
        setShowNoManagerModal(true);
      })
      .finally(() => {
        setLoadingManager(false);
      });
  };

  useEffect(() => {
    if (innerWidth < 990) setIsMobile(true);
    window.addEventListener('resize', () => {
      if (innerWidth < 990) setIsMobile(true);
      if (innerWidth > 990) {
        setIsMobile(false);
        setIsOpen(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    if (isMobileOpen) {
      document.body.style.overflowY = 'hidden';
      return;
    }
    document.body.style.overflowY = 'auto';
  }, [isMobile, isMobileOpen]);

  useEffect(() => {
    if (!sidebarRef.current && !isMobile) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;

      if (width > 49) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    });

    observer.observe(sidebarRef.current);

    return () => observer.disconnect();
  }, []);

  const isSidebarOpen = !isMobile ? isOpen : isMobileOpen;

  return (
    <>
      <Overlay isMobile={isMobile} isOpen={isSidebarOpen} onClick={onClose} />
      <SidebarWrapper
        ref={sidebarRef}
        isOpen={isSidebarOpen}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className='sidebarLogo' />
        <SidebarItemList>
          {SidebarOptions.map((option) => {
            if (option.children && option.children.length > 0) {
              return (
                <NewSidebar.ItemWithChildren
                  isShowText={isSidebarOpen}
                  {...option}
                />
              );
            }

            return (
              <NewSidebar.Item
                key={uuid()}
                isShowText={isSidebarOpen}
                {...option}
              />
            );
          })}
          {hasManager && (
            <div onClick={handleContactManager} style={{ cursor: 'pointer', position: 'relative', zIndex: 10, marginBottom: '1px' }}>
              <SidebarItem isShowText={isSidebarOpen}>
                <div className='icon-label-container'>
                  <div>
                    {loadingManager ? (
                      <Spinner animation='border' size='sm' />
                    ) : (
                      <i className='bx bxl-whatsapp icon'></i>
                    )}
                  </div>
                  <span className='label'>Falar com Gerente</span>
                </div>
              </SidebarItem>
            </div>
          )}
        </SidebarItemList>
        {isSidebarOpen && (
          <div className='indique indique-2' style={{ marginTop: hasManager ? '1px' : '0' }}>
            <NavLink to='/indique-e-ganhe'>
              <img src={coin} className='coin' />
              <div
                className='text'
                style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                Indique e ganhe
              </div>
              <small
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                Quero saber mais
              </small>
            </NavLink>
          </div>
        )}
      </SidebarWrapper>

      <Modal show={showNoManagerModal} onHide={() => setShowNoManagerModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Gerente não disponível</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>No momento você não possui um gerente atribuído.</p>
          <p>Entre em contato com o suporte para mais informações.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' onClick={() => setShowNoManagerModal(false)}>
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

NewSidebar.Item = (props) => {
  const { icon, label, isShowText, redirect } = props;

  const isSelected = redirect === location.pathname;

  if (label === 'Ajuda') {
    return (
      <a href='https://ajuda.b4you.com.br/' target='_blank'>
        <SidebarItem isSelected={isSelected} isShowText={isShowText}>
          <div className='icon-label-container'>
            <div>{icon}</div>
            <span className='label'>{label}</span>
          </div>
        </SidebarItem>
      </a>
    );
  }

  return (
    <div>
      <NavLink to={redirect} exact aria-expanded='false'>
        <SidebarItem isSelected={isSelected} isShowText={isShowText}>
          <div className='icon-label-container'>
            <div>{icon}</div>
            <span className='label'>{label}</span>
          </div>
        </SidebarItem>
      </NavLink>
    </div>
  );
};

NewSidebar.ItemWithChildren = memo((props) => {
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [shouldDisplay, setShouldDisplay] = useState(isItemOpen);
  const [isRendering, setIsRendering] = useState(true);

  const { icon, label, isShowText, children } = props;

  const isSelected = children.find(
    (option) => option.redirect === location.pathname
  );

  const handleAnimationEnd = () => {
    if (!isItemOpen) {
      setShouldDisplay(false);
    }
  };

  useEffect(() => {
    setIsRendering(false);

    if (isItemOpen) {
      setShouldDisplay(true);
    }
  }, [isItemOpen]);

  useEffect(() => {
    if (!isSelected) return;

    setIsItemOpen(true);
  }, [isShowText]);

  return (
    <div>
      <SidebarItem
        isShowText={isShowText}
        onTouch={() => setIsItemOpen((prevValue) => !prevValue)}
        onClick={() => setIsItemOpen((prevValue) => !prevValue)}
        isChildren={true}
        isOpen={isItemOpen && isShowText}
        isSelected={isSelected}
      >
        <div className='item-wrapper'>
          <div className='icon-label-container'>
            <div>{icon}</div>
            <span className='label'>{label}</span>
          </div>
          <div className='arrow-container'>
            {!isItemOpen && <BiSolidChevronDown />}
            {isItemOpen && <BiSolidChevronUp />}
          </div>
        </div>
        <SidebarItemChildrenWrapper
          isRendering={isRendering}
          shouldDisplay={shouldDisplay}
          isShowText={isShowText}
          isOpen={isItemOpen && isShowText}
          onAnimationEnd={handleAnimationEnd}
        >
          {children.map((option) => (
            <NavLink
              key={uuid()}
              to={option.redirect}
              exact
              aria-expanded='false'
            >
              <SidebarItemChildren>{option.label}</SidebarItemChildren>
            </NavLink>
          ))}
        </SidebarItemChildrenWrapper>
      </SidebarItem>
    </div>
  );
});

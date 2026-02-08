import { Modal, Overlay } from 'react-bootstrap';

import trancosoImg from '../../../images/trancoso-img.png';
import logoB4yHouse from '../../../images/logo-b4y-house.png';
import './style.scss';
import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';

export const ModalTrancoso = () => {
  const [showModal, setShowModal] = useState(false);

  const LOCAL_STORAGE_KEY = 'trancosoModalLastShown';

  useEffect(() => {
    const startToShow = new Date('2025-12-10T21:00:00-03:00');
    const endToShow = new Date('2025-12-16T00:00:00-03:00');
    const now = new Date();
    const brAdjusted = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    if (now < startToShow || now > endToShow || showModal) return;

    const checkModal = () => {
      const lastShown = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (!lastShown) {
        localStorage.setItem(LOCAL_STORAGE_KEY, brAdjusted);
        setShowModal(true);
      }

      const oneHour = 60 * 60 * 1000;

      if (lastShown) {
        const lastShowTime = new Date(lastShown);

        if (now.getTime() > lastShowTime.getTime() * oneHour * 48) {
          localStorage.setItem(LOCAL_STORAGE_KEY, brAdjusted);
          setShowModal(true);
        }
      }
    };

    const interval = setInterval(checkModal, 1000);
    checkModal();

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    const now = new Date();
    const brAdjusted = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    localStorage.setItem(LOCAL_STORAGE_KEY, brAdjusted.toISOString());
    setShowModal(false);
  };

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      centered
      className='wrapper-trancoso'
    >
      <Modal.Body className='body-modal-trancoso'>
        <div className='wrapper-header-image'>
          <img className='header-image' src={trancosoImg} alt='' />
          <button className='btn-close' onClick={handleClose}>
            <MdClose />
          </button>
        </div>
        <div className='trancoso-content'>
          <img className='img-b4y-house' src={logoB4yHouse} alt='' />
          <div className='divider-trancoso' />
          <div className='wrapper-text'>
            <h2 className='title-trancoso'>
              <span>O QUE ACONTECEU EM TRANCOSO</span> (NÃO) FICA EM TRANCOSO?
            </h2>
            <p>
              <span>Assista o EP1</span> e descubra tudo que aconteceu
              na Creators House.
            </p>
            <a href='https://www.youtube.com/watch?v=BbypqarkUN8'>
              Quero assistir
            </a>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

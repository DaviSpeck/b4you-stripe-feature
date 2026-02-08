import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import ButtonDS from './design-system/ButtonDS';
import { getVideoConfig, getVideoUrl } from './VideoConfig';
import userStorage from '../../utils/storage';
import './WelcomeVideoModal.scss';

const WelcomeVideoModal = ({ show, onClose, userType, onVideoComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(5);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const videoConfig = getVideoConfig(userType);
  const isMessageContent = videoConfig?.contentType === 'message';
  const currentVideoUrl =
    videoConfig && !isMessageContent ? getVideoUrl(videoConfig) : null;

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkIsMobile();

    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!show) {
      setCanSkip(false);
      setSkipCountdown(5);
      setIsVideoReady(false);
      setShouldPlay(false);
      return;
    }
  }, [show]);

  useEffect(() => {
    if (!isVideoReady || !show || isMessageContent) {
      return;
    }

    const timer = setInterval(() => {
      setSkipCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVideoReady, show]);

  if (!videoConfig) {
    return null;
  }

  const handleVideoEnd = () => {
    setVideoEnded(true);
    if (onVideoComplete) {
      onVideoComplete();
    }
  };

  const handleSkip = () => {
    userStorage.setWelcomeVideoWatched(userType);
    onClose();
  };

  const handleContinue = () => {
    userStorage.setWelcomeVideoWatched(userType);

    if (videoConfig?.giftUrl) {
      window.open(videoConfig.giftUrl, '_blank');
    }

    onClose();
  };

  const handleMessageAction = (actionConfig) => {
    userStorage.setWelcomeVideoWatched(userType);

    if (actionConfig?.action === 'link' && actionConfig?.url) {
      window.open(actionConfig.url, '_blank', 'noopener,noreferrer');
    }

    if (actionConfig?.action === 'close') {
      onClose();
      return;
    }

    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={() => {}}
      centered
      size='lg'
      className='welcome-video-modal'
      backdrop='static'
      keyboard={false}
    >
      <Modal.Header className='welcome-video-header'>
        <Modal.Title className='welcome-video-title text-white'>
          <i className={`bx ${videoConfig.titleIcon} mr-3`}></i>
          {videoConfig.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body
        className={`welcome-video-body ${
          isMessageContent ? 'message-mode' : ''
        }`}
      >
        {isMessageContent ? (
          <div className='welcome-message'>
            {videoConfig?.messageHeading && (
              <h4 className='message-heading'>{videoConfig.messageHeading}</h4>
            )}
            <div className='message-paragraphs'>
              {videoConfig?.messageParagraphs?.map((paragraph, index) => (
                <p key={index} className='text-muted'>
                  {paragraph}
                </p>
              ))}
            </div>
            <div className='message-actions'>
              <ButtonDS
                variant='primary'
                style={{
                  backgroundColor: '#001432',
                  borderColor: '#001432',
                  color: '#ffffff',
                }}
                onClick={() => handleMessageAction(videoConfig?.primaryAction)}
              >
                {videoConfig?.primaryAction?.label || 'Entrar na conta'}
              </ButtonDS>
              <ButtonDS
                variant='primary'
                style={videoConfig?.secondaryAction?.style}
                onClick={() =>
                  handleMessageAction(videoConfig?.secondaryAction)
                }
              >
                {videoConfig?.secondaryAction?.label || 'Conversar'}
              </ButtonDS>
            </div>
          </div>
        ) : (
          <>
            <div className='video-description mb-3'>
              <p className='text-muted'>{videoConfig.description}</p>
              <small className='text-muted'>
                Duração: {videoConfig.duration}
              </small>
            </div>

            <div className='video-container'>
              {currentVideoUrl ? (
                <>
                  {!isVideoReady && !isMobile && (
                    <div
                      className='video-loading d-flex justify-content-center align-items-center'
                      style={{ height: '400px' }}
                    >
                      <div
                        className='spinner-border text-primary'
                        role='status'
                      ></div>
                    </div>
                  )}
                  <div style={{ display: isVideoReady ? 'block' : 'none' }}>
                    <ReactPlayer
                      url={currentVideoUrl}
                      width='100%'
                      height={isMobile ? '200px' : '400px'}
                      controls={true}
                      playing={shouldPlay}
                      onReady={() => {
                        setIsVideoReady(true);
                        setShouldPlay(true);
                      }}
                      onEnded={handleVideoEnd}
                      config={{
                        file: {
                          attributes: {
                            controlsList: 'nodownload',
                            preload: 'auto',
                            muted: false,
                          },
                        },
                      }}
                    />
                  </div>
                </>
              ) : (
                !isMobile && (
                  <div
                    className='video-loading d-flex justify-content-center align-items-center'
                    style={{ height: '400px' }}
                  >
                    <div
                      className='spinner-border text-primary'
                      role='status'
                    ></div>
                  </div>
                )
              )}
            </div>

            {!videoEnded && isVideoReady && (
              <div className='video-message mt-3 text-center'>
                <p className='text-muted mb-2'>
                  <i className='bx bx-gift me-2'></i>
                  Assista até o final para receber um presente especial
                </p>
              </div>
            )}

            {videoEnded && (
              <div className='video-complete mt-3'>
                <div className='alert alert-success'>
                  <i className='bx bx-check-circle me-2'></i>
                  Vídeo concluído! Você está pronto para começar.
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      {!isMessageContent && (
        <Modal.Footer className='welcome-video-footer'>
          {!videoEnded ? (
            !canSkip ? (
              <ButtonDS variant='outline' disabled={true}>
                Pular em {skipCountdown}s
              </ButtonDS>
            ) : (
              <ButtonDS variant='outline' onClick={handleSkip}>
                Pular
              </ButtonDS>
            )
          ) : (
            <ButtonDS variant='primary' onClick={handleContinue}>
              <i className='bx bx-gift me-2'></i>
              {videoConfig?.giftButtonText || 'Receber presente'}
            </ButtonDS>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default WelcomeVideoModal;

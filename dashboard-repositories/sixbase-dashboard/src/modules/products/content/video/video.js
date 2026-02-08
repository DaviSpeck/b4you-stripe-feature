import { Col, Form, ProgressBar, Row } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../../../providers/api';
import * as tus from 'tus-js-client';
import imageCloud from '../../../../images/feather-cloud.svg';
import Dropzone from 'react-dropzone';
import { notify } from '../../../functions';
import Loader from '../../../../utils/loader';
import ModalVideoLesson from './modal-video-lesson';
import Select from 'react-select';
import ButtonDS from '../../../../jsx/components/design-system/ButtonDS';
import ReactPlayer from 'react-player';

const resolveSRC = (video) => {
  if (video.type && video.type.id === 5) return video.link;
  if (video.uri) return 'https://vimeo.com/' + video.uri.substring(8);
  return video.embed_url;
};

const Video = ({
  uuidProduct,
  activeLesson,
  setRequesting,
  setSuccessReturn,
  message,
  setSelectedVideo,
  selectedVideo,
  embedUrl,
  setEmbedUrl,
  videoRef,
  requesting,
}) => {
  const [videoSendProgress, setVideoSendProgress] = useState(null);
  const [uploadUrl, setUploadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModalVideoLesson, setShowModalVideoLesson] = useState(null);
  const [videos, setVideos] = useState([]);

  const [file, setFile] = useState();
  useEffect(() => {
    api
      .get(`/products/gallery/${uuidProduct}`)
      .then((r) => {
        setVideos(r.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  }, []);

  useEffect(() => {
    if (uploadUrl) {
      setUploading(true);
      const upload = new tus.Upload(file, {
        uploadUrl: uploadUrl,
        onError: () => {},
        onProgress: function (bytesUploaded, bytesTotal) {
          let percentage = (bytesUploaded / bytesTotal) * 100;
          setVideoSendProgress(percentage);
        },
        onSuccess: () => {
          api
            .put(
              '/products/lessons/' +
                uuidProduct +
                '/' +
                activeLesson.uuid +
                '/confirm/upload'
            )
            .then(() => {
              setSuccessReturn(true);
            })
            .finally(() => setUploading(false));
        },
      });
      upload.start();
    }
  }, [uploadUrl]);

  const onChangeFile = (acceptedFiles) => {
    setLoading(true);
    setRequesting('put');
    api
      .put('/products/lessons/' + uuidProduct + '/' + activeLesson.uuid, {
        video_size: acceptedFiles[0].size,
        video_title: acceptedFiles[0].name,
      })
      .then((response) => {
        setUploadUrl(response.data.vimeo.upload_link);
        setLoading(false);
        setRequesting(null);
      })
      .catch(() => {
        notify({
          message: `Erro ao enviar vídeo`,
          type: 'error',
        });
        setLoading(false);
        setRequesting(null);
      });
    setFile(acceptedFiles[0]);
  };

  const deleteVideo = () => {
    setRequesting('delete');
    api
      .delete(
        '/products/lessons/' +
          uuidProduct +
          '/' +
          activeLesson.uuid +
          '/remove/video'
      )
      .then(() => {
        activeLesson.vimeo.video_uploaded = false;
        activeLesson.vimeo.embed_url = null;
        setRequesting(null);
      })
      .catch(() => {
        setRequesting(null);
      });
  };

  const translateDurationToStringTime = (durationInSeconds) => {
    if (!durationInSeconds) return '00:00:00';
    const time = new Date(durationInSeconds * 1000).toISOString().substr(11, 8);
    const [hours, minutes, seconds] = time.split(':');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    api
      .get(`/products/gallery/${uuidProduct}`)
      .then((r) => {
        setVideos(r.data);
      })
      .catch(() => {})
      .finally(() => setRequesting(false));
  }, []);

  const colourStyles = {
    option: (styles, { isFocused }) => {
      return {
        ...styles,
        backgroundColor: isFocused ? '#dddddd' : null,
        borderBottom: '1px solid #ddd',
        color: '#333333',
        padding: '5px 0',
      };
    },
  };

  const formatOptionLabel = ({ thumbnail, duration, title }) => (
    <div className='video-custom-select'>
      <div className='wrap-thumb'>
        <img src={thumbnail} />
      </div>
      <div className='text'>
        <div className='title'>{title || 'Sem título'}</div>
        <div className='duration'>
          {translateDurationToStringTime(duration)}
        </div>
      </div>
    </div>
  );

  const CustomControl = () => (
    <Select
      value={selectedVideo}
      placeholder={'Escolher vídeo...'}
      formatOptionLabel={formatOptionLabel}
      options={videos}
      styles={colourStyles}
      onChange={(value) => setSelectedVideo(value)}
      filterOption={(option, inputValue) =>
        option.data.title.toLowerCase().includes(inputValue)
      }
      noOptionsMessage={() => 'Nenhuma aula encontrada.'}
    />
  );

  const getVideoUrl = () => {
    if (
      activeLesson.vimeo &&
      activeLesson.vimeo.type &&
      activeLesson.vimeo.type.id === 5 &&
      activeLesson.vimeo.link &&
      activeLesson.vimeo.link.trim() !== ''
    ) {
      return { url: activeLesson.vimeo.link, isPanda: true };
    }

    if (selectedVideo && selectedVideo.type && selectedVideo.type.id === 5) {
      return { url: resolveSRC(selectedVideo), isPanda: true };
    }

    if (activeLesson.gallery_video) {
      const galleryVideo = videos.find(
        (v) => v.uuid === activeLesson.gallery_video
      );
      if (galleryVideo && galleryVideo.type && galleryVideo.type.id === 5) {
        return { url: resolveSRC(galleryVideo), isPanda: true };
      }
    }

    if (embedUrl) {
      return { url: embedUrl, isPanda: false };
    }

    if (activeLesson.vimeo && activeLesson.vimeo.embed_url) {
      return { url: activeLesson.vimeo.embed_url, isPanda: false };
    }

    return null;
  };

  const videoData = getVideoUrl();
  const hasVideoUploaded =
    activeLesson.vimeo && activeLesson.vimeo.video_uploaded;
  const hasEmbedUrl = activeLesson.vimeo && activeLesson.vimeo.embed_url;
  const hasValidEmbedUrl = embedUrl && ReactPlayer.canPlay(embedUrl);
  const hasPandaVideo = videoData && videoData.isPanda && videoData.url;
  const hasNormalVideo = hasVideoUploaded || hasEmbedUrl || hasValidEmbedUrl;

  const videoStatus = activeLesson.vimeo && activeLesson.vimeo.video_status;
  const isVideoProcessing =
    videoStatus === 'waiting upload' || videoStatus === 'uploading';

  const hasValidVideoUrl =
    videoData && videoData.url && videoData.url.trim() !== '';

  const isPandaVideoReady =
    hasPandaVideo &&
    activeLesson.vimeo &&
    activeLesson.vimeo.link &&
    activeLesson.vimeo.link.trim() !== '' &&
    activeLesson.vimeo.video_status !== 'waiting upload' &&
    activeLesson.vimeo.video_uploaded === true;

  const shouldShowPlayer =
    (!videoStatus || !isVideoProcessing) &&
    hasValidVideoUrl &&
    (isPandaVideoReady || (hasNormalVideo && !hasPandaVideo));

  return (
    <div className='video-edit doc'>
      {isVideoProcessing && (
        <div
          className='mb-4'
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            minHeight: '450px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              color: '#6c757d',
              marginBottom: '1rem',
            }}
          >
            <i className='bx bx-loader-alt bx-spin' />
          </div>
          <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>
            Vídeo sendo processado
          </h4>
          <p style={{ color: '#6c757d', fontSize: '14px', margin: 0 }}>
            Seu vídeo está sendo processado. Por favor, atualize a página para
            verificar quando estiver pronto.
          </p>
        </div>
      )}
      {shouldShowPlayer && videoData && !isVideoProcessing && (
        <div className='mb-4'>
          {isPandaVideoReady ? (
            <iframe
              src={videoData.url}
              width='100%'
              height='450px'
              frameBorder='0'
              allow='autoplay; fullscreen; picture-in-picture'
              allowFullScreen
              style={{ backgroundColor: '#1b1b1b', borderRadius: '8px' }}
            />
          ) : (
            <ReactPlayer
              url={videoData.url}
              controls={true}
              width={'100%'}
              height={'450px'}
              style={{ backgroundColor: '#1b1b1b' }}
              ref={videoRef}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    showinfo: 1,
                    rel: 0,
                  },
                },
                vimeo: {
                  playerOptions: {},
                },
              }}
            />
          )}
        </div>
      )}
      {shouldShowPlayer &&
        !videoData &&
        hasVideoUploaded &&
        !isVideoProcessing && (
          <div className='mb-4'>
            <ReactPlayer
              url={
                embedUrl || (activeLesson.vimeo && activeLesson.vimeo.embed_url)
              }
              controls={true}
              width={'100%'}
              height={'450px'}
              style={{ backgroundColor: '#1b1b1b' }}
              ref={videoRef}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    showinfo: 1,
                    rel: 0,
                  },
                },
                vimeo: {
                  playerOptions: {},
                },
              }}
            />
          </div>
        )}
      <>
        {!activeLesson.vimeo.video_uploaded &&
          !activeLesson.vimeo.embed_url &&
          !uploadUrl && (
            <Row>
              <Col md={12}>
                <Dropzone
                  onDrop={(acceptedFiles, rejectedFiles) =>
                    onChangeFile(acceptedFiles, rejectedFiles)
                  }
                  multiple={false}
                  accept={'.mp4,.mkv,.avi,.wmv,.mov'}
                  className='drop-zone-sb'
                >
                  {({
                    getRootProps,
                    getInputProps,
                    isDragActive,
                    isDragReject,
                  }) => {
                    return (
                      <div
                        {...getRootProps()}
                        isDragActive={isDragActive}
                        isDragReject={isDragReject}
                      >
                        <div className='form-group'>
                          <div className='c-img'>
                            <div
                              className={
                                isDragActive
                                  ? 'dragActive input-image'
                                  : 'input-image'
                              }
                            >
                              {isDragActive && (
                                <div className='dragActiveMessage'>
                                  <i className='bx bx-upload'></i>
                                  <div>Solte seu arquivo aqui</div>
                                </div>
                              )}
                              {loading && (
                                <div className='dragActiveMessage'>
                                  <Loader />
                                </div>
                              )}
                              {uploading && (
                                <div className='dragActiveMessage'>
                                  <i className='bx bx-upload'></i>
                                  <div>Enviando arquivo</div>
                                </div>
                              )}
                              <div className='left'>
                                <img src={imageCloud} />
                              </div>
                              <div className='right'>
                                <h4>Anexar novo vídeo</h4>
                                <p>MP4, WMV, MKV, AVI ou MOV</p>
                                <div
                                  className={
                                    'input-default btn btn-outline-primary'
                                  }
                                >
                                  Selecionar arquivo
                                </div>
                                <input {...getInputProps()} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </Dropzone>
              </Col>
              <Col md={6} lg={6}>
                <div className='attach-right'>
                  <h4>Escolher um vídeo da galeria</h4>
                  <p>MP4, WMV, MKV, AVI ou MOV</p>
                  <CustomControl />
                </div>
              </Col>
              <Col>
                <Form.Group>
                  <div className='attach-right'>
                    <h4>URL</h4>
                    <p>Youtube, Vimeo ou Panda</p>
                    <Form.Control
                      name='embed_url'
                      type='text'
                      value={embedUrl}
                      placeholder='https://youtu.be/seu-video'
                      onChange={(e) => {
                        e.preventDefault();
                        setEmbedUrl(e.target.value);
                      }}
                    />
                    {embedUrl && !ReactPlayer.canPlay(embedUrl) && (
                      <div className='form-error'>Insira uma URL válida</div>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>
          )}
      </>
      {(activeLesson.vimeo.video_uploaded || activeLesson.vimeo.embed_url) && (
        <div className='mb-4'>
          <ButtonDS
            onClick={deleteVideo}
            variant='danger'
            size='sm'
            iconLeft='bx bx-trash-alt'
            outline
            disabled={requesting}
          >
            {!requesting ? 'Remover vídeo' : 'Removendo'}
          </ButtonDS>
        </div>
      )}
      {videoSendProgress && (
        <>
          <ProgressBar
            now={videoSendProgress}
            label={`${videoSendProgress.toFixed(2)}%`}
            style={{ height: 16 }}
          />
        </>
      )}
      {message && videoSendProgress === 100 && (
        <>
          <div
            className='alert alert-success alert-xs d-flex mt-2 mb-1'
            style={{
              alignItems: 'center',
              padding: '.75rem 1.0em',
              fontSize: 14,
              fontWeight: '400',
              backgroundColor: '#CBEDD9',
              border: 0,
            }}
          >
            <i
              className='bx bxs-check-circle'
              style={{
                fontSize: '26px',
                color: '#149247 ',
                marginRight: '8px',
              }}
            />
            <span className='text-success d-block' style={{ color: '#149247' }}>
              O seu video foi enviado com sucesso!
            </span>
          </div>
          <div className='mb-4 mt-2' style={{ fontSize: '14px' }}>
            Seu vídeo está sendo processado, para visualizá-lo na aula, feche
            esta janela e abra novamente.
          </div>
        </>
      )}
      {message && videoSendProgress > 0 && videoSendProgress < 100 && (
        <div
          className='alert alert-warning alert-xs d-flex mt-4 mb-4'
          style={{
            alignItems: 'center',
            padding: '.75rem 1.0em',
            fontSize: 14,
            border: '1px solid #f3d1d9',
          }}
        >
          <i className='bx bx-error mr-2' style={{ fontSize: '26px' }} />
          <span
            style={{
              color: '#422E00',
            }}
          >
            <strong>Aviso</strong>: Não feche a janela até terminar todos os
            uploads
          </span>
        </div>
      )}
      {showModalVideoLesson && (
        <ModalVideoLesson setShow={setShowModalVideoLesson} />
      )}
    </div>
  );
};

export default Video;

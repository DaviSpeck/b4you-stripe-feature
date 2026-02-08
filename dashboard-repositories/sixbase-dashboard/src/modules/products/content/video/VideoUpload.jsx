import { useState, useEffect } from 'react';
import { Form, ProgressBar } from 'react-bootstrap';
import api from '../../../../providers/api';
import './videoUpload.scss';
import * as tus from 'tus-js-client';
import { notify } from '../../../functions';
import Title from './Title';

const VideoUpload = ({
  file,
  uuidProduct,
  lessons,
  removeVideoFromArray,
  setData,
}) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [videoSendProgress, setVideoSendProgress] = useState(0);
  const [controlProgress, setControlProgress] = useState('progress');
  const [isShown, setIsShown] = useState(false);

  const getUploadLink = async () => {
    api
      .post(`/products/gallery/${uuidProduct}/single`, {
        title: file.name,
        video_size: file.size,
      })
      .then((r) => {
        setVideo((prevVideo) => ({
          ...prevVideo,
          ...r.data,
        }));
        setData((prevData) =>
          prevData.map((item) => {
            if (item === file) {
              return { ...item, ...r.data };
            }
            return item;
          })
        );
        setLoading(false);
      })
      .catch(() => {});
  };

  const confirmUpload = async () => {
    api
      .put(`/products/gallery/${uuidProduct}/confirm`, {
        video_id: video.uuid,
      })
      .then(() =>
        setData((prevData) =>
          prevData.map((item) => {
            if (item.uuid === video.uuid) {
              return {
                ...item,
                uploading: false,
              };
            }
            return item;
          })
        )
      )
      .catch(() => {});
  };

  useEffect(() => {
    getUploadLink();
  }, []);

  useEffect(() => {
    if (video) {
      const upload = new tus.Upload(file, {
        uploadUrl: video.upload_link,
        onError: () => setControlProgress('error'),
        onProgress: (bytesUploaded, bytesTotal) =>
          setVideoSendProgress((bytesUploaded / bytesTotal) * 100),
        onSuccess: () => {
          setControlProgress('success');
          confirmUpload();
        },
      });
      upload.start();
    }
  }, [video]);

  const setVideoLesson = async (e) => {
    setData((prevData) =>
      prevData.map((item) => {
        if (item.uuid === video.uuid) {
          return {
            ...item,
            lesson_uuid: e.target.value,
          };
        }
        return item;
      })
    );
    api
      .put(`/products/gallery/${uuidProduct}/${video.uuid}`, {
        lesson_id: e.target.value,
      })
      .then(() =>
        notify({ message: 'Aula trocada com sucesso', type: 'success' })
      )
      .catch(() => notify({ message: 'Erro ao trocar aula', type: 'error' }));
  };

  const deleteVideo = async () => {
    setDeleting(true);
    api
      .delete(`/products/gallery/${uuidProduct}/${video.uuid}`)
      .then(() => {
        removeVideoFromArray(video.uuid);
        notify({ message: 'Vídeo deletado com sucesso', type: 'success' });
      })
      .catch((err) => {
        notify({
          message: err.response.data.message
            ? err.response.data.message
            : 'Erro ao deletar o vídeo',
          type: 'error',
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  return (
    <div
      className={`content-children video-children ${
        loading ? 'loading-video' : ''
      }`}
      onMouseEnter={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
    >
      <div className='item'>
        {loading ? (
          file.name
        ) : (
          <Title
            uuidProduct={uuidProduct}
            video={file}
            setData={setData}
            isShown={isShown}
          />
        )}
      </div>
      <div className='item'>
        {controlProgress === 'progress' && (
          <ProgressBar now={videoSendProgress} />
        )}
        {controlProgress === 'error' && (
          <div className='progress-error'>
            <i className='bx bxs-error-circle' />
            <span>Problema no envio</span>
          </div>
        )}
        {controlProgress === 'success' && (
          <div className='progress-success'>
            <i className='bx bxs-check-circle' />
            <span>Enviado</span>
          </div>
        )}
      </div>
      <div className='item'>
        <Form.Control
          name='release'
          as='select'
          className='select-input'
          onChange={(e) => setVideoLesson(e)}
          value={file.lesson_uuid}
        >
          <option value='0'>Selecionar aula</option>
          {lessons.map((item, index) => {
            return (
              <option key={index} value={item.uuid}>
                {item.title}
              </option>
            );
          })}
        </Form.Control>
      </div>
      <i
        className={
          deleting ? 'bx bx-loader-alt bx-spin' : 'bx bxs-trash-alt trash'
        }
        onClick={() => deleteVideo()}
      ></i>
    </div>
  );
};

export default VideoUpload;

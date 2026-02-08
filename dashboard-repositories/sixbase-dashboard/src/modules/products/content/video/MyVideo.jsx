import { useState } from 'react';
import { Form } from 'react-bootstrap';
import api from '../../../../providers/api';
import { notify } from '../../../functions';
import Title from './Title';

const MyVideo = ({
  uuidProduct,
  lessons,
  removeVideoFromArray,
  video,
  setData,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [isShown, setIsShown] = useState(false);

  const translateDurationToStringTime = (durationInSeconds) => {
    if (!durationInSeconds) return '00:00:00';
    const time = new Date(durationInSeconds * 1000).toISOString().substr(11, 8);
    const [hours, minutes, seconds] = time.split(':');
    return `${hours}:${minutes}:${seconds}`;
  };

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
      className={`content-children myvideo-children `}
      onMouseEnter={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
    >
      <div className='item'>
        <div className='my-videos-thumbnail'>
          <img src={video.thumbnail} />
          <div className='thumbnail-float'>
            {translateDurationToStringTime(video.duration)}
          </div>
        </div>
        <Title
          uuidProduct={uuidProduct}
          video={video}
          setData={setData}
          isShown={isShown}
        />
      </div>
      <div className='item'>
        <Form.Control
          id={video.uuid}
          name='release'
          as='select'
          className='select-input'
          onChange={(e) => setVideoLesson(e)}
          defaultValue={'0'}
          value={video.lesson_uuid}
        >
          <option value='0'>Selecionar aula</option>
          {lessons.map((item) => {
            return (
              <option key={item.uuid} value={item.uuid}>
                {item.title}
              </option>
            );
          })}
        </Form.Control>
        <i
          className={
            deleting
              ? 'delete bx bx-loader-alt bx-spin'
              : 'delete bx bxs-trash-alt trash'
          }
          onClick={() => deleteVideo()}
        ></i>
      </div>
    </div>
  );
};

export default MyVideo;

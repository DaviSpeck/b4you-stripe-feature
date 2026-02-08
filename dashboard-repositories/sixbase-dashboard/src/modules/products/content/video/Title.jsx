import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../../../providers/api';
import { notify } from '../../../functions';

const Title = ({ uuidProduct, video, setData, isShown = true }) => {
  const { register, handleSubmit, getValues } = useForm({
    mode: 'onChange',
  });
  const [inputShow, setInputShow] = useState(false);

  const setVideoName = async () => {
    const newTitle = getValues('video-title');
    setData((prevData) =>
      prevData.map((item) => {
        if (item === video) {
          return { ...item, title: newTitle };
        }
        return item;
      })
    );
    api
      .put(`/products/gallery/${uuidProduct}/${video.uuid}`, {
        title: newTitle,
      })
      .then(() => {
        notify({
          message: 'Título do vídeo trocado',
          type: 'success',
        });
      })
      .catch((err) => {
        notify({ message: err.response.data.message, type: 'error' });
      });
    setInputShow(false);
  };

  return inputShow ? (
    <div className='name-wrap'>
      <form onSubmit={handleSubmit(setVideoName)}>
        <Form.Control
          defaultValue={video.title}
          name='video-title'
          type='text'
          ref={register({ required: true })}
          autoFocus
        />
      </form>
      <div className='icons-wrap'>
        <i
          className='accept bx bx-check-circle'
          onClick={handleSubmit(setVideoName)}
        />
        <i
          className='decline bx bx-x-circle'
          onClick={() => setInputShow(false)}
        />
      </div>
    </div>
  ) : (
    <div className='name-wrap'>
      <div className='title'>{video.title}</div>
      <i
        className={isShown && 'bx bxs-pencil'}
        onClick={() => setInputShow(true)}
      />
    </div>
  );
};

export default Title;

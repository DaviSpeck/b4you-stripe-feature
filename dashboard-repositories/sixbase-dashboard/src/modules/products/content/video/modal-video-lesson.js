import { useEffect, useState } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../../../../providers/api';

const ModalVideoLesson = ({ setShow }) => {
  const { uuidProduct } = useParams();
  const [videos, setVideos] = useState([]);

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
      .catch(() => {});
  }, []);

  return (
    <Modal
      show={true}
      centered
      onHide={() => {
        setShow(false);
      }}
      size='lg'
      id='modal-video-lesson'
    >
      <Modal.Header closeButton>
        <Modal.Title>Selecionar Vídeo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            {videos &&
              videos.map((item) => (
                <div
                  className={`content-modal-video video-children `}
                  key={item.uuid}
                >
                  <div className='item'>
                    <div className='video-thumbnail'>
                      <img src={item.thumbnail} />
                      <div className='thumbnail-float'>
                        {translateDurationToStringTime(item.duration)}
                      </div>
                    </div>
                    <div className='name-wrap'>
                      <div className='item'>{item.title}</div>
                    </div>
                  </div>
                </div>
              ))}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default ModalVideoLesson;
